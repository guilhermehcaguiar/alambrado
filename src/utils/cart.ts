import { MAX_CART_ITEM_QUANTITY, type CartItem } from "@/types/cart";
import type { ProductSize } from "@/types/product";
import { getPromoUnitPrice } from "@/config/prices";

export function createCartItemId(productId: string, size: ProductSize): string {
  return `${productId}:${size}`;
}

export function computeUnitPrice(price: number, size: ProductSize, item: CartItem): number {
  const surcharge = item.oversizedSizes.includes(size) ? item.oversizedSurcharge : 0;
  return price + surcharge;
}

export function getCategoryQuantities(items: CartItem[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.quantity;
    return acc;
  }, {});
}

export function getItemUnitPrice(item: CartItem, categoryQuantities?: Record<string, number>): number {
  const promoQuantity = categoryQuantities ? categoryQuantities[item.category] ?? 0 : item.quantity;
  const promoUnit = getPromoUnitPrice(promoQuantity, {
    promoPrice: item.promoPrice,
    promoMinQty: item.promoMinQty,
    promoStartsAt: item.promoStartsAt,
    promoTiers: item.promoTiers,
  });
  if (promoUnit != null) {
    return computeUnitPrice(promoUnit, item.size, item);
  }
  return item.unitPrice;
}

export function getItemSubtotal(item: CartItem, categoryQuantities?: Record<string, number>): number {
  return item.quantity * getItemUnitPrice(item, categoryQuantities);
}

export function getCartSubtotal(items: CartItem[]): number {
  const categoryQuantities = getCategoryQuantities(items);
  return items.reduce((sum, item) => sum + getItemSubtotal(item, categoryQuantities), 0);
}

export function getCartTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function mergeAddItem(items: CartItem[], item: CartItem): CartItem[] {
  const existing = items.find((i) => i.id === item.id);
  if (existing) {
    return items.map((i) =>
      i.id === item.id
        ? { ...i, quantity: Math.min(i.quantity + item.quantity, MAX_CART_ITEM_QUANTITY) }
        : i,
    );
  }
  return [...items, item];
}

export function removeItemById(items: CartItem[], itemId: string): CartItem[] {
  return items.filter((i) => i.id !== itemId);
}

export function updateQuantityById(
  items: CartItem[],
  itemId: string,
  quantity: number,
): CartItem[] {
  return items.map((i) =>
    i.id === itemId
      ? {
          ...i,
          quantity: Math.min(Math.max(Math.floor(quantity), 1), MAX_CART_ITEM_QUANTITY),
        }
      : i,
  );
}

export function updateSizeById(
  items: CartItem[],
  itemId: string,
  size: ProductSize,
): CartItem[] {
  const current = items.find((i) => i.id === itemId);
  if (!current) {
    return items;
  }
  const nextId = createCartItemId(current.productId, size);
  if (nextId === current.id) {
    return items;
  }
  const target = items.find((i) => i.id === nextId);
  if (target) {
    return items
      .filter((i) => i.id !== itemId)
      .map((i) =>
        i.id === nextId
          ? { ...i, quantity: Math.min(i.quantity + current.quantity, MAX_CART_ITEM_QUANTITY) }
          : i,
      );
  }
  return items.map((i) => (i.id === itemId ? { ...i, id: nextId, size } : i));
}
