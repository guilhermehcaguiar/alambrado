"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_CART_ITEM_QUANTITY } from "@/types/cart";

type CartQuantityControlProps = {
  quantity: number;
  onChange: (quantity: number) => void;
  label: string;
  min?: number;
  max?: number;
  className?: string;
};

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(Math.floor(value), min), max);
}

export default function CartQuantityControl({
  quantity,
  onChange,
  label,
  min = 1,
  max = MAX_CART_ITEM_QUANTITY,
  className = "",
}: CartQuantityControlProps) {
  return (
    <div
      className={`inline-flex items-center rounded-md border border-ash bg-graphite ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(quantity - 1, min, max))}
        disabled={quantity <= min}
        aria-label={`Diminuir quantidade de ${label}`}
        className="flex h-11 w-11 items-center justify-center rounded-l-md text-paper transition-colors duration-200 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={quantity}
        aria-label={label}
        onChange={(event) => onChange(clamp(Number(event.target.value), min, max))}
        className="h-11 w-14 bg-transparent text-center font-body text-sm font-semibold text-paper focus:outline-2 focus:outline-offset-2 focus:outline-brand [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(quantity + 1, min, max))}
        disabled={quantity >= max}
        aria-label={`Aumentar quantidade de ${label}`}
        className="flex h-11 w-11 items-center justify-center rounded-r-md text-paper transition-colors duration-200 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
