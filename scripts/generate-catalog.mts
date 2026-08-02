import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  classifySync,
  normalizeClubKey,
  scanCatalog,
  toCsv,
  toGeneratedCsvRow,
  type CatalogSyncState,
  type ClubResolution,
  type DiscoveredProduct,
  type GeneratedCsvRow,
} from "@/lib/catalogDiscovery";
import {
  CATALOG_EXPECTED_HEIGHT,
  CATALOG_EXPECTED_WIDTH,
} from "@/lib/validations/catalogImport";
import { CLUB_ALIASES } from "@/config/club-aliases";
import { CLUB_LEAGUES } from "@/config/club-leagues";
import { COMPETITIONS } from "@/config/competitions";
import { NATIONAL_TEAMS } from "@/config/national-teams";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "camisas");
const OUTPUT_DIR = process.env.CATALOG_DIR
  ? path.resolve(process.env.CATALOG_DIR)
  : path.join(ROOT, "catalogo");
const STATE_PATH = path.join(ROOT, "catalogo-processado", "catalog-discovery-state.json");
const REPORTS_DIR = path.join(ROOT, "catalogo-processado", "relatorios");
const GENERATED_CSV_PATH = path.join(ROOT, "catalogo.generated.csv");
const WEBP_QUALITY = 85;

type Flags = {
  dryRun: boolean;
  yes: boolean;
};

type DiscoveryTotals = {
  scanned: number;
  converted: number;
  falhou: number;
  legacyWebpEncontrados: number;
  legacyWebpRemovidos: number;
  legacyWebpPreservados: number;
  csvAnteriorRemovido: boolean;
  csvNovoGerado: boolean;
  estadoAnteriorRemovido: boolean;
  sugestoesRemovidas: number;
};

type DiscoveryReport = {
  startedAt: string;
  finishedAt: string;
  mode: "generate" | "dry-run";
  sourceDir: string;
  blockers: string[];
  totals: DiscoveryTotals;
  categories: string[];
  categoriesLegadas: string[];
  clubesReconhecidos: string[];
  clubesPendentes: string[];
  modelosDesconhecidos: string[];
  avisos: string[];
  itens: Array<{
    slug: string;
    status: string;
    club: string;
    clubAliasStatus: string;
    sourcePath: string;
    webpBytes?: number;
  }>;
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

function resolveClubForFolder(
  sourceFolder: string,
  context: { country: string },
): ClubResolution | null {
  const key = normalizeClubKey(sourceFolder);
  const competitionKey = normalizeClubKey(context.country);
  const competition = Object.entries(COMPETITIONS).find(
    ([entry]) => normalizeClubKey(entry) === competitionKey,
  )?.[1];
  if (competition) {
    const nationalTeam = NATIONAL_TEAMS[key];
    if (!nationalTeam) {
      return null;
    }
    return {
      normalizedKey: key,
      displayName: nationalTeam.displayName,
      slug: nationalTeam.slug,
      league: competition,
      status: "matched",
    };
  }
  const alias = CLUB_ALIASES[key];
  if (!alias) {
    return null;
  }
  return {
    normalizedKey: key,
    displayName: alias.displayName,
    slug: alias.slug,
    league: CLUB_LEAGUES[key] ?? "",
    status: "matched",
  };
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
      withoutEnlargement: true,
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
    converted: 0,
    falhou: 0,
    legacyWebpEncontrados: 0,
    legacyWebpRemovidos: 0,
    legacyWebpPreservados: 0,
    csvAnteriorRemovido: false,
    csvNovoGerado: false,
    estadoAnteriorRemovido: false,
    sugestoesRemovidas: 0,
  };
}

async function walkFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function inventoryCleanup(): Promise<{
  allWebp: number;
  legacyWebp: number;
  csvExists: boolean;
  stateExists: boolean;
  prepReports: string[];
}> {
  const allWebp = (await walkFiles(OUTPUT_DIR)).filter((file) =>
    file.toLowerCase().endsWith(".webp"),
  );
  const legacyDir = path.join(OUTPUT_DIR, "promocional-torcedor");
  const legacyWebp = (await walkFiles(legacyDir)).filter((file) =>
    file.toLowerCase().endsWith(".webp"),
  );
  const reports = await walkFiles(REPORTS_DIR);
  const prepReports = reports.filter((file) =>
    /preparacao-catalogo-.*\.(json|csv)$/i.test(path.basename(file)),
  );
  return {
    allWebp: allWebp.length,
    legacyWebp: legacyWebp.length,
    csvExists: await exists(GENERATED_CSV_PATH),
    stateExists: await exists(STATE_PATH),
    prepReports,
  };
}

