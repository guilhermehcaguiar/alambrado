import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  classifySync,
  scanCatalog,
  toCsv,
  toGeneratedCsvRow,
  type CatalogScanReport,
  type CatalogSyncState,
  type DiscoveredProduct,
  type GeneratedCsvRow,
  type SyncStateEntry,
} from "@/lib/catalogDiscovery";
import {
  CATALOG_EXPECTED_HEIGHT,
  CATALOG_EXPECTED_WIDTH,
} from "@/lib/validations/catalogImport";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "camisas");
const OUTPUT_DIR = process.env.CATALOG_DIR
  ? path.resolve(process.env.CATALOG_DIR)
  : path.join(ROOT, "catalogo");
const STATE_PATH = path.join(ROOT, "catalogo-processado", "catalog-discovery-state.json");
const REPORTS_DIR = path.join(ROOT, "catalogo-processado", "relatorios");
const GENERATED_CSV_PATH = path.join(ROOT, "catalogo.generated.csv");
const WEBP_QUALITY = 80;

type Flags = {
  dryRun: boolean;
  yes: boolean;
};

type PlannedStatus = "novo" | "alterado" | "igual" | "removido" | "falhou";

type PlannedItem = {
  slug: string;
  status: PlannedStatus;
  reason: string;
  product?: DiscoveredProduct;
  entry?: SyncStateEntry;
  webpPath?: string;
  webpBytes?: number;
  width?: number;
  height?: number;
  needsConvert?: boolean;
};

type DiscoveryTotals = {
  scanned: number;
  novo: number;
  alterado: number;
  igual: number;
  removido: number;
  converted: number;
  skipped: number;
  falhou: number;
};

type DiscoveryReport = {
  startedAt: string;
  finishedAt: string;
  mode: "generate" | "dry-run";
  sourceDir: string;
  totals: DiscoveryTotals;
  categories: string[];
  unknownCategories: string[];
  unknownModels: string[];
  warnings: string[];
  items: PlannedItem[];
};

function parseFlags(argv: string[]): Flags {
  return {
    dryRun: argv.includes("--dry-run"),
    yes: argv.includes("--yes"),
  };
}

function log(tag: string, message: string): void {
  console.log(`[${tag}] ${message}`);
}

function fileTimestamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(
    now.getHours(),
  )}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readPreviousState(): Promise<CatalogSyncState> {
  try {
    const text = await readFile(STATE_PATH, "utf8");
    const parsed = JSON.parse(text) as CatalogSyncState;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("estrutura inválida");
    }
    return parsed;
  } catch (error) {
    if (error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw new Error(
      `Não foi possível ler o estado de sincronização em "${STATE_PATH}": ${
        error instanceof Error ? error.message : "erro desconhecido"
      }.`,
    );
  }
}

function sortKey(product: DiscoveredProduct): string {
  return `${product.category}\u0000${product.slug}`;
}

function outputWebpPath(product: DiscoveredProduct): string {
  return path.join(OUTPUT_DIR, product.category, product.imageFilename);
}

async function convertToWebp(
  sourcePath: string,
  webpPath: string,
): Promise<{ width: number; height: number; bytes: number }> {
  await mkdir(path.dirname(webpPath), { recursive: true });
  const metadata = await sharp(sourcePath).metadata();
  const buffer = await sharp(sourcePath)
    .resize(CATALOG_EXPECTED_WIDTH, CATALOG_EXPECTED_HEIGHT, {
      fit: "inside",
      withoutEnlargement: false,
    })
    .webp({ quality: WEBP_QUALITY, alphaQuality: 100, effort: 4 })
    .toBuffer();
  await writeFile(webpPath, buffer);
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    bytes: buffer.length,
  };
}

function buildEmptyTotals(): DiscoveryTotals {
  return {
    scanned: 0,
    novo: 0,
    alterado: 0,
    igual: 0,
    removido: 0,
    converted: 0,
    skipped: 0,
    falhou: 0,
  };
}

function printPlan(scan: CatalogScanReport, planned: PlannedItem[]): void {
  console.log("");
  console.log(`Categorias encontradas: ${scan.categories.join(", ") || "(nenhuma)"}`);
  if (scan.unknownCategories.length > 0) {
    console.log(
      `Categorias desconhecidas (ignoradas): ${scan.unknownCategories.join(", ")}`,
    );
  }
  if (scan.unknownModels.length > 0) {
    console.log(
      `Modelos novos/desconhecidos (incluídos com nome genérico): ${scan.unknownModels.join(", ")}`,
    );
  }
  for (const warning of scan.warnings) {
    console.log(`AVISO: ${warning}`);
  }
  console.log("");

  for (const item of planned) {
    const extra =
      item.status === "removido"
        ? " (sugestão: available = false)"
        : item.webpBytes !== undefined
          ? ` — ${item.webpBytes} bytes`
          : "";
    log(item.status.toUpperCase(), `${item.slug} — ${item.reason}${extra}`);
  }
}

async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(message);
  rl.close();
  return /^(s|y|sim|yes)$/i.test(answer.trim());
}

