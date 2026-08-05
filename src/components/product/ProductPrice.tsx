import { formatBRL } from "@/utils/format";

type ProductPriceProps = {
  price: number;
  originalPrice?: number | null;
};

export default function ProductPrice({ price, originalPrice }: ProductPriceProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      {originalPrice != null && originalPrice > price ? (
        <p className="font-body text-lg text-mist line-through">{formatBRL(originalPrice)}</p>
      ) : null}
      <p className="font-display text-4xl tracking-wide text-brand">{formatBRL(price)}</p>
    </div>
  );
}
