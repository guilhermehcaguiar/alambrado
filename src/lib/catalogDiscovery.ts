import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { PRICES } from "@/config/prices";
import { CATEGORY_LABELS, type ProductCategory } from "@/types/product";

export type CatalogCategory = ProductCategory;

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
export type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];

export const CATEGORY_FOLDER_MAP: Record<string, CatalogCategory> = {
  torcedor: "torcedor",
  "promocional-torcedor": "torcedor",
  jogador: "jogador",
  retro: "retro",
  infantil: "infantil",
};

const MODEL_LABELS: Record<string, string> = {
  home: "Home",
  away: "Away",
  third: "Third",
  goalkeeper: "Goleiro",
  special: "Especial",
  homewomen: "Home Feminina",
  awaywomen: "Away Feminina",
  thirdwomen: "Third Feminina",
  goalkeeperwomen: "Goleiro Feminina",
  specialwomen: "Especial Feminina",
  prematch: "Pré-Jogo",
  training: "Treino",
};

const CATEGORY_PRICES: Record<CatalogCategory, number> = {
  torcedor: PRICES.torcedor,
  infantil: PRICES.infantil,
  jogador: PRICES.jogador,
  retro: PRICES.retro,
};

export type SeasonInfo = { display: string; slugToken: string };

export function parseSeasonToken(token: string): SeasonInfo | null {
  const value = token.trim();
  if (!value || value.length > 8) {
    return null;
  }
  const pair = (a: string, b: string): SeasonInfo => ({
    display: `${a}/${b}`,
    slugToken: `${a}-${b}`,
  });
  const year = (y: string): SeasonInfo => ({ display: y, slugToken: y });
  let match: RegExpMatchArray | null;
  match = value.match(/^(20\d\d)-(20\d\d)$/);
  if (match) return pair(match[1], match[2]);
  match = value.match(/^(\d{2})-(\d{2})$/);
  if (match) return pair(match[1], match[2]);
  match = value.match(/^(20\d\d)(20\d\d)$/);
  if (match) return pair(match[1], match[2]);
  match = value.match(/^(\d{4})$/);
  if (match) {
    const numeric = Number(match[1]);
    if (numeric >= 1900 && numeric <= 2099) {
      return year(match[1]);
    }
    return pair(match[1].slice(0, 2), match[1].slice(2));
  }
  match = value.match(/^(\d{2})$/);
  if (match) {
    const numeric = Number(match[1]);
    return year(numeric >= 70 ? `19${match[1]}` : `20${match[1]}`);
  }
  return null;
}

