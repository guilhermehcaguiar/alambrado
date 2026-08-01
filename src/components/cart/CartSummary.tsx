"use client";

import { Truck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { formatBRL } from "@/utils/format";

type CartSummaryProps = {
  onCheckout: () => void;
};

export default function CartSummary({ onCheckout }: CartSummaryProps) {
  const { items, totalItems, subtotal, isHydrated } = useCart();
  const canCheckout = isHydrated && items.length > 0;

  return (
    <Card>
      <h2 className="font-subtitle text-xl font-semibold uppercase tracking-wider text-paper">
        Resumo do pedido
      </h2>

      <dl className="mt-5 space-y-3 font-body text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-mist">Itens</dt>
          <dd className="font-semibold text-paper">{totalItems}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-mist">Subtotal</dt>
          <dd className="font-display text-2xl tracking-wide text-brand">
            {formatBRL(subtotal)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center gap-3 rounded-lg border border-ash bg-coal px-4 py-3">
        <Truck className="size-5 shrink-0 text-brand" aria-hidden="true" />
        <p className="font-body text-sm text-mist">
          Prazo estimado: <strong className="text-paper">15 a 25 dias úteis</strong>
        </p>
      </div>

      <p className="mt-3 font-body text-xs leading-relaxed text-mist">
        O total final não inclui frete, tratado no WhatsApp.
      </p>

      <Button
        variant="whatsapp"
        size="lg"
        className="mt-5 w-full"
        disabled={!canCheckout}
        onClick={onCheckout}
      >
        Finalizar pelo WhatsApp
      </Button>
    </Card>
  );
}
