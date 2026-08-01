"use client";

import { useState } from "react";
import { PRODUCT_SIZES, type ProductSize } from "@/types/product";

export default function ProductSelector() {
  const [selected, setSelected] = useState<ProductSize | null>(null);

  return (
    <div>
      <p className="font-body text-sm font-semibold uppercase tracking-wider text-paper">
        Tamanho
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {PRODUCT_SIZES.map((size) => {
          const isSelected = selected === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => setSelected(size)}
              aria-pressed={isSelected}
              className={`rounded-md border py-2.5 font-body text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                isSelected
                  ? "border-brand bg-brand text-ink"
                  : "border-ash bg-graphite text-paper hover:border-brand/60"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
      <p className="mt-2 font-body text-xs text-mist" aria-live="polite">
        {selected ? `Tamanho selecionado: ${selected}` : "Selecione um tamanho"}
      </p>
    </div>
  );
}
