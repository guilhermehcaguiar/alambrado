import Image from "next/image";
import Link from "next/link";
import { Shirt } from "lucide-react";
import { formatBRL } from "@/utils/format";
import { CATEGORY_LABELS, type Product } from "@/types/product";
import Badge from "@/components/ui/Badge";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-ash bg-graphite">
      <div className="relative aspect-square w-full overflow-hidden bg-paper">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={`Camisa ${product.name}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-coal text-mist">
            <Shirt className="size-10" aria-hidden="true" />
            <span className="sr-only">Imagem do produto indisponível</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Badge variant="green">{CATEGORY_LABELS[product.category]}</Badge>
        <h3 className="font-display text-2xl uppercase leading-tight tracking-wide text-paper">
          {product.name}
        </h3>
        <p className="font-display text-2xl tracking-wide text-brand">
          {formatBRL(product.price)}
        </p>
        <Link
          href={`/produto/${product.slug}`}
          className="mt-2 inline-flex items-center justify-center rounded-md border border-brand/60 px-4 py-2 font-body text-sm font-semibold text-brand transition-colors duration-200 hover:bg-brand hover:text-ink"
        >
          Ver produto
        </Link>
      </div>
    </article>
  );
}
