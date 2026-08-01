"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/carrinho"
      aria-label={
        totalItems > 0 ? `Carrinho, ${totalItems} itens` : "Carrinho vazio"
      }
      className="relative flex items-center rounded-md border border-ash p-2 text-paper transition-colors duration-200 hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {totalItems > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 font-body text-xs font-bold text-ink"
        >
          {totalItems}
        </span>
      )}
    </Link>
  );
}
