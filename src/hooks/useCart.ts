"use client";

import { useCartContext, type CartContextValue } from "@/contexts/CartContext";

export function useCart(): CartContextValue {
  return useCartContext();
}
