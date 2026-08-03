"use client";

import { useState } from "react";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import CartItemCard from "@/components/cart/CartItemCard";
import CartSummary from "@/components/cart/CartSummary";
import ClearCartButton from "@/components/cart/ClearCartButton";
import EmptyCart from "@/components/cart/EmptyCart";
import WhatsAppCheckoutModal from "@/components/checkout/WhatsAppCheckoutModal";
import { formatBRL } from "@/utils/format";

export default function CartView() {
  const { items, subtotal, isHydrated } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!isHydrated) {
    return (
      <div
        aria-busy="true"
        className="flex flex-col items-center gap-3 rounded-xl border border-ash bg-graphite px-6 py-16 text-center"
      >
        <ShoppingBag className="size-8 animate-pulse text-mist" aria-hidden="true" />
        <p className="font-body text-sm text-mist">Carregando carrinho…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div>
        <div className="flex items-center justify-between lg:hidden">
          <p className="font-body text-sm text-mist">
            {items.length === 1 ? "1 item" : `${items.length} itens`}
          </p>
          <ClearCartButton />
        </div>
        <ul className="mt-3 space-y-4 lg:mt-0">
          {items.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3 lg:sticky lg:top-6">
        <CartSummary onCheckout={() => setCheckoutOpen(true)} />
        <div className="hidden lg:flex lg:justify-end">
          <ClearCartButton />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ash bg-ink/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-body text-xs text-mist">Total</p>
            <p className="font-display text-2xl leading-none tracking-wide text-brand">
              {formatBRL(subtotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            className="inline-flex min-h-12 w-full max-w-[16rem] items-center justify-center gap-2 rounded-md bg-brand px-6 py-3 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            Finalizar pelo WhatsApp
          </button>
        </div>
      </div>

      <div className="h-20 lg:hidden" aria-hidden="true" />

      {checkoutOpen ? (
        <WhatsAppCheckoutModal
          items={items}
          localSubtotal={subtotal}
          onClose={() => setCheckoutOpen(false)}
        />
      ) : null}
    </div>
  );
}
