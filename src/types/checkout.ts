import type { ProductSize } from "@/types/product";

export type CheckoutItemInput = {
  productId: string;
  size: ProductSize;
  quantity: number;
};

export type WhatsAppCheckoutInput = {
  customerName: string;
  items: CheckoutItemInput[];
};

export type CheckoutResolvedItem = {
  productId: string;
  slug: string;
  name: string;
  club: string;
  season: string | null;
  category: string;
  size: ProductSize;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type WhatsAppCheckoutResponse = {
  message: string;
  whatsappUrl: string;
  total: number;
  totalItems: number;
  items: CheckoutResolvedItem[];
};
