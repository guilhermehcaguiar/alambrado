import type { ProductSize } from "@/types/product";

export const PRICES = {
  torcedor: 119.9,
  infantil: 149.9,
  jogador: 169.9,
  retro: 199.9,
} as const;

export const PRICE_RULES = {
  oversizedSizes: ["3XG", "4XG"] as const,
  oversizedSurcharge: 19.9,
} as const;

const OVERSIZED_SIZES = PRICE_RULES.oversizedSizes as readonly ProductSize[];

export function isOversizedSize(size: ProductSize): boolean {
  return OVERSIZED_SIZES.includes(size);
}

export function getSizeSurcharge(size: ProductSize): number {
  return isOversizedSize(size) ? PRICE_RULES.oversizedSurcharge : 0;
}

export function computePriceForSize(basePrice: number, size: ProductSize): number {
  return basePrice + getSizeSurcharge(size);
}
