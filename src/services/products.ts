import { cache } from "react";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Product, ProductCategory } from "@/types/product";
import type { CategoryFilter, ProductSort } from "@/utils/catalog";

export const PAGE_SIZE = 9;

export type ProductSearchParams = {
  category?: CategoryFilter;
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
  category: z.enum(["promocional-torcedor", "infantil", "jogador", "retro"]),
  description: z.string(),
  price: z.coerce.number(),
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
      query = "",
      sort = "newest",
      page = 1,
      pageSize = PAGE_SIZE,
    } = params;

    let dbQuery = getSupabaseServerClient()
      .from("products")
      .select("*", { count: "exact" })
      .eq("available", true);

    if (category !== "all") {
      dbQuery = dbQuery.eq("category", category);
    }

    const trimmedQuery = query.trim().replace(/[(),]/g, "");
    if (trimmedQuery) {
      const like = `%${trimmedQuery}%`;
      dbQuery = dbQuery.or(`name.ilike.${like},slug.ilike.${like}`);
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
