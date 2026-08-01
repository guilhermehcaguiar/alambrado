"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem } from "@/types/cart";
import type { ProductSize } from "@/types/product";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { CART_STORAGE_KEY, readStoredCart, writeStoredCart } from "@/utils/cartStorage";
import {
  getCartSubtotal,
  getCartTotalItems,
  mergeAddItem,
  removeItemById,
  updateQuantityById,
  updateSizeById,
} from "@/utils/cart";

export type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isHydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateSize: (itemId: string, size: ProductSize) => void;
  clearCart: () => void;
  hasItem: (productId: string, size: ProductSize) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return readStoredCart(CART_STORAGE_KEY) ?? [];
  });
  const isHydrated = useIsHydrated();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    writeStoredCart(CART_STORAGE_KEY, items);
  }, [items, isHydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => mergeAddItem(prev, item));
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => removeItemById(prev, itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setItems((prev) => updateQuantityById(prev, itemId, quantity));
  }, []);

  const updateSize = useCallback((itemId: string, size: ProductSize) => {
    setItems((prev) => updateSizeById(prev, itemId, size));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const hasItem = useCallback(
    (productId: string, size: ProductSize) =>
      items.some((item) => item.productId === productId && item.size === size),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems: getCartTotalItems(items),
      subtotal: getCartSubtotal(items),
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      updateSize,
      clearCart,
      hasItem,
    }),
    [
      items,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      updateSize,
      clearCart,
      hasItem,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext deve ser usado dentro de <CartProvider>.");
  }
  return context;
}
