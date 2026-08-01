"use client";

import { PRODUCT_SIZES, type ProductSize } from "@/types/product";

type ProductSelectorProps = {
  selectedSize: ProductSize | null;
  onSelect: (size: ProductSize) => void;
};

export default function ProductSelector({ selectedSize, onSelect }: ProductSelectorProps) {
  return (
    <fieldset>
      <legend className="font-body text-sm font-semibold uppercase tracking-wider text-paper">
        Tamanho
      </legend>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {PRODUCT_SIZES.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
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
        {selectedSize ? `Tamanho selecionado: ${selectedSize}` : "Selecione um tamanho"}
      </p>
    </fieldset>
  );
}
