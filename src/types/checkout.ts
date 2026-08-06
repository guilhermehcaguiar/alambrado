import type { ProductSize } from "@/types/product";

export type CheckoutItemInput = {
  productId: string;
  size: ProductSize;
  quantity: number;
  personalization?: {
    enabled?: boolean;
    name?: string;
    number?: string;
  } | null;
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
  personalization?: {
    name?: string;
    number?: string;
    price: number;
  } | null;
};

export type WhatsAppCheckoutResponse = {
  message: string;
  whatsappUrl: string;
  total: number;
  totalItems: number;
  items: CheckoutResolvedItem[];
};
