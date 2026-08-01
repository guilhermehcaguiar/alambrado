import { PRODUCT_CATEGORIES, type ProductCategory } from "@/types/product";

export type CategoryFilter = ProductCategory | "all";

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name-asc";

export const PRODUCT_SORTS: ProductSort[] = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
];

export function parseCategory(value: unknown): CategoryFilter {
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
