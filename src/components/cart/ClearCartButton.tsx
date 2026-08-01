"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";

export default function ClearCartButton() {
  const { clearCart } = useCart();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ash bg-graphite px-4 py-3">
        <p className="font-body text-sm text-mist">
          Tem certeza que deseja limpar todo o carrinho?
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" autoFocus onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-ash text-mist hover:border-paper hover:text-paper"
            onClick={() => {
              clearCart();
              setConfirming(false);
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Sim, limpar carrinho
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-mist hover:text-paper"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="size-4" aria-hidden="true" />
      Limpar carrinho
    </Button>
  );
}
