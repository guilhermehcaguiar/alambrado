"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import CartItemCard from "@/components/cart/CartItemCard";
import CartSummary from "@/components/cart/CartSummary";
import ClearCartButton from "@/components/cart/ClearCartButton";
import EmptyCart from "@/components/cart/EmptyCart";
import WhatsAppCheckoutModal from "@/components/checkout/WhatsAppCheckoutModal";

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
      <ul className="space-y-4">
        {items.map((item) => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </ul>
      <div className="flex flex-col gap-3 lg:sticky lg:top-6">
        <CartSummary onCheckout={() => setCheckoutOpen(true)} />
        <div className="flex justify-end">
          <ClearCartButton />
        </div>
      </div>
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