export function slugifySegment(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(/(\s|-)+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type ModelFromFilename = { modelKey: string; seasonToken: string | null };

export function extractModelFromFilename(baseName: string): ModelFromFilename {
  const candidate = baseName.toLowerCase();
  for (const length of [6, 4, 2]) {
    if (candidate.length > length) {
      const tail = candidate.slice(-length);
      if (/^\d+$/.test(tail) && parseSeasonToken(tail)) {
        return { modelKey: candidate.slice(0, -length), seasonToken: tail };
      }
    }
  }
  return { modelKey: candidate, seasonToken: null };
}

export function resolveCategory(folderName: string): CatalogCategory | null {
  const key = folderName.toLowerCase();
  return CATEGORY_FOLDER_MAP[key] ?? null;
}

export type ClubAliasStatus = "matched" | "needs-review";

export type ClubResolution = {
  normalizedKey: string;
  displayName: string;
  slug: string;
  league: string;
  status: ClubAliasStatus;
};

export type ClubResolverContext = {
  country: string;
};

export type ClubResolver = (
  sourceFolder: string,
  context: ClubResolverContext,
) => ClubResolution | null;

export function normalizeClubKey(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function buildClubResolution(sourceFolder: string): ClubResolution {
  return {
    normalizedKey: normalizeClubKey(sourceFolder),
    displayName: titleCase(sourceFolder),
    slug: slugifySegment(sourceFolder),
    league: "",
    status: "needs-review",
  };
}

export type DiscoveredProduct = {
  slug: string;
  name: string;
  category: CatalogCategory;
  club: string;
  country: string;
  league: string;
  season: string;
  model: string;
  modelKey: string;
  price: number;
  description: string;
  featured: false;
  available: true;
  imageFilename: string;
  sourcePath: string;
  fileName: string;
  extension: ImageExtension;
  sourceClubFolder: string;
  normalizedClubKey: string;
  clubSlug: string;
  clubAliasStatus: ClubAliasStatus;
  legacyCategory: string;
};

type ProductBuildInput = {
  category: CatalogCategory;
  country: string;
  sourceClubFolder: string;
  clubResolution: ClubResolution;
  seasonToken: string | null;
  modelKey: string;
  sourcePath: string;
  fileName: string;
  extension: ImageExtension;
};

export function buildProduct(input: ProductBuildInput): DiscoveredProduct {
  const seasonInfo = input.seasonToken ? parseSeasonToken(input.seasonToken) : null;
  const seasonSlug = seasonInfo?.slugToken ?? "";
  const modelLabel = MODEL_LABELS[input.modelKey] ?? titleCase(input.modelKey);
  const slug = [input.clubResolution.slug, slugifySegment(modelLabel), seasonSlug]
    .filter(Boolean)
    .join("-");
  const clubDisplay = input.clubResolution.displayName;
  const seasonDisplay = seasonInfo?.display ?? "";
  const categoryLabel = CATEGORY_LABELS[input.category].toLowerCase();
  const seasonPart = seasonDisplay ? ` ${seasonDisplay}` : "";
  const name = `Camisa ${clubDisplay} ${modelLabel}${seasonPart}`;
  const description = `Camisa ${clubDisplay} ${modelLabel}${seasonPart} — versão ${categoryLabel} tailandesa 1:1.`;
  return {
    slug,
    name,
    category: input.category,
    club: clubDisplay,
    country: input.country,
    league: input.clubResolution.league,
    season: seasonDisplay,
    model: modelLabel,
    modelKey: input.modelKey,
    price: CATEGORY_PRICES[input.category],
    description,
    featured: false,
    available: true,
    imageFilename: `${slug}.webp`,
    sourcePath: input.sourcePath,
    fileName: input.fileName,
    extension: input.extension,
    sourceClubFolder: input.sourceClubFolder,
    normalizedClubKey: input.clubResolution.normalizedKey,
    clubSlug: input.clubResolution.slug,
    clubAliasStatus: input.clubResolution.status,
    legacyCategory: input.category === "torcedor" ? "promocional-torcedor" : input.category,
  };
}

type ImageFile = {
  path: string;
  fileName: string;
  base: string;
  extension: string;
  segments: string[];
};

async function collectImageFiles(dir: string, segments: string[]): Promise<ImageFile[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: ImageFile[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectImageFiles(full, [...segments, entry.name])));
    } else if (entry.isFile()) {
      const extension = path.extname(entry.name).slice(1).toLowerCase();
      files.push({
        path: full,
        fileName: entry.name,
        base: entry.name.slice(0, entry.name.length - path.extname(entry.name).length),
        extension,
        segments,
      });
    }
  }
  return files;
}

function isGuideAsset(fileName: string): boolean {
  return /^(medidas|cuidados)(?:\.|$)/i.test(fileName);
}

export type CatalogScanReport = {
  products: DiscoveredProduct[];
  categories: string[];
  unknownCategories: string[];
  countries: string[];
  clubs: string[];
  seasons: string[];
  models: string[];
  unknownModels: string[];
  imageExtensions: string[];
  collisions: string[];
  warnings: string[];
};

