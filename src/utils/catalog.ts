import { PRODUCT_CATEGORIES, type ProductCategory } from "@/types/product";

export type CategoryFilter = ProductCategory | "all" | "promo";

export type ProductSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "season-desc"
  | "season-asc";

export const PRODUCT_SORTS: ProductSort[] = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
  "season-desc",
  "season-asc",
];

export function parseCategory(value: unknown): CategoryFilter {
  if (typeof value === "string" && value === "promo") {
    return "promo";
  }
  if (
    typeof value === "string" &&
    (PRODUCT_CATEGORIES as readonly string[]).includes(value)
  ) {
    return value as ProductCategory;
  }
  return "all";
}

export function parseSort(value: unknown): ProductSort {
  if (typeof value === "string" && (PRODUCT_SORTS as readonly string[]).includes(value)) {
    return value as ProductSort;
  }
  return "newest";
}

export function parseLeague(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
