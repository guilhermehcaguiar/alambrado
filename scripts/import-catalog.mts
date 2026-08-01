import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CATALOG_CATEGORIES,
  CATALOG_EXPECTED_HEIGHT,
  CATALOG_EXPECTED_WIDTH,
  CATALOG_MAX_IMAGE_BYTES,
  buildEmptyTotals,
  missingRequiredColumns,
  parseCsv,
  planCatalogImport,
  readWebpDimensions,
  validateCatalog,
  type CatalogImportReport,
  type CatalogRow,
  type ExistingProduct,
  type PlannedItem,
} from "@/lib/validations/catalogImport";
import {
  getAdminSupabaseConfig,
  isAdminSupabaseConfigured,
} from "@/config/adminEnv";

const ROOT = process.cwd();
const CSV_PATH = process.env.CATALOG_CSV_PATH
  ? path.resolve(process.env.CATALOG_CSV_PATH)
  : path.join(ROOT, "catalogo.csv");
const CATALOG_DIR = process.env.CATALOG_DIR
  ? path.resolve(process.env.CATALOG_DIR)
  : path.join(ROOT, "catalogo");
const REPORTS_DIR = path.join(ROOT, "catalogo-processado", "relatorios");
const BUCKET = "products";
const STORAGE_CACHE_CONTROL = "3600";

type Flags = {
  validateOnly: boolean;
  dryRun: boolean;
  overwrite: boolean;
  continueOnError: boolean;
};

type Mode = CatalogImportReport["mode"];

type ImageInspection = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

type ReportItem = CatalogImportReport["items"][number];

function parseFlags(argv: string[]): Flags {
  const has = (flag: string) => argv.includes(flag);
  return {
    validateOnly: has("--validate-only"),
    dryRun: has("--dry-run"),
    overwrite: has("--overwrite"),
    continueOnError: has("--continue-on-error"),
  };
}

function resolveMode(flags: Flags): Mode {
  if (flags.overwrite) {
    return "overwrite";
  }
  if (flags.dryRun) {
    return "dry-run";
  }
  if (flags.validateOnly) {
    return "validate-only";
  }
  return "import";
}

function log(tag: string, message: string): void {
  console.log(`[${tag}] ${message}`);
}

function redact(message: string, secret: string): string {
  if (!secret) {
    return message;
  }
  return message.split(secret).join("[REDACTED]");
}

function fileTimestamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(
    now.getHours(),
  )}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

async function readCatalogCsv(): Promise<string> {
  let text: string;
  try {
    text = await readFile(CSV_PATH, "utf8");
  } catch {
    throw new Error(
      `Arquivo "catalogo.csv" não encontrado em ${CSV_PATH}. Copie "catalogo.example.csv" para "catalogo.csv" e preencha com seus produtos.`,
    );
  }
  return text;
}

async function scanAvailableImages(): Promise<Set<string>> {
  const available = new Set<string>();
  for (const category of [...CATALOG_CATEGORIES]) {
    let files: string[] = [];
    try {
      files = await readdir(path.join(CATALOG_DIR, category));
    } catch {
      continue;
    }
    for (const file of files) {
      if (/\.webp$/i.test(file)) {
        available.add(`${category}/${file}`);
      }
    }
  }
  return available;
}

function unreferencedImages(available: Set<string>, rows: CatalogRow[]): string[] {
  const referenced = new Set(rows.map((row) => `${row.category}/${row.image_filename}`));
  return [...available].filter((imagePath) => !referenced.has(imagePath));
}

