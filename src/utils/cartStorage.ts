import { cartStorageSchema, type CartItem } from "@/types/cart";

export const CART_STORAGE_KEY = "alambrado:cart:v1";

export function readStoredCart(key: string): CartItem[] | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = cartStorageSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function writeStoredCart(key: string, items: CartItem[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    return;
  }
}
