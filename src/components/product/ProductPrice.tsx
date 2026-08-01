import { formatBRL } from "@/utils/format";

type ProductPriceProps = {
  price: number;
};

export default function ProductPrice({ price }: ProductPriceProps) {
  return <p className="font-display text-4xl tracking-wide text-brand">{formatBRL(price)}</p>;
}
