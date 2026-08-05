import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getWhatsAppNumber, isWhatsAppConfigured } from "@/config/env";
import { computePriceForSize, getPromoUnitPrice } from "@/config/prices";
import { normalizeCategory } from "@/types/product";
import type {
  CheckoutResolvedItem,
  WhatsAppCheckoutInput,
  WhatsAppCheckoutResponse,
} from "@/types/checkout";
import {
  buildWhatsAppUrl,
  computeItemSubtotal,
  computeOrderTotal,
  computeTotalItems,
  formatCheckoutMessage,
  mergeCheckoutItems,
} from "@/utils/checkout";

export const CHECKOUT_ERROR_STATUS = {
  PRODUCT_UNAVAILABLE: 409,
  NOT_CONFIGURED: 500,
  INTERNAL: 500,
} as const;

export type CheckoutErrorCode = keyof typeof CHECKOUT_ERROR_STATUS;

export class CheckoutError extends Error {
  constructor(
    public readonly code: CheckoutErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

const productCheckoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  club: z.string(),
  season: z.string(),
  category: z
    .enum(["torcedor", "promocional-torcedor", "infantil", "jogador", "retro"])
    .transform((value) => normalizeCategory(value) ?? "torcedor"),
  price: z.coerce.number(),
  promo_price: z.coerce.number().nullable().optional().transform((value) => value ?? null),
  promo_min_qty: z.coerce.number().int().nullable().optional().transform((value) => value ?? null),
});

type ResolvedProduct = z.infer<typeof productCheckoutSchema>;

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fetchAvailableProductsByIds(ids: string[]): Promise<Map<string, ResolvedProduct>> {
  if (!isSupabaseConfigured()) {
    throw new CheckoutError(
      "NOT_CONFIGURED",
      "O checkout não está disponível no momento. Tente novamente mais tarde.",
    );
  }

  const validIds = ids.filter((id) => UUID_RE.test(id));
  if (validIds.length === 0) {
    return new Map();
  }

  const { data, error } = await getSupabaseServerClient()
    .from("products")
    .select("id, name, slug, club, season, category, price, promo_price, promo_min_qty")
    .in("id", validIds)
    .eq("available", true);

  if (error) {
    throw new CheckoutError(
      "INTERNAL",
      "Não foi possível preparar seu pedido. Tente novamente.",
    );
  }

  const products = new Map<string, ResolvedProduct>();
  for (const row of productCheckoutSchema.array().parse(data ?? [])) {
    products.set(row.id, row);
  }

  return products;
}

export async function resolveWhatsAppCheckout(
  input: WhatsAppCheckoutInput,
): Promise<WhatsAppCheckoutResponse> {
  const mergedItems = mergeCheckoutItems(input.items);

  const ids = Array.from(new Set(mergedItems.map((item) => item.productId)));
  const products = await fetchAvailableProductsByIds(ids);

  const productQuantities = new Map<string, number>();
  for (const item of mergedItems) {
    productQuantities.set(
      item.productId,
      (productQuantities.get(item.productId) ?? 0) + item.quantity,
    );
  }

  const resolvedItems: CheckoutResolvedItem[] = mergedItems.map((item) => {
    const product = products.get(item.productId);

    if (!product) {
      throw new CheckoutError(
        "PRODUCT_UNAVAILABLE",
        "Um dos produtos não está mais disponível. Revise seu carrinho.",
      );
    }

    const promoUnit = getPromoUnitPrice(productQuantities.get(item.productId) ?? item.quantity, {
      promoPrice: product.promo_price,
      promoMinQty: product.promo_min_qty,
    });
    const baseUnit = promoUnit != null ? promoUnit : product.price;
    const unitPrice = computePriceForSize(baseUnit, item.size);

    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      club: product.club,
      season: product.season || null,
      category: product.category,
      size: item.size,
      quantity: item.quantity,
      unitPrice,
      subtotal: computeItemSubtotal(unitPrice, item.quantity),
    };
  });

  const totalItems = computeTotalItems(resolvedItems);
  const total = computeOrderTotal(resolvedItems);

  const message = formatCheckoutMessage(input.customerName, resolvedItems);

  if (!isWhatsAppConfigured()) {
    throw new CheckoutError(
      "NOT_CONFIGURED",
      "O checkout não está disponível no momento. Tente novamente mais tarde.",
    );
  }

  const whatsappUrl = buildWhatsAppUrl(getWhatsAppNumber(), message);

  return {
    message,
    whatsappUrl,
    total,
    totalItems,
    items: resolvedItems,
  };
}
