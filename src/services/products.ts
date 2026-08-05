import { cache } from "react";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeCategory, type Product, type ProductCategory } from "@/types/product";
import type { CategoryFilter, ProductSort } from "@/utils/catalog";

export const PAGE_SIZE = 16;

export type ProductSearchParams = {
  category?: CategoryFilter;
  league?: string;
  query?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export type ProductSearchResult = {
  products: Product[];
  total: number;
};

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  club: z.string(),
  season: z.string(),
  category: z
    .enum(["torcedor", "promocional-torcedor", "infantil", "jogador", "retro"])
    .transform((value) => normalizeCategory(value) ?? "torcedor"),
  league: z.string(),
  description: z.string(),
  price: z.coerce.number(),
  promo_price: z.coerce.number().nullable().optional().transform((value) => value ?? null),
  promo_min_qty: z.coerce.number().int().nullable().optional().transform((value) => value ?? null),
  promo_starts_at: z.string().nullable().optional().transform((value) => value ?? null),
  promo_tiers: z.unknown().optional().transform((value) => {
    if (!Array.isArray(value)) return null;
    return value.filter((v: unknown) =>
      v && typeof v === "object" && "minQty" in v && "price" in v &&
      typeof (v as Record<string, unknown>).minQty === "number" &&
      typeof (v as Record<string, unknown>).price === "number"
    );
  }),
  image_url: z.string(),
  featured: z.boolean(),
  available: z.boolean(),
  created_at: z.string(),
});

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function seasonSortValue(season: string): number {
  const value = season.trim();
  if (!value) return -1;
  const toFullYear = (y: string): number => {
    const n = Number(y);
    return n >= 70 ? 1900 + n : 2000 + n;
  };
  const pair = value.match(/^(\d{2})\/(\d{2})$/);
  if (pair) {
    const start = toFullYear(pair[1]);
    const end = toFullYear(pair[2]);
    return start * 1_000_000 + end * 1000 + 2;
  }
  const full = value.match(/^(\d{4})-(\d{4})$/);
  if (full) {
    return Number(full[1]) * 1_000_000 + Number(full[2]) * 1000 + 2;
  }
  const year = value.match(/^(\d{4})$/);
  if (year) {
    const y = Number(year[1]);
    return y * 1_000_000 + y * 1000 + 1;
  }
  const short = value.match(/^(\d{2})$/);
  if (short) {
    const y = toFullYear(short[1]);
    return y * 1_000_000 + y * 1000 + 1;
  }
  return 0;
}

const MODEL_ORDER: Record<string, number> = {
  home: 0,
  away: 1,
  third: 2,
  fourth: 3,
  special: 4,
  specialedition: 4,
  prematch: 5,
  training: 6,
  other: 7,
};

const KNOWN_MODEL_SLUGS = Object.keys(MODEL_ORDER)
  .filter((key) => key !== "other")
  .concat(["jordan-night-edition", "night-edition", "goleiro", "goalkeeper"])
  .sort((a, b) => b.length - a.length);

function modelRankFromSlug(slug: string): number {
  const segments = slug.split("-").filter(Boolean);
  while (segments.length > 0 && /^\d+$/.test(segments[segments.length - 1])) {
    segments.pop();
  }
  const rest = segments.join("-");
  for (const model of KNOWN_MODEL_SLUGS) {
    if (rest.endsWith(model)) {
      return MODEL_ORDER[model] ?? MODEL_ORDER.other;
    }
  }
  return MODEL_ORDER.other;
}

function productModelRank(product: Product): number {
  return product.slug ? modelRankFromSlug(product.slug) : MODEL_ORDER.other;
}

export const getProducts = cache(async (limit?: number): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const query = getSupabaseServerClient()
    .from("products")
    .select("*")
    .eq("available", true)
    .order("created_at", { ascending: false });

  const { data, error } = await (limit ? query.limit(limit) : query);

  if (error) {
    return [];
  }

  return productSchema.array().parse(data ?? []);
});

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await getSupabaseServerClient()
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("available", true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return productSchema.parse(data);
  },
);

export const getProductsByCategory = cache(
  async (category: ProductCategory): Promise<Product[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await getSupabaseServerClient()
      .from("products")
      .select("*")
      .eq("available", true)
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return productSchema.array().parse(data ?? []);
  },
);

export const searchProducts = cache(
  async (params: ProductSearchParams): Promise<ProductSearchResult> => {
    if (!isSupabaseConfigured()) {
      return { products: [], total: 0 };
    }

    const {
      category = "all",
      league = "",
      query = "",
      sort = "newest",
      page = 1,
      pageSize = PAGE_SIZE,
    } = params;

    const todayIso = new Date().toISOString().slice(0, 10);

    let dbQuery = getSupabaseServerClient()
      .from("products")
      .select("*", { count: "exact" })
      .eq("available", true);

    if (category === "promo") {
      dbQuery = dbQuery
        .gte("promo_price", 0)
        .gte("promo_min_qty", 1)
        .or(`promo_starts_at.is.null,promo_starts_at.lte.${todayIso}`);
    } else if (category !== "all") {
      dbQuery = dbQuery.eq("category", category);
    }

    if (league) {
      dbQuery = dbQuery.eq("league", league);
    }

    const trimmedQuery = query.trim().replace(/[(),]/g, "");
    if (trimmedQuery) {
      const like = `%${trimmedQuery}%`;
      dbQuery = dbQuery.or(`name.ilike.${like},slug.ilike.${like}`);
    }

    if (sort === "season-desc" || sort === "season-asc") {
      const { data, error, count } = await dbQuery;

      if (error) {
        return { products: [], total: 0 };
      }

      const parsed = productSchema.array().parse(data ?? []);
      const ascending = sort === "season-asc";
      const sortValue = (product: Product) =>
        ascending ? seasonSortValue(product.season) : -seasonSortValue(product.season);
      const rankValue = (product: Product) =>
        ascending ? productModelRank(product) : -productModelRank(product);
      parsed.sort((a, b) => {
        if (league) {
          const club = a.club.localeCompare(b.club, "pt-BR");
          if (club !== 0) return club;
        }
        const seasonDiff = sortValue(a) - sortValue(b);
        if (seasonDiff !== 0) return seasonDiff;
        const rankDiff = rankValue(a) - rankValue(b);
        if (rankDiff !== 0) return rankDiff;
        return a.club.localeCompare(b.club, "pt-BR");
      });

      const from = (page - 1) * pageSize;
      return {
        products: parsed.slice(from, from + pageSize),
        total: count ?? 0,
      };
    }

    switch (sort) {
      case "price-asc":
        dbQuery = dbQuery.order("price", { ascending: true });
        break;
      case "price-desc":
        dbQuery = dbQuery.order("price", { ascending: false });
        break;
      case "name-asc":
        dbQuery = dbQuery.order("name", { ascending: true });
        break;
      default:
        dbQuery = dbQuery.order("created_at", { ascending: false });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    dbQuery = dbQuery.range(from, to);

    const { data, error, count } = await dbQuery;

    if (error) {
      return { products: [], total: 0 };
    }

    return {
      products: productSchema.array().parse(data ?? []),
      total: count ?? 0,
    };
  },
);

export const getLeagues = cache(async (): Promise<string[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await getSupabaseServerClient()
    .from("products")
    .select("league")
    .eq("available", true)
    .neq("league", "")
    .order("league", { ascending: true });

  if (error) {
    return [];
  }

  return [...new Set((data ?? []).map((item) => item.league as string).filter(Boolean))];
});
