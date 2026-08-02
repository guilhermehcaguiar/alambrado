import { z } from "zod";
import { normalizeCategory, PRODUCT_CATEGORIES, type ProductCategory } from "@/types/product";

export const CATALOG_CATEGORIES = PRODUCT_CATEGORIES;

export const CATALOG_ACCEPTED_CATEGORIES = [
  ...PRODUCT_CATEGORIES,
  "promocional-torcedor",
] as const;

export const REQUIRED_CATALOG_COLUMNS = [
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
] as const;

export const OPTIONAL_CATALOG_COLUMNS = ["league"] as const;

export const CATALOG_MAX_IMAGE_BYTES = 500_000;
export const CATALOG_EXPECTED_WIDTH = 1200;
export const CATALOG_EXPECTED_HEIGHT = 1200;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_FILENAME_RE = /^[A-Za-z0-9_-]+\.webp$/i;
const PRICE_RE = /^\d+(?:\.\d{1,2})?$/;

export type CatalogRow = {
  slug: string;
  name: string;
  club: string;
  season: string;
  category: (typeof PRODUCT_CATEGORIES)[number];
  description: string;
  price: number;
  image_filename: string;
  featured: boolean;
  available: boolean;
  league: string;
};

export type CatalogRowInput = Record<string, string>;

const catalogRowSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "slug vazio")
    .regex(SLUG_RE, "slug inválido (use kebab-case: letras minúsculas, números e hífens)"),
  name: z.string().trim().min(1, "nome vazio").max(200, "nome muito longo"),
  club: z.string().trim().min(1, "clube vazio").max(120, "clube muito longo"),
  season: z.string().trim().max(80, "temporada muito longa"),
  league: z.string().trim().max(80, "liga muito longa").optional(),
  category: z
    .string()
    .trim()
    .pipe(z.enum(CATALOG_ACCEPTED_CATEGORIES, "categoria inválida"))
    .transform((value): ProductCategory => normalizeCategory(value) ?? "torcedor"),
  description: z
    .string()
    .trim()
    .min(1, "descrição vazia")
    .max(2000, "descrição muito longa"),
  price: z
    .string()
    .trim()
    .regex(PRICE_RE, "preço inválido (use número decimal positivo, ex.: 119.90)")
    .refine((value) => Number(value) > 0, "preço deve ser maior que zero"),
  image_filename: z
    .string()
    .trim()
    .min(1, "nome da imagem vazio")
    .regex(IMAGE_FILENAME_RE, "nome de imagem inválido (use letras/números/hífens e termine em .webp)"),
  featured: z
    .string()
    .trim()
    .regex(/^(true|false)$/i, "featured deve ser true ou false"),
  available: z
    .string()
    .trim()
    .regex(/^(true|false)$/i, "available deve ser true ou false"),
});

export type CatalogRowValidation =
  | { ok: true; row: CatalogRow }
  | { ok: false; errors: string[] };

export function validateCatalogRow(input: CatalogRowInput): CatalogRowValidation {
  const result = catalogRowSchema.safeParse(input);
  if (!result.success) {
    const flattened = result.error.flatten();
    const errors = [
      ...flattened.formErrors,
      ...Object.values(flattened.fieldErrors).flat(),
    ].filter(Boolean);
    return { ok: false, errors };
  }
  return {
    ok: true,
    row: {
      ...result.data,
      price: Number(result.data.price),
      featured: result.data.featured.toLowerCase() === "true",
      available: result.data.available.toLowerCase() === "true",
      league: result.data.league ?? "",
    },
  };
}

export type CsvRow = {
  line: number;
  values: string[];
};

export type CsvParseResult = {
  header: string[];
  rows: CsvRow[];
  error?: string;
};

