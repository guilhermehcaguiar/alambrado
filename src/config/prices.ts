import type { ProductSize } from "@/types/product";

export const PRICES = {
  torcedor: 119.9,
  infantil: 149.9,
  jogador: 169.9,
  retro: 199.9,
  personalizacao: 24.9,
  patch: 8.9,
  size3x4x: 19.9,
} as const;

export const PRICE_RULES = {
  sizeSurchargeEnabled: false,
  personalizacaoEnabled: false,
  patchEnabled: false,
} as const;

const SPECIAL_SIZES: ProductSize[] = ["3XG", "4XG"];

export function getSizeSurcharge(size: ProductSize): number {
  if (PRICE_RULES.sizeSurchargeEnabled && SPECIAL_SIZES.includes(size)) {
    return PRICES.size3x4x;
  }
  return 0;
}
