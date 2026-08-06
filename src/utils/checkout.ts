import { CATEGORY_LABELS } from "@/types/product";
import { MAX_CART_ITEM_QUANTITY } from "@/types/cart";
import type { CheckoutResolvedItem, CheckoutItemInput } from "@/types/checkout";
import { formatBRL } from "@/utils/format";

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function sanitizeCustomerName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function mergeCheckoutItems(items: CheckoutItemInput[]): CheckoutItemInput[] {
  const merged = new Map<string, CheckoutItemInput>();

  for (const item of items) {
    const pers =
      item.personalization?.enabled && Boolean(item.personalization.name || item.personalization.number)
        ? `:p:${item.personalization.name ?? ""}:${item.personalization.number ?? ""}`
        : "";
    const key = `${item.productId}:${item.size}${pers}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + item.quantity,
        MAX_CART_ITEM_QUANTITY,
      );
    } else {
      merged.set(key, { ...item });
    }
  }

  return Array.from(merged.values());
}

export function formatCategoryLabel(category: string): string {
  if (category === "promocional-torcedor") {
    return CATEGORY_LABELS.torcedor;
  }
  return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category;
}

export function computeItemSubtotal(unitPrice: number, quantity: number): number {
  return roundToCents(unitPrice * quantity);
}

export function computeOrderTotal(
  items: Pick<CheckoutResolvedItem, "subtotal">[],
): number {
  return roundToCents(items.reduce((sum, item) => sum + item.subtotal, 0));
}

export function computeTotalItems(
  items: Pick<CheckoutResolvedItem, "quantity">[],
): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function formatCheckoutMessage(
  customerName: string,
  items: CheckoutResolvedItem[],
): string {
  const lines: string[] = [
    `Olá, me chamo ${customerName} e gostaria de fazer o seguinte pedido:`,
    "",
  ];

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name}`);
    lines.push(`Clube: ${item.club}`);
    if (item.season) {
      lines.push(`Temporada: ${item.season}`);
    }
    lines.push(`Modelo: ${formatCategoryLabel(item.category)}`);
    lines.push(`Tamanho: ${item.size}`);
    lines.push(`Quantidade: ${item.quantity}`);
    if (item.personalization) {
      const parts = [item.personalization.name, item.personalization.number]
        .filter(Boolean)
        .join(" - ");
      lines.push(
        parts
          ? `Personalização: ${parts}${item.personalization.price > 0 ? ` (+${formatBRL(item.personalization.price)})` : ""}`
          : "Personalização: incluir",
      );
    }
    lines.push("Patch: indisponível neste lançamento");
    lines.push(`Valor unitário: ${formatBRL(item.unitPrice)}`);
    lines.push(`Subtotal: ${formatBRL(item.subtotal)}`);
    lines.push("");
  });

  const totalItems = computeTotalItems(items);
  const total = computeOrderTotal(items);

  lines.push(`Total de itens: ${totalItems}`);
  lines.push(`Total estimado: ${formatBRL(total)}`);
  lines.push("");

  return lines.join("\n");
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