export function parseCsv(text: string): CsvParseResult {
  const source = text.replace(/^\uFEFF/, "");
  const rows: CsvRow[] = [];
  let line = 1;
  let rowStartLine = 1;
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
        if (char === "\n") {
          line++;
        }
      }
    } else if (char === '"') {
      if (field === "") {
        inQuotes = true;
      } else {
        return { header: [], rows: [], error: `Aspas em meio de campo na linha ${line}.` };
      }
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      field = "";
      if (row.length > 0 && row.some((value) => value !== "")) {
        rows.push({ line: rowStartLine, values: row });
      }
      row = [];
      line++;
      rowStartLine = line;
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (inQuotes) {
    return { header: [], rows: [], error: "Aspas não fechadas no arquivo CSV." };
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((value) => value !== "")) {
      rows.push({ line: rowStartLine, values: row });
    }
  }

  if (rows.length === 0) {
    return { header: [], rows: [], error: "O arquivo CSV está vazio." };
  }

  const header = rows[0].values.map((value) => value.trim());
  return { header, rows: rows.slice(1) };
}

export function missingRequiredColumns(header: string[]): string[] {
  return REQUIRED_CATALOG_COLUMNS.filter((column) => !header.includes(column));
}

export type ValidatedCatalogRow = {
  line: number;
  row: CatalogRow;
};

export type CatalogValidation = {
  ok: boolean;
  rows: ValidatedCatalogRow[];
  rowCount: number;
  validCount: number;
  errors: string[];
  warnings: string[];
};

export function validateCatalog(
  header: string[],
  rows: CsvRow[],
  availableImages: Set<string>,
): CatalogValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validRows: ValidatedCatalogRow[] = [];

  const seenSlug = new Map<string, number>();
  const seenImagePath = new Map<string, number>();
  const seenRowKey = new Map<string, number>();

  rows.forEach(({ line, values }) => {
    if (values.length !== header.length) {
      errors.push(
        `Linha ${line}: esperava ${header.length} colunas, encontrou ${values.length}.`,
      );
      return;
    }

    const input: CatalogRowInput = {};
    header.forEach((column, index) => {
      input[column] = values[index] ?? "";
    });

    const rowKey = values.join("\u0000");
    const previousRow = seenRowKey.get(rowKey);
    if (previousRow !== undefined) {
      errors.push(`Linha ${line}: linha duplicada da linha ${previousRow}.`);
      return;
    }
    seenRowKey.set(rowKey, line);

    const validation = validateCatalogRow(input);
    if (!validation.ok) {
      validation.errors.forEach((message) => {
        errors.push(`Linha ${line}: ${message}.`);
      });
      return;
    }

    const row = validation.row;
    const existingSlugLine = seenSlug.get(row.slug);
    if (existingSlugLine !== undefined) {
      errors.push(
        `Linha ${line}: slug "${row.slug}" duplicado da linha ${existingSlugLine}.`,
      );
      return;
    }
    seenSlug.set(row.slug, line);

    const imagePath = `${row.category}/${row.image_filename}`;
    const existingImageLine = seenImagePath.get(imagePath);
    if (existingImageLine !== undefined) {
      errors.push(
        `Linha ${line}: imagem "${imagePath}" duplicada da linha ${existingImageLine}.`,
      );
      return;
    }
    seenImagePath.set(imagePath, line);

    if (!availableImages.has(imagePath)) {
      errors.push(
        `Linha ${line}: imagem ausente em "catalogo/${imagePath}". Coloque o arquivo WebP na pasta da categoria antes de importar.`,
      );
      return;
    }

    validRows.push({ line, row });
  });

  return {
    ok: errors.length === 0,
    rows: validRows,
    rowCount: rows.length,
    validCount: validRows.length,
    errors,
    warnings,
  };
}

export type ExistingProduct = {
  slug: string;
  name: string;
  club: string;
  season: string;
  category: string;
  league: string;
  description: string;
  price: number;
  featured: boolean;
  available: boolean;
  image_url: string;
};

const COMPARABLE_FIELDS: Array<{ label: string; read: (row: CatalogRow) => unknown }> = [
  { label: "name", read: (row) => row.name },
  { label: "club", read: (row) => row.club },
  { label: "season", read: (row) => row.season },
  { label: "category", read: (row) => row.category },
  { label: "league", read: (row) => row.league },
  { label: "description", read: (row) => row.description },
  { label: "price", read: (row) => row.price },
  { label: "featured", read: (row) => row.featured },
  { label: "available", read: (row) => row.available },
];