async function inspectImage(
  cache: Map<string, ImageInspection>,
  storagePath: string,
): Promise<ImageInspection> {
  const cached = cache.get(storagePath);
  if (cached) {
    return cached;
  }

  const inspection: ImageInspection = { ok: true, errors: [], warnings: [] };

  try {
    const buffer = await readFile(path.join(CATALOG_DIR, storagePath));

    if (buffer.length === 0) {
      inspection.ok = false;
      inspection.errors.push("arquivo vazio (corrompido)");
    }

    if (buffer.length > CATALOG_MAX_IMAGE_BYTES) {
      inspection.ok = false;
      inspection.errors.push(`arquivo excede o limite de ${CATALOG_MAX_IMAGE_BYTES} bytes`);
    }

    const hasWebpHeader =
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";

    if (!hasWebpHeader) {
      inspection.ok = false;
      inspection.errors.push("não é um arquivo WebP válido (cabeçalho RIFF/WEBP ausente)");
    }

    if (hasWebpHeader) {
      const dimensions = readWebpDimensions(buffer);
      if (!dimensions) {
        inspection.warnings.push(
          "resolução não pôde ser verificada automaticamente; confirme 1200×1200 manualmente",
        );
      } else if (
        dimensions.width !== CATALOG_EXPECTED_WIDTH ||
        dimensions.height !== CATALOG_EXPECTED_HEIGHT
      ) {
        inspection.warnings.push(
          `resolução ${dimensions.width}×${dimensions.height}; o padrão esperado é ${CATALOG_EXPECTED_WIDTH}×${CATALOG_EXPECTED_HEIGHT} (confirme manualmente)`,
        );
      }
    }
  } catch (error) {
    inspection.ok = false;
    inspection.errors.push(
      `não foi possível ler o arquivo: ${error instanceof Error ? error.message : "erro desconhecido"}`,
    );
  }

  cache.set(storagePath, inspection);
  return inspection;
}

async function writeReport(report: CatalogImportReport): Promise<string> {
  await mkdir(REPORTS_DIR, { recursive: true });
  const reportPath = path.join(REPORTS_DIR, `catalog-import-${fileTimestamp()}.json`);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

function printSummary(totals: CatalogImportReport["totals"], reportPath?: string): void {
  console.log("");
  console.log(`Linhas: ${totals.rows}`);
  console.log(`Válidos: ${totals.valid}`);
  console.log(`Criados: ${totals.created}`);
  console.log(`Atualizados: ${totals.updated}`);
  console.log(`Sobrescritos: ${totals.overwritten}`);
  console.log(`Ignorados: ${totals.skipped}`);
  console.log(`Falhas: ${totals.failed}`);
  if (reportPath) {
    console.log(`Relatório: ${reportPath}`);
  }
}

async function fetchExistingProducts(
  supabase: SupabaseClient,
  secret: string,
): Promise<Map<string, ExistingProduct>> {
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    throw new Error(
      `Falha ao consultar produtos existentes: ${redact(error.message, secret)}`,
    );
  }

  const products = new Map<string, ExistingProduct>();
  for (const row of data ?? []) {
    products.set(row.slug, {
      slug: row.slug,
      name: row.name,
      club: row.club ?? "",
      season: row.season ?? "",
      category: row.category,
      description: row.description ?? "",
      price: Number(row.price),
      featured: Boolean(row.featured),
      available: Boolean(row.available),
      image_url: row.image_url ?? "",
    });
  }
  return products;
}

async function listStorageImages(
  supabase: SupabaseClient,
  secret: string,
): Promise<Set<string>> {
  const images = new Set<string>();
  for (const category of [...CATALOG_CATEGORIES]) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(category, { limit: 1000, offset: 0 });
    if (error) {
      throw new Error(
        `Falha ao listar objetos de "products/${category}": ${redact(error.message, secret)}`,
      );
    }
    for (const object of data ?? []) {
      images.add(`${category}/${object.name}`);
    }
  }
  return images;
}