export async function scanCatalog(
  catalogRoot: string,
  resolveClub?: ClubResolver,
): Promise<CatalogScanReport> {
  const warnings: string[] = [];
  const products: DiscoveredProduct[] = [];
  const categories: string[] = [];
  const unknownCategories: string[] = [];
  const countries = new Set<string>();
  const clubs = new Set<string>();
  const seasons = new Set<string>();
  const models = new Set<string>();
  const unknownModels = new Set<string>();
  const imageExtensions = new Set<string>();

  const top = await readdir(catalogRoot, { withFileTypes: true });
  for (const entry of top) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name.toLowerCase() === "guide") {
      warnings.push(`Pasta "guide" ignorada (não é categoria de produto).`);
      continue;
    }
    const category = resolveCategory(entry.name);
    if (!category) {
      unknownCategories.push(entry.name);
      warnings.push(`Categoria desconhecida ignorada: "${entry.name}".`);
      continue;
    }
    categories.push(entry.name);
    const files = await collectImageFiles(path.join(catalogRoot, entry.name), []);
    for (const file of files) {
      imageExtensions.add(file.extension);
      if (!(IMAGE_EXTENSIONS as readonly string[]).includes(file.extension)) {
        continue;
      }
      if (isGuideAsset(file.fileName)) {
        warnings.push(`Ativo institucional ignorado: ${file.fileName}.`);
        continue;
      }
      const country = file.segments[0] ?? "";
      if (!country) {
        warnings.push(`Imagem sem país em "${file.fileName}". Ignorada.`);
        continue;
      }
      const clubIndex = file.segments.length >= 2 ? 1 : 0;
      const club = file.segments[clubIndex] ?? country;
      countries.add(country);
      clubs.add(club);
      const seasonSegments = file.segments.slice(clubIndex + 1);
      const folderSeason =
        seasonSegments
          .map((segment) => parseSeasonToken(segment)?.slugToken ?? null)
          .find((value): value is string => value !== null) ?? null;
      const { modelKey, seasonToken: fileSeason } = extractModelFromFilename(file.base);
      if (!modelKey) {
        warnings.push(`Modelo não identificado em "${file.fileName}". Ignorada.`);
        continue;
      }
      if (folderSeason && fileSeason && folderSeason !== fileSeason) {
        warnings.push(
          `Temporada divergente em "${file.fileName}" (pasta "${folderSeason}" vs arquivo "${fileSeason}"). Usando a da pasta.`,
        );
      }
      const seasonToken = folderSeason ?? fileSeason;
      if (seasonToken) {
        const info = parseSeasonToken(seasonToken);
        if (info) {
          seasons.add(info.display);
        }
      }
      const clubResolution =
        resolveClub?.(club, { country }) ?? buildClubResolution(club);
      if (clubResolution.status === "needs-review") {
        warnings.push(
          `Clube "${club}" sem alias — sugestão "${clubResolution.displayName}" (needs-review).`,
        );
      }
      const product = buildProduct({
        category,
        country,
        sourceClubFolder: club,
        clubResolution,
        seasonToken,
        modelKey,
        sourcePath: file.path,
        fileName: file.fileName,
        extension: file.extension as ImageExtension,
      });
      models.add(product.model);
      if (!MODEL_LABELS[product.modelKey]) {
        unknownModels.add(product.modelKey);
        warnings.push(
          `Modelo novo/desconhecido "${product.modelKey}" em "${file.fileName}" — incluído como "${product.model}".`,
        );
      }
      products.push(product);
    }
  }

  const bySlug = new Map<string, DiscoveredProduct[]>();
  for (const product of products) {
    const list = bySlug.get(product.slug) ?? [];
    list.push(product);
    bySlug.set(product.slug, list);
  }
  const collisions: string[] = [];
  const kept = new Set<string>();
  const deduped: DiscoveredProduct[] = [];
  for (const product of products) {
    const list = bySlug.get(product.slug) ?? [];
    if (list.length === 1) {
      deduped.push(product);
      continue;
    }
    if (kept.has(product.slug)) {
      continue;
    }
    kept.add(product.slug);
    deduped.push(product);
    collisions.push(
      `slug "${product.slug}" gerado por ${list.length} arquivos (${list
        .map((item) => item.fileName)
        .join(", ")}). Mantido o primeiro.`,
    );
  }
  for (const message of collisions) {
    warnings.push(message);
  }

  return {
    products: deduped,
    categories,
    unknownCategories,
    countries: [...countries].sort(),
    clubs: [...clubs].sort(),
    seasons: [...seasons].sort(),
    models: [...models].sort(),
    unknownModels: [...unknownModels].sort(),
    imageExtensions: [...imageExtensions].sort(),
    collisions,
    warnings,
  };
}

