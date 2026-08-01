"use client";

import Image from "next/image";
import { Shirt, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import CartQuantityControl from "@/components/cart/CartQuantityControl";
import { useCart } from "@/hooks/useCart";
import { CATEGORY_LABELS, PRODUCT_SIZES, type ProductSize } from "@/types/product";
import type { CartItem } from "@/types/cart";
import { getItemSubtotal } from "@/utils/cart";
import { formatBRL } from "@/utils/format";

type CartItemCardProps = {
  item: CartItem;
};

export default function CartItemCard({ item }: CartItemCardProps) {
  const { removeItem, updateQuantity, updateSize } = useCart();
  const subtotal = getItemSubtotal(item);

  return (
    <li className="flex gap-4 rounded-xl border border-ash bg-graphite p-4 sm:gap-5">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-ash bg-paper sm:h-28 sm:w-28">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={`Camisa ${item.name}`}
            fill
            sizes="112px"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-coal text-mist">
            <Shirt className="size-6" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-xl uppercase leading-tight tracking-wide text-paper">
              {item.name}
            </p>
            <p className="mt-1 font-body text-sm text-mist">
              {item.club}
              {item.season ? ` · ${item.season}` : ""}
            </p>
            <Badge className="mt-2">{CATEGORY_LABELS[item.category]}</Badge>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            aria-label={`Remover ${item.name} do carrinho`}
            className="rounded-md p-2 text-mist transition-colors duration-200 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <label>
            <span className="sr-only">Tamanho de {item.name}</span>
            <select
              value={item.size}
              onChange={(event) => updateSize(item.id, event.target.value as ProductSize)}
              className="rounded-md border border-ash bg-graphite px-2.5 py-2 font-body text-sm text-paper focus:outline-2 focus:outline-offset-2 focus:outline-brand"
            >
              {PRODUCT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <CartQuantityControl
            quantity={item.quantity}
            onChange={(quantity) => updateQuantity(item.id, quantity)}
            label={`${item.name} (tamanho ${item.size})`}
          />

          <div className="ml-auto text-right">
            <p className="font-body text-xs text-mist">
              Unitário: {formatBRL(item.unitPrice)}
            </p>
            <p className="font-display text-xl tracking-wide text-brand">
              {formatBRL(subtotal)}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}
