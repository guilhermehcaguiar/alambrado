import Badge from "@/components/ui/Badge";
import { CATEGORY_LABELS, type ProductCategory } from "@/types/product";

type ProductInfoProps = {
  name: string;
  category: ProductCategory;
  club: string;
  season: string;
  league?: string;
};

export default function ProductInfo({
  name,
  category,
  club,
  season,
  league,
}: ProductInfoProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge category={category}>{CATEGORY_LABELS[category]}</Badge>
        <Badge variant="promo">Promocional</Badge>
        {league ? <Badge variant="neutral">{league}</Badge> : null}
      </div>
      <h1 className="mt-3 font-display text-4xl uppercase leading-none tracking-wide text-paper sm:text-5xl">
        {name}
      </h1>
      <p className="mt-2 font-body text-base text-mist">
        {club}
        {season ? ` · ${season}` : ""}
      </p>
    </div>
  );
}
