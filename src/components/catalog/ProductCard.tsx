import Image from "next/image";
import Link from "next/link";
import { Shirt } from "lucide-react";
import { formatBRL } from "@/utils/format";
import { getPromoDisplayPrice } from "@/config/prices";
import { CATEGORY_LABELS, hasPromo, type Product } from "@/types/product";
import Badge from "@/components/ui/Badge";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const promo = hasPromo(product);
  const promoPrice = promo
    ? getPromoDisplayPrice({
        promoPrice: product.promo_price,
        promoMinQty: product.promo_min_qty,
        promoStartsAt: product.promo_starts_at,
        promoTiers: product.promo_tiers,
      })
    : null;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-ash bg-graphite transition-colors duration-200 hover:border-brand/60">
      <div className="relative aspect-square w-full overflow-hidden bg-coal">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={`Camisa ${product.name}`}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-coal text-mist">
            <Shirt className="size-10" aria-hidden="true" />
            <span className="sr-only">Imagem do produto indisponível</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <Badge category={product.category}>{CATEGORY_LABELS[product.category]}</Badge>
          {promo ? <Badge variant="promo">Promoção</Badge> : null}
        </div>
      </div>

<div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="line-clamp-2 font-display text-xl uppercase leading-tight tracking-wide text-paper sm:text-2xl">
            {product.name}
          </h3>
          <p className="truncate font-body text-sm text-mist h-5">
            {product.club}
            {product.season ? ` · ${product.season}` : ""}
          </p>
          <div className="flex-1" />
          <div className="min-h-[2.5rem] flex items-end">
            {promo && promoPrice != null ? (
              <div className="flex flex-wrap items-baseline gap-2 w-full">
                <p className="font-body text-sm text-mist line-through">{formatBRL(product.price)}</p>
                <p className="font-display text-xl tracking-wide text-brand sm:text-2xl">
                  {formatBRL(promoPrice)}
                </p>
              </div>
            ) : (
              <p className="font-display text-xl tracking-wide text-brand sm:text-2xl">
                {formatBRL(product.price)}
              </p>
            )}
          </div>
        </div>
        <Link
          href={`/produto/${product.slug}`}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-brand/60 px-4 py-2 font-body text-sm font-semibold text-brand transition-colors duration-200 hover:bg-brand hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Ver produto
        </Link>
      </div>
    </article>
  );
}