async function writeReport(report: DiscoveryReport): Promise<string> {
  await mkdir(REPORTS_DIR, { recursive: true });
  const reportPath = path.join(REPORTS_DIR, `catalog-discovery-${fileTimestamp()}.json`);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

function printSummary(totals: DiscoveryTotals, reportPath?: string): void {
  console.log("");
  console.log(`Analisados: ${totals.scanned}`);
  console.log(`Novos: ${totals.novo}`);
  console.log(`Alterados: ${totals.alterado}`);
  console.log(`Iguais: ${totals.igual}`);
  console.log(`Removidos: ${totals.removido}`);
  console.log(`WebP convertidos: ${totals.converted}`);
  console.log(`WebP reaproveitados: ${totals.skipped}`);
  console.log(`Falhas: ${totals.falhou}`);
  if (reportPath) {
    console.log(`Relatório: ${reportPath}`);
  }
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const mode = flags.dryRun ? "dry-run" : "generate";

  const previous = await readPreviousState();
  const scan = await scanCatalog(SOURCE_DIR);

  const classified = await classifySync(scan.products, previous);
  const totals = buildEmptyTotals();
  totals.scanned = scan.products.length;

  const planned: PlannedItem[] = [];
  const rows: GeneratedCsvRow[] = [];
  const nextState: CatalogSyncState = {};

  const ordered = [...classified.items].sort((a, b) =>
    sortKey(a.product).localeCompare(sortKey(b.product)),
  );

  for (const item of ordered) {
    const product = item.product;
    const slug = product.slug;
    const webpPath = outputWebpPath(product);
    const webpExists = await exists(webpPath);

    const needsConvert =
      item.status === "novo" || item.status === "alterado" || !webpExists;

    if (item.status === "novo") {
      totals.novo++;
    } else if (item.status === "alterado") {
      totals.alterado++;
    } else {
      totals.igual++;
    }

    if (needsConvert) {
      totals.converted++;
    } else {
      totals.skipped++;
    }

    const reason = needsConvert
      ? `${item.reason}; imagem WebP será ${webpExists ? "regenerada" : "gerada"}`
      : item.reason;

    rows.push(toGeneratedCsvRow(product, true));
    nextState[slug] = {
      sourcePath: product.sourcePath,
      hash: item.hash,
      size: 0,
      row: toGeneratedCsvRow(product, true),
    };

    planned.push({
      slug,
      status: item.status,
      reason,
      product,
      webpPath,
      needsConvert,
    });
  }

  for (const removed of classified.removed) {
    totals.removido++;
    const row = { ...removed.entry.row, available: false };
    rows.push(row);
    nextState[removed.slug] = {
      ...removed.entry,
      removed: true,
      row,
    };
    planned.push({
      slug: removed.slug,
      status: "removido",
      reason: removed.reason,
      entry: removed.entry,
    });
  }

  rows.sort((a, b) => `${a.category}\u0000${a.slug}`.localeCompare(`${b.category}\u0000${b.slug}`));

  printPlan(scan, planned);

  if (flags.dryRun) {
    const reportPath = await writeReport({
      startedAt,
      finishedAt: new Date().toISOString(),
      mode,
      sourceDir: SOURCE_DIR,
      totals,
      categories: scan.categories,
      unknownCategories: scan.unknownCategories,
      unknownModels: scan.unknownModels,
      warnings: scan.warnings,
      items: planned,
    });
    console.log("");
    console.log("Dry-run concluído — nenhum arquivo foi alterado.");
    printSummary(totals, reportPath);
    return;
  }

  const actionCount = totals.converted;
  if (actionCount > 0) {
    const answer = flags.yes
      ? true
      : await confirm(
          `Confirmar geração do catálogo? ${actionCount} imagem(ns) será(ão) convertida(s) para WebP em "${OUTPUT_DIR}" e "catalogo.generated.csv" será reescrito. (s/N) `,
        );
    if (!answer) {
      console.log("Geração cancelada pelo usuário. Nenhum arquivo foi alterado.");
      process.exitCode = 1;
      return;
    }
  }

  const convertedItems: PlannedItem[] = [];

  for (const item of planned) {
    if (item.status === "removido" || !item.product || !item.webpPath) {
      convertedItems.push(item);
      continue;
    }
    if (!item.needsConvert) {
      convertedItems.push(item);
      continue;
    }
    try {
      const result = await convertToWebp(item.product.sourcePath, item.webpPath);
      item.webpBytes = result.bytes;
      item.width = result.width;
      item.height = result.height;
      convertedItems.push(item);
    } catch (error) {
      item.status = "falhou";
      item.reason = `erro ao converter: ${
        error instanceof Error ? error.message : "erro desconhecido"
      }`;
      totals.falhou++;
      totals.converted--;
      log("ERROR", `${item.slug} — ${item.reason}`);
    }
  }

  const successfulRows = rows.filter((row) => {
    const item = convertedItems.find((candidate) => candidate.slug === row.slug);
    return item && item.status !== "falhou";
  });

  await mkdir(path.dirname(GENERATED_CSV_PATH), { recursive: true });
  await writeFile(GENERATED_CSV_PATH, toCsv(successfulRows), "utf8");

  const finalState: CatalogSyncState = {};
  for (const item of convertedItems) {
    if (item.product && item.status !== "falhou") {
      finalState[item.slug] = {
        ...nextState[item.slug],
        size: item.webpBytes ?? 0,
      };
    } else if (item.entry) {
      finalState[item.slug] = nextState[item.slug];
    }
  }
  await mkdir(path.dirname(STATE_PATH), { recursive: true });
  await writeFile(STATE_PATH, `${JSON.stringify(finalState, null, 2)}\n`, "utf8");

  const reportPath = await writeReport({
    startedAt,
    finishedAt: new Date().toISOString(),
    mode,
    sourceDir: SOURCE_DIR,
    totals,
    categories: scan.categories,
    unknownCategories: scan.unknownCategories,
    unknownModels: scan.unknownModels,
    warnings: scan.warnings,
    items: convertedItems,
  });

  console.log("");
  console.log(`Catálogo gerado em: ${GENERATED_CSV_PATH}`);
  printSummary(totals, reportPath);

  if (totals.falhou > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  log("ERROR", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