export async function hashFile(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  return createHash("sha256").update(buffer).digest("hex");
}

export const GENERATED_CSV_COLUMNS = [
  "slug",
  "name",
  "club",
  "season",
  "category",
  "description",
  "price",
  "image_filename",
  "featured",
  "available",
  "league",
  "source_club_folder",
  "normalized_club_key",
  "club_slug",
  "club_alias_status",
  "country",
  "model",
  "source_path",
  "legacy_category",
] as const;

export type GeneratedCsvRow = {
  slug: string;
  name: string;
  club: string;
  season: string;
  category: CatalogCategory;
  description: string;
  price: number;
  image_filename: string;
  featured: boolean;
  available: boolean;
  league: string;
  source_club_folder: string;
  normalized_club_key: string;
  club_slug: string;
  club_alias_status: ClubAliasStatus;
  country: string;
  model: string;
  source_path: string;
  legacy_category: string;
};

export function toGeneratedCsvRow(product: DiscoveredProduct, available = true): GeneratedCsvRow {
  return {
    slug: product.slug,
    name: product.name,
    club: product.club,
    season: product.season,
    category: product.category,
    description: product.description,
    price: product.price,
    image_filename: product.imageFilename,
    featured: product.featured,
    available,
    league: product.league,
    source_club_folder: product.sourceClubFolder,
    normalized_club_key: product.normalizedClubKey,
    club_slug: product.clubSlug,
    club_alias_status: product.clubAliasStatus,
    country: product.country,
    model: product.model,
    source_path: product.sourcePath,
    legacy_category: product.legacyCategory,
  };
}

export function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(rows: GeneratedCsvRow[]): string {
  const header = GENERATED_CSV_COLUMNS.join(",");
  const body = rows.map((row) =>
    GENERATED_CSV_COLUMNS.map((column) => escapeCsvField(String(row[column]))).join(","),
  );
  return [header, ...body].join("\n") + "\n";
}

export type SyncStateEntry = {
  sourcePath: string;
  hash: string;
  size: number;
  removed?: boolean;
  row: GeneratedCsvRow;
};

export type CatalogSyncState = Record<string, SyncStateEntry>;

export type SyncStatus = "novo" | "alterado" | "igual" | "removido";

export type ClassifiedProduct = {
  product: DiscoveredProduct;
  status: SyncStatus;
  reason: string;
  hash: string;
  converted?: boolean;
};

export type ClassifySyncResult = {
  items: ClassifiedProduct[];
  removed: Array<{ slug: string; entry: SyncStateEntry; reason: string }>;
};

export async function classifySync(
  products: DiscoveredProduct[],
  previous: CatalogSyncState,
): Promise<ClassifySyncResult> {
  const items: ClassifiedProduct[] = [];
  const removed: ClassifySyncResult["removed"] = [];

  for (const product of products) {
    const hash = await hashFile(product.sourcePath);
    const prior = previous[product.slug];
    if (!prior) {
      items.push({ product, status: "novo", reason: "produto novo na pasta", hash });
    } else if (prior.removed) {
      items.push({ product, status: "novo", reason: "produto reativado (estava marcado como removido)", hash });
    } else if (prior.hash !== hash) {
      items.push({ product, status: "alterado", reason: "arquivo original mudou (hash diferente)", hash });
    } else {
      items.push({ product, status: "igual", reason: "arquivo original inalterado", hash });
    }
  }

  const present = new Set(products.map((product) => product.slug));
  for (const [slug, entry] of Object.entries(previous)) {
    if (entry.removed) {
      continue;
    }
    if (!present.has(slug)) {
      removed.push({ slug, entry, reason: "produto não está mais presente na pasta" });
    }
  }

  return { items, removed };
}
