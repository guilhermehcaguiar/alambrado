export const PRODUCT_CATEGORIES = ["torcedor", "jogador", "retro", "infantil"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const LEGACY_CATEGORIES = ["promocional-torcedor"] as const;

export const CATEGORY_ALIASES = {
  torcedor: "torcedor",
  "promocional-torcedor": "torcedor",
  jogador: "jogador",
  retro: "retro",
  infantil: "infantil",
} as const;

export type CategoryAliasKey = keyof typeof CATEGORY_ALIASES;

export function normalizeCategory(value: string): ProductCategory | null {
  return (CATEGORY_ALIASES[value as CategoryAliasKey] as ProductCategory | undefined) ?? null;
}

export const PRODUCT_SIZES = ["P", "M", "G", "GG", "XGG", "3XG", "4XG"] as const;

export type ProductSize = (typeof PRODUCT_SIZES)[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  torcedor: "Torcedor",
  infantil: "Infantil",
  jogador: "Jogador",
  retro: "Retrô",
};

export const CATEGORY_STATUS: Record<ProductCategory, "active" | "coming-soon"> = {
  torcedor: "active",
  infantil: "coming-soon",
  jogador: "coming-soon",
  retro: "coming-soon",
};

export interface Product {
  id: string;
  name: string;
  slug: string;
  club: string;
  season: string;
  category: ProductCategory;
  league: string;
  description: string;
  price: number;
  promo_price: number | null;
  promo_min_qty: number | null;
  promo_starts_at: string | null;
  image_url: string;
  featured: boolean;
  available: boolean;
  created_at: string;
}

export function hasPromo(product: Pick<Product, "promo_price" | "promo_min_qty" | "promo_starts_at">): boolean {
  return (
    product.promo_price != null &&
    product.promo_price >= 0 &&
    product.promo_min_qty != null &&
    product.promo_min_qty >= 1 &&
    isPromoStarted(product.promo_starts_at)
  );
}

export function isPromoStarted(promoStartsAt: string | null | undefined, today?: Date): boolean {
  if (!promoStartsAt) {
    return true;
  }
  const date = today ?? new Date();
  const start = new Date(`${promoStartsAt}T00:00:00`);
  return date >= start;
}
