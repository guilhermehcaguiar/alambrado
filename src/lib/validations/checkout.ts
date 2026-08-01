import { z } from "zod";
import { PRODUCT_SIZES } from "@/types/product";
import { MAX_CART_ITEM_QUANTITY } from "@/types/cart";
import { sanitizeCustomerName } from "@/utils/checkout";

export const MAX_CHECKOUT_ITEMS = 30;

export const nameSchema = z
  .string()
  .max(80, "O nome deve ter no máximo 80 caracteres.")
  .transform(sanitizeCustomerName)
  .pipe(z.string().min(2, "Informe seu nome (mínimo de 2 caracteres)."));

export const checkoutItemInputSchema = z
  .object({
    productId: z.string().min(1, "Produto inválido."),
    size: z.enum(PRODUCT_SIZES, "Tamanho inválido."),
    quantity: z
      .number()
      .int("Quantidade deve ser um número inteiro.")
      .min(1, "Quantidade mínima é 1.")
      .max(MAX_CART_ITEM_QUANTITY, "Quantidade máxima por item é 10."),
  })
  .strict();

export const whatsappCheckoutInputSchema = z.object({
  customerName: nameSchema,
  items: z
    .array(checkoutItemInputSchema)
    .min(1, "Seu carrinho está vazio.")
    .max(MAX_CHECKOUT_ITEMS, "O pedido pode ter no máximo 30 itens."),
});

export type WhatsAppCheckoutParsedInput = z.infer<typeof whatsappCheckoutInputSchema>;
