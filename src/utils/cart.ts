import { MAX_CART_ITEM_QUANTITY, type CartItem } from "@/types/cart";
import type { ProductSize } from "@/types/product";
import { computePriceForSize } from "@/config/prices";

export function createCartItemId(productId: string, size: ProductSize): string {
  return `${productId}:${size}`;
}

export function computeUnitPrice(price: number, size: ProductSize): number {
  return computePriceForSize(price, size);
}

export function getItemSubtotal(item: CartItem): number {
  return item.quantity * item.unitPrice;
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getItemSubtotal(item), 0);
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