async function executePlannedItem(
  supabase: SupabaseClient,
  planned: PlannedItem,
  rowBySlug: Map<string, CatalogRow>,
  existingImages: Set<string>,
  overwrite: boolean,
  secret: string,
): Promise<ReportItem> {
  const row = rowBySlug.get(planned.slug);
  if (!row) {
    throw new Error(`dados inválidos para o slug "${planned.slug}"`);
  }

  const imageWasPreexisting = existingImages.has(planned.storagePath);
  const safeToRemove = planned.needsUpload && !imageWasPreexisting;

  let imageUrl = "";

  if (planned.needsUpload) {
    log("UPLOAD", planned.storagePath);
    const buffer = await readFile(path.join(CATALOG_DIR, planned.storagePath));
    const { error } = await supabase.storage.from(BUCKET).upload(planned.storagePath, buffer, {
      upsert: overwrite,
      contentType: "image/webp",
      cacheControl: STORAGE_CACHE_CONTROL,
    });
    if (error) {
      throw new Error(
        `falha no upload de "${planned.storagePath}": ${redact(error.message, secret)}`,
      );
    }
    imageUrl = supabase.storage.from(BUCKET).getPublicUrl(planned.storagePath).data.publicUrl;
  } else if (imageWasPreexisting) {
    imageUrl = supabase.storage.from(BUCKET).getPublicUrl(planned.storagePath).data.publicUrl;
  }

  const payload = {
    name: row.name,
    slug: row.slug,
    club: row.club,
    season: row.season,
    category: row.category,
    description: row.description,
    price: row.price,
    image_url: imageUrl,
    featured: row.featured,
    available: row.available,
  };

  let dbError: { message: string } | null = null;
  if (planned.status === "created") {
    const { error } = await supabase.from("products").insert(payload);
    dbError = error;
  } else {
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("slug", planned.slug);
    dbError = error;
  }

  if (dbError) {
    const message = redact(dbError.message, secret);
    if (safeToRemove) {
      const { error: removeError } = await supabase.storage
        .from(BUCKET)
        .remove([planned.storagePath]);
      throw new Error(
        removeError
          ? `${message}; a imagem enviada não pôde ser removida (possível órfão)`
          : `${message}; a imagem enviada foi removida para evitar órfão`,
      );
    }
    if (imageWasPreexisting) {
      throw new Error(
        `${message}; a imagem preexistente não foi removida (regra de segurança)`,
      );
    }
    throw new Error(message);
  }

  return {
    slug: planned.slug,
    imageFilename: planned.imageFilename,
    status: planned.status,
    message: planned.message,
    imageUrl,
  };
}

