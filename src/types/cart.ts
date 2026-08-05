import { z } from "zod";
import { PRODUCT_CATEGORIES, PRODUCT_SIZES, type ProductCategory, type ProductSize } from "@/types/product";

export const MAX_CART_ITEM_QUANTITY = 10;

export type CartPersonalization = {
  enabled: false;
  name?: never;
  number?: never;
  price: 0;
};

export type CartPatch = {
  enabled: false;
  name?: never;
  price: 0;
};

export type CartItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  club: string;
  season: string | null;
  category: ProductCategory;
  imageUrl: string;
  size: ProductSize;
  quantity: number;
  unitPrice: number;
  promoPrice?: number | null;
  promoMinQty?: number | null;
  promoStartsAt?: string | null;
  promoTiers?: { minQty: number; price: number }[] | null;
  oversizedSurcharge: number;
  oversizedSizes: string[];
  personalization: CartPersonalization;
  patch: CartPatch;
};

const personalizationSchema = z.object({
  enabled: z.literal(false),
  price: z.literal(0),
});

const patchSchema = z.object({
  enabled: z.literal(false),
  price: z.literal(0),
});

export const cartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  club: z.string(),
  season: z.string().nullable(),
  category: z.enum(PRODUCT_CATEGORIES),
  imageUrl: z.string(),
  size: z.enum(PRODUCT_SIZES),
  quantity: z.number().int().min(1).max(MAX_CART_ITEM_QUANTITY),
  unitPrice: z.number().min(0),
  promoPrice: z.number().min(0).nullable().optional(),
  promoMinQty: z.number().int().min(1).nullable().optional(),
  promoStartsAt: z.string().nullable().optional(),
  promoTiers: z.array(z.object({ minQty: z.number(), price: z.number() })).nullable().optional(),
  oversizedSurcharge: z.number().min(0).default(0),
  oversizedSizes: z.array(z.string()).default([]),
  personalization: personalizationSchema,
  patch: patchSchema,
});

export const cartStorageSchema = z.array(cartItemSchema);