function validateBlockers(products: DiscoveredProduct[]): string[] {
  const errors: string[] = [];
  const slugSeen = new Map<string, string>();
  const nameSeen = new Map<string, string>();
  const webpSeen = new Map<string, string>();
  const needReviewClubs = new Set<string>();

  for (const product of products) {
    const priorSlug = slugSeen.get(product.slug);
    if (priorSlug) {
      errors.push(
        `slug duplicado: "${product.slug}" (origens "${priorSlug}" e "${product.sourcePath}")`,
      );
    } else {
      slugSeen.set(product.slug, product.sourcePath);
    }

    const priorName = nameSeen.get(product.name);
    if (priorName) {
      errors.push(`nome final duplicado: "${product.name}"`);
    } else {
      nameSeen.set(product.name, product.slug);
    }

    const webp = `${product.category}/${product.imageFilename}`;
    const priorWebp = webpSeen.get(webp);
    if (priorWebp) {
      errors.push(`colisão de WebP: "${webp}" (slugs "${priorWebp}" e "${product.slug}")`);
    } else {
      webpSeen.set(webp, product.slug);
    }

    if (product.clubAliasStatus === "needs-review") {
      needReviewClubs.add(product.sourceClubFolder);
    }
  }

  for (const club of needReviewClubs) {
    errors.push(`clube needs-review: "${club}" sem alias em CLUB_ALIASES`);
  }

  const slugToNames = new Map<string, Set<string>>();
  for (const alias of Object.values(CLUB_ALIASES)) {
    if (!slugToNames.has(alias.slug)) {
      slugToNames.set(alias.slug, new Set());
    }
    slugToNames.get(alias.slug)?.add(alias.displayName);
  }
  for (const [slug, names] of slugToNames) {
    if (names.size > 1) {
      errors.push(`alias ambíguo: slug "${slug}" aponta para ${[...names].join(", ")}`);
    }
  }

  return errors;
}

async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(message);
  rl.close();
  return /^(s|y|sim|yes)$/i.test(answer.trim());
}