function logPlanned(planned: PlannedItem): void {
  const tag =
    planned.status === "created"
      ? "CREATE"
      : planned.status === "overwritten"
        ? "OVERWRITE"
        : planned.status === "skipped"
          ? "SKIP"
          : "UPDATE";
  log(tag, `${planned.slug} — ${planned.message}`);
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const mode = resolveMode(flags);

  if (flags.validateOnly && flags.dryRun) {
    throw new Error("--validate-only e --dry-run não podem ser usados juntos.");
  }
  if (flags.validateOnly && flags.overwrite) {
    throw new Error("--validate-only e --overwrite não podem ser usados juntos.");
  }

  if (mode !== "validate-only" && !isAdminSupabaseConfigured()) {
    throw new Error(
      "Credenciais do Supabase ausentes. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local antes de executar esta operação. Use --validate-only para validar o catálogo sem acessar o Supabase.",
    );
  }

  const startedAt = new Date().toISOString();
  const text = await readCatalogCsv();
  const parsed = parseCsv(text);
  if (parsed.error) {
    throw new Error(`Erro no CSV: ${parsed.error}`);
  }

  const missingColumns = missingRequiredColumns(parsed.header);
  if (missingColumns.length > 0) {
    throw new Error(
      `Colunas obrigatórias ausentes no CSV: ${missingColumns.join(", ")}. Use "catalogo.example.csv" como modelo.`,
    );
  }

  const availableImages = await scanAvailableImages();
  const validation = validateCatalog(parsed.header, parsed.rows, availableImages);

  const inspectionCache = new Map<string, ImageInspection>();
  for (const validRow of validation.rows) {
    const storagePath = `${validRow.row.category}/${validRow.row.image_filename}`;
    const inspection = await inspectImage(inspectionCache, storagePath);
    for (const warning of inspection.warnings) {
      log("WARN", `${validRow.row.slug} — ${warning}`);
    }
  }

  const totals = buildEmptyTotals();
  totals.rows = validation.rowCount;
  totals.valid = validation.validCount;

  const unref = unreferencedImages(availableImages, validation.rows.map((r) => r.row));
  for (const imagePath of unref) {
    log("WARN", `imagem em "catalogo/${imagePath}" não referenciada no CSV`);
  }

  if (!validation.ok) {
    for (const error of validation.errors) {
      log("ERROR", error);
    }
    if (mode === "validate-only") {
      const report: CatalogImportReport = {
        startedAt,
        finishedAt: new Date().toISOString(),
        mode: "validate-only",
        totals: {
          ...totals,
          failed: validation.rowCount - validation.validCount,
        },
        items: validation.rows.map((validRow) => ({
          slug: validRow.row.slug,
          imageFilename: validRow.row.image_filename,
          status: "valid",
        })),
      };
      const reportPath = await writeReport(report);
      printSummary(report.totals, reportPath);
      process.exitCode = 1;
      return;
    }
    throw new Error(
      `${validation.errors.length} erro(s) no catálogo. Nenhuma alteração foi feita no Supabase. Corrija e rode novamente.`,
    );
  }

  if (mode === "validate-only") {
    for (const validRow of validation.rows) {
      log("VALID", validRow.row.slug);
    }
    const report: CatalogImportReport = {
      startedAt,
      finishedAt: new Date().toISOString(),
      mode: "validate-only",
      totals,
      items: validation.rows.map((validRow) => ({
        slug: validRow.row.slug,
        imageFilename: validRow.row.image_filename,
        status: "valid",
      })),
    };
    const reportPath = await writeReport(report);
    printSummary(report.totals, reportPath);
    return;
  }

  const { supabaseUrl, serviceRoleKey } = getAdminSupabaseConfig();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const existingProducts = await fetchExistingProducts(supabase, serviceRoleKey);
  const existingImages = await listStorageImages(supabase, serviceRoleKey);

  const plan = planCatalogImport(
    validation.rows.map((validRow) => validRow.row),
    existingProducts,
    existingImages,
    flags.overwrite,
  );

  const rowBySlug = new Map(validation.rows.map((r) => [r.row.slug, r.row]));

  if (mode === "dry-run") {
    for (const planned of plan) {
      logPlanned(planned);
    }
    const report: CatalogImportReport = {
      startedAt,
      finishedAt: new Date().toISOString(),
      mode: "dry-run",
      totals,
      items: plan.map((planned) => ({
        slug: planned.slug,
        imageFilename: planned.imageFilename,
        status: planned.status,
        message: planned.message,
      })),
    };
    const reportPath = await writeReport(report);
    printSummary(report.totals, reportPath);
    return;
  }

  const items: ReportItem[] = [];
  let interrupted = false;
  let failedCount = 0;

  for (const planned of plan) {
    if (interrupted) {
      totals.skipped++;
      items.push({
        slug: planned.slug,
        imageFilename: planned.imageFilename,
        status: "skipped",
        message: "não processado (interrompido após erro anterior; use --continue-on-error)",
      });
      continue;
    }

    try {
      const item = await executePlannedItem(
        supabase,
        planned,
        rowBySlug,
        existingImages,
        flags.overwrite,
        serviceRoleKey,
      );
      items.push(item);
      totals[item.status]++;
      logPlanned(planned);
    } catch (error) {
      failedCount++;
      totals.failed++;
      const message = redact(
        error instanceof Error ? error.message : String(error),
        serviceRoleKey,
      );
      items.push({
        slug: planned.slug,
        imageFilename: planned.imageFilename,
        status: "failed",
        message,
      });
      log("ERROR", `${planned.slug} — ${message}`);
      if (!flags.continueOnError) {
        interrupted = true;
      }
    }
  }

  const report: CatalogImportReport = {
    startedAt,
    finishedAt: new Date().toISOString(),
    mode,
    totals,
    items,
  };
  const reportPath = await writeReport(report);
  printSummary(report.totals, reportPath);

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  log("ERROR", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
