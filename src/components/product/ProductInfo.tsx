import Badge from "@/components/ui/Badge";
import { CATEGORY_LABELS, type ProductCategory } from "@/types/product";

type ProductInfoProps = {
  name: string;
  category: ProductCategory;
  club: string;
  season: string;
};

export default function ProductInfo({ name, category, club, season }: ProductInfoProps) {
  return (
    <div>
      <Badge variant="green">{CATEGORY_LABELS[category]}</Badge>
      <h1 className="mt-3 font-display text-4xl uppercase leading-none tracking-wide text-paper sm:text-5xl">
        {name}
      </h1>
      {club ? (
        <p className="mt-2 font-body text-base text-mist">
          {club}
          {season ? ` · ${season}` : ""}
        </p>
      ) : null}
    </div>
  );
}
