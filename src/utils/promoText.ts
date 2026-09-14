import { formatBRL, formatDate } from "./format";
import type { Product } from "@/types/product";

export function getPromoDisplayText(product: Product): string | null {
  const promoStarted = !product.promo_starts_at || new Date(`${product.promo_starts_at}T00:00:00`) <= new Date();
  const tiers = product.promo_tiers && product.promo_tiers.length > 0
    ? [...product.promo_tiers].sort((a, b) => a.minQty - b.minQty)
    : null;
  const customNote = product.promo_note?.trim() ? product.promo_note.trim() : null;
  const categoryName = product.category;
  const tierLabel = tiers
    ? tiers.map((t) => `\u2265${t.minQty} un \u2192 ${formatBRL(t.price)}`).join(" | ")
    : null;

  if (customNote) {
    return customNote;
  }
  if (!promoStarted) {
    return product.promo_starts_at
      ? `Promo\u00e7\u00e3o programada: a partir de ${formatDate(product.promo_starts_at)}${tierLabel ? `, ${tierLabel}` : `, ${categoryName} por ${formatBRL(product.promo_price as number)}`}.`
      : null;
  }
  if (tierLabel) {
    return `Promo\u00e7\u00e3o por quantidade: ${tierLabel}.`;
  }
  if (product.promo_price != null && product.promo_min_qty != null) {
    return `Promo\u00e7\u00e3o: ${categoryName} por ${formatBRL(product.promo_price as number)} a partir de ${product.promo_min_qty} unidade(s).`;
  }
  return null;
}