async function writeReport(report: DiscoveryReport): Promise<string> {
  await mkdir(REPORTS_DIR, { recursive: true });
  const reportPath = path.join(REPORTS_DIR, `preparacao-catalogo-${fileTimestamp()}.json`);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

function sortKey(product: DiscoveredProduct): string {
  return `${product.category}\u0000${product.slug}`;
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const mode = flags.dryRun ? "dry-run" : "generate";

  const previous = await readPreviousState();
  const scan = await scanCatalog(SOURCE_DIR, resolveClubForFolder);
  const classified = await classifySync(scan.products, previous);

  const blockers = validateBlockers(scan.products);

  const recognizedClubs = new Set<string>();
  const pendingClubs = new Set<string>();
  for (const product of scan.products) {
    if (product.clubAliasStatus === "matched") {
      recognizedClubs.add(product.club);
    } else {
      pendingClubs.add(product.club);
    }
  }

  const legacyCategories = [...new Set(scan.products.map((product) => product.legacyCategory))]
    .filter((value) => value === "promocional-torcedor");

  const cleanup = await inventoryCleanup();
  const totals = buildEmptyTotals();
  totals.scanned = scan.products.length;
  totals.legacyWebpEncontrados = cleanup.legacyWebp;
  totals.csvAnteriorRemovido = false;
  totals.estadoAnteriorRemovido = false;

  const ordered = [...scan.products].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

  console.log("");
  console.log(`Fonte: ${SOURCE_DIR}`);
  console.log(`Categorias encontradas: ${scan.categories.join(", ") || "(nenhuma)"}`);
  if (legacyCategories.length > 0) {
    console.log(`Categoria legada encontrada na origem: ${legacyCategories.join(", ")}`);
  }
  console.log(`Categoria canônica aplicada: torcedor (alias de "promocional-torcedor")`);
  console.log(`Clubes reconhecidos: ${recognizedClubs.size}`);
  if (pendingClubs.size > 0) {
    console.log(`Clubes pendentes (needs-review): ${[...pendingClubs].sort().join(", ")}`);
  }
  for (const warning of scan.warnings) {
    console.log(`AVISO: ${warning}`);
  }
  console.log("");
  console.log("Artefatos a regenerar/remover (somente em catalogo/ e catalogo-processado/):");
  console.log(`  WebP encontrados em catalogo/: ${cleanup.allWebp}`);
  console.log(`  WebP legados em catalogo/promocional-torcedor/: ${cleanup.legacyWebp}`);
  console.log(`  catalogo.generated.csv existe: ${cleanup.csvExists ? "sim" : "não"}`);
  console.log(`  estado incremental existe: ${cleanup.stateExists ? "sim" : "não"}`);
  if (cleanup.prepReports.length > 0) {
    console.log(`  relatórios de preparação antigos: ${cleanup.prepReports.length}`);
  }
  console.log("");

  if (blockers.length > 0) {
    console.log("Validações bloqueantes:");
    for (const blocker of blockers) {
      console.log(`  ERRO: ${blocker}`);
    }
    const reportPath = await writeReport({
      startedAt,
      finishedAt: new Date().toISOString(),
      mode,
      sourceDir: SOURCE_DIR,
      blockers,
      totals,
      categories: scan.categories,
      categoriesLegadas: legacyCategories,
      clubesReconhecidos: [...recognizedClubs].sort(),
      clubesPendentes: [...pendingClubs].sort(),
      modelosDesconhecidos: scan.unknownModels,
      avisos: scan.warnings,
      itens: [],
    });
    console.log("");
    console.log(`Nenhuma alteração foi feita. Relatório: ${reportPath}`);
    process.exitCode = 1;
    return;
  }

  const convertedItems: Array<{
    product: DiscoveredProduct;
    status: string;
    hash: string;
  }> = [];

  if (flags.dryRun) {
    const dryItems = ordered.map((product) => {
      const item = classified.items.find((candidate) => candidate.product.slug === product.slug);
      return {
        slug: product.slug,
        status: item?.status ?? "novo",
        club: product.club,
        clubAliasStatus: product.clubAliasStatus,
        sourcePath: product.sourcePath,
      };
    });
    const reportPath = await writeReport({
      startedAt,
      finishedAt: new Date().toISOString(),
      mode: "dry-run",
      sourceDir: SOURCE_DIR,
      blockers: [],
      totals,
      categories: scan.categories,
      categoriesLegadas: legacyCategories,
      clubesReconhecidos: [...recognizedClubs].sort(),
      clubesPendentes: [...pendingClubs].sort(),
      modelosDesconhecidos: scan.unknownModels,
      avisos: scan.warnings,
      itens: dryItems,
    });
    console.log(`Plano: regenerar ${scan.products.length} WebP (qualidade ${WEBP_QUALITY}, lado máximo 1200px, sem ampliar).`);
    console.log("Dry-run concluído — nenhum arquivo foi alterado.");
    console.log(`Relatório: ${reportPath}`);
    return;
  }

  const answer = flags.yes
    ? true
    : await confirm(
        `Confirmar regeneração completa? Serão convertidos ${scan.products.length} WebP em "${OUTPUT_DIR}" e os artefatos gerados serão recriados. (s/N) `,
      );
  if (!answer) {
    console.log("Regeneração cancelada pelo usuário. Nenhum arquivo foi alterado.");
    process.exitCode = 1;
    return;
  }

  for (const prepReport of cleanup.prepReports) {
    await rm(prepReport, { force: true });
  }
  if (cleanup.stateExists) {
    await rm(STATE_PATH, { force: true });
    totals.estadoAnteriorRemovido = true;
  }
  if (cleanup.csvExists) {
    await rm(GENERATED_CSV_PATH, { force: true });
    totals.csvAnteriorRemovido = true;
  }

  const hashBySlug = new Map(
    classified.items.map((item) => [item.product.slug, item.hash] as const),
  );

  for (const product of ordered) {
    try {
      const result = await convertToWebp(product.sourcePath, outputWebpPath(product));
      totals.converted++;
      convertedItems.push({ product, status: "ok", hash: hashBySlug.get(product.slug) ?? "" });
      if (result.width === 0 || result.height === 0) {
        log("WARN", `${product.slug} — dimensões desconhecidas do original`);
      }
    } catch (error) {
      totals.falhou++;
      convertedItems.push({
        product,
        status: "falhou",
        hash: hashBySlug.get(product.slug) ?? "",
      });
      log("ERROR", `${product.slug} — erro ao converter: ${
        error instanceof Error ? error.message : "erro desconhecido"
      }`);
    }
  }

  const expectedWebp = new Set(
    convertedItems
      .filter((item) => item.status === "ok")
      .map((item) => `${item.product.category}/${item.product.imageFilename}`),
  );

  let legacyRemoved = 0;
  if (totals.falhou === 0) {
    const legacyDir = path.join(OUTPUT_DIR, "promocional-torcedor");
    const legacyFiles = (await walkFiles(legacyDir)).filter((file) =>
      file.toLowerCase().endsWith(".webp"),
    );
    for (const file of legacyFiles) {
      await rm(file, { force: true });
      legacyRemoved++;
    }
    await rm(legacyDir, { recursive: true, force: true });

    const stale = (await walkFiles(OUTPUT_DIR))
      .filter((file) => file.toLowerCase().endsWith(".webp"))
      .filter((file) => {
        const relative = path.relative(OUTPUT_DIR, file);
        return !expectedWebp.has(relative.split(path.sep).join("/"));
      });
    for (const file of stale) {
      await rm(file, { force: true });
      legacyRemoved++;
    }
  } else {
    totals.legacyWebpPreservados = cleanup.legacyWebp;
    log(
      "WARN",
      `${totals.falhou} conversão(ões) falharam. WebP legados preservados (nada foi apagado).`,
    );
  }
  totals.legacyWebpRemovidos = legacyRemoved;

  const rows: GeneratedCsvRow[] = [];
  const state: CatalogSyncState = {};
  for (const item of convertedItems) {
    if (item.status !== "ok") {
      continue;
    }
    const row = toGeneratedCsvRow(item.product, true);
    rows.push(row);
    state[item.product.slug] = {
      sourcePath: item.product.sourcePath,
      hash: item.hash,
      size: 0,
      row,
    };
  }

  for (const removed of classified.removed) {
    const legacy = removed.entry.row;
    const row = {
      ...legacy,
      category: (legacy.category as string) === "promocional-torcedor" ? "torcedor" : legacy.category,
      available: false,
    };
    rows.push(row);
    state[removed.slug] = {
      ...removed.entry,
      removed: true,
      row,
    };
    totals.sugestoesRemovidas++;
  }

  rows.sort((a, b) => `${a.category}\u0000${a.slug}`.localeCompare(`${b.category}\u0000${b.slug}`));

  await mkdir(path.dirname(GENERATED_CSV_PATH), { recursive: true });
  await writeFile(GENERATED_CSV_PATH, toCsv(rows), "utf8");
  totals.csvNovoGerado = true;

  await mkdir(path.dirname(STATE_PATH), { recursive: true });
  await writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");

  const reportPath = await writeReport({
    startedAt,
    finishedAt: new Date().toISOString(),
    mode: "generate",
    sourceDir: SOURCE_DIR,
    blockers: [],
    totals,
    categories: scan.categories,
    categoriesLegadas: legacyCategories,
    clubesReconhecidos: [...recognizedClubs].sort(),
    clubesPendentes: [...pendingClubs].sort(),
    modelosDesconhecidos: scan.unknownModels,
    avisos: scan.warnings,
    itens: convertedItems.map((item) => ({
      slug: item.product.slug,
      status: item.status,
      club: item.product.club,
      clubAliasStatus: item.product.clubAliasStatus,
      sourcePath: item.product.sourcePath,
    })),
  });

  console.log("");
  console.log("Relatório final:");
  console.log(`  WebP antigos encontrados: ${totals.legacyWebpEncontrados}`);
  console.log(`  WebP novos gerados em catalogo/torcedor (e demais): ${totals.converted}`);
  console.log(`  WebP antigos preservados por falha: ${totals.legacyWebpPreservados}`);
  console.log(`  WebP antigos removidos após verificação: ${totals.legacyWebpRemovidos}`);
  console.log(`  CSV anterior removido: ${totals.csvAnteriorRemovido ? "sim" : "não"}`);
  console.log(`  Novo CSV gerado: ${totals.csvNovoGerado ? "sim" : "não"}`);
  console.log(`  Estado incremental anterior removido: ${totals.estadoAnteriorRemovido ? "sim" : "não"}`);
  console.log(`  Sugestões de produtos removidos (available=false): ${totals.sugestoesRemovidas}`);
  console.log(`  Categoria legada encontrada: ${legacyCategories.length > 0 ? "promocional-torcedor" : "nenhuma"}`);
  console.log(`  Categoria canônica aplicada: torcedor`);
  console.log(`  Rota canônica: /catalogo/torcedor (legada redireciona com 308)`);
  console.log(`  Migration criada: supabase/migrations/0003_rename_promocional_torcedor_to_torcedor.sql`);
  console.log(`  Bucket (Storage): não acessado nesta etapa`);
  console.log(`  Nenhuma imagem perdida: ${totals.falhou === 0 ? "confirmado" : "NÃO — rever conversões"}`);
  console.log(`Relatório completo: ${reportPath}`);

  if (totals.falhou > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  log("ERROR", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