export function metadataChangedFields(
  existing: ExistingProduct,
  row: CatalogRow,
): string[] {
  return COMPARABLE_FIELDS.filter((field) => field.read(row) !== existing[field.label as keyof ExistingProduct])
    .map((field) => field.label);
}

export type PlannedItemStatus = "created" | "updated" | "overwritten" | "skipped";

export type PlannedItem = {
  slug: string;
  category: string;
  imageFilename: string;
  storagePath: string;
  status: PlannedItemStatus;
  needsUpload: boolean;
  message: string;
};

export function planCatalogImport(
  rows: CatalogRow[],
  existingProducts: Map<string, ExistingProduct>,
  existingImages: Set<string>,
  overwrite: boolean,
): PlannedItem[] {
  return rows.map((row) => {
    const storagePath = `${row.category}/${row.image_filename}`;
    const existing = existingProducts.get(row.slug);
    const imageExists = existingImages.has(storagePath);

    if (!existing) {
      return {
        slug: row.slug,
        category: row.category,
        imageFilename: row.image_filename,
        storagePath,
        status: "created",
        needsUpload: !imageExists,
        message: imageExists
          ? "produto novo mas imagem já existe no Storage; produto será criado apontando para a imagem atual"
          : "produto e imagem novos; imagem será enviada e produto criado",
      };
    }

    if (!imageExists) {
      return {
        slug: row.slug,
        category: row.category,
        imageFilename: row.image_filename,
        storagePath,
        status: "updated",
        needsUpload: true,
        message: "produto existe mas imagem não; imagem será enviada e image_url atualizado",
      };
    }

    if (overwrite) {
      return {
        slug: row.slug,
        category: row.category,
        imageFilename: row.image_filename,
        storagePath,
        status: "overwritten",
        needsUpload: true,
        message: "produto e imagem existem; imagem será substituída (upsert) e metadados atualizados",
      };
    }

    const changed = metadataChangedFields(existing, row);
    if (changed.length === 0) {
      return {
        slug: row.slug,
        category: row.category,
        imageFilename: row.image_filename,
        storagePath,
        status: "skipped",
        needsUpload: false,
        message: "produto e imagem já existem e nada mudou",
      };
    }

    return {
      slug: row.slug,
      category: row.category,
      imageFilename: row.image_filename,
      storagePath,
      status: "updated",
      needsUpload: false,
      message: `produto existe; metadados serão atualizados (${changed.join(", ")}) sem substituir a imagem`,
    };
  });
}

export type WebpDimensions = { width: number; height: number };

export function readWebpDimensions(buffer: Uint8Array): WebpDimensions | null {
  if (buffer.length < 30) {
    return null;
  }

  const ascii = (offset: number, length: number): string =>
    String.fromCharCode(...buffer.subarray(offset, offset + length));

  if (ascii(0, 4) !== "RIFF" || ascii(8, 4) !== "WEBP") {
    return null;
  }

  const type = ascii(12, 4);

  if (type === "VP8X") {
    const width = 1 + (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16));
    const height = 1 + (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16));
    return { width, height };
  }

  if (type === "VP8L") {
    if (buffer.length < 25 || buffer[20] !== 0x2f) {
      return null;
    }
    const width = 1 + (buffer[21] | ((buffer[22] & 0x3f) << 8));
    const height = 1 + ((buffer[22] >> 6) | (buffer[23] << 2) | ((buffer[24] & 0x0f) << 10));
    return { width, height };
  }

  return null;
}

export type CatalogImportReport = {
  startedAt: string;
  finishedAt: string;
  mode: "validate-only" | "dry-run" | "import" | "overwrite";
  totals: {
    rows: number;
    valid: number;
    created: number;
    updated: number;
    overwritten: number;
    skipped: number;
    failed: number;
  };
  items: Array<{
    slug: string;
    imageFilename: string;
    status: "valid" | "created" | "updated" | "overwritten" | "skipped" | "failed";
    message?: string;
    imageUrl?: string;
  }>;
};

export function buildEmptyTotals() {
  return {
    rows: 0,
    valid: 0,
    created: 0,
    updated: 0,
    overwritten: 0,
    skipped: 0,
    failed: 0,
  };
}
