export const PRODUCT_CATEGORIES = [
  "promocional-torcedor",
  "infantil",
  "jogador",
  "retro",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_SIZES = ["P", "M", "G", "GG", "XGG", "3XG", "4XG"] as const;

export type ProductSize = (typeof PRODUCT_SIZES)[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  "promocional-torcedor": "Promocional Torcedor",
  infantil: "Kit Infantil",
  jogador: "Jogador",
  retro: "Retrô",
};

export const CATEGORY_STATUS: Record<ProductCategory, "active" | "coming-soon"> = {
  "promocional-torcedor": "active",
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
  description: string;
  price: number;
  image_url: string;
  featured: boolean;
  available: boolean;
  created_at: string;
}
