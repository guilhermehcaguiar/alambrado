import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";
import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import ProductImage from "@/components/product/ProductImage";
import ProductInfo from "@/components/product/ProductInfo";
import ProductPrice from "@/components/product/ProductPrice";
import ProductPurchase from "@/components/product/ProductPurchase";
import ProductGuideSection from "@/components/product/ProductGuideSection";
import { CATEGORY_LABELS } from "@/types/product";

export default function ProductPage({ product }: { product: Product }) {
  return (
    <Container className="py-8 sm:py-12">
      <nav aria-label="Trilha de navegação" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 font-body text-sm text-mist">
          <li>
            <Link href="/" className="transition-colors duration-200 hover:text-brand">
              Início
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4" />
          </li>
          <li>
            <Link
              href="/catalogo"
              className="transition-colors duration-200 hover:text-brand"
            >
              Catálogo
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4" />
          </li>
          <li>
            <Link
              href={`/catalogo/${product.category}`}
              className="transition-colors duration-200 hover:text-brand"
            >
              {CATEGORY_LABELS[product.category]}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4" />
          </li>
          <li aria-current="page" className="font-semibold text-paper">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductImage imageUrl={product.image_url} alt={`Camisa ${product.name}`} />

        <div className="flex flex-col gap-6">
          <ProductInfo
            name={product.name}
            category={product.category}
            club={product.club}
            season={product.season}
            league={product.league}
          />

          <ProductPrice price={product.price} />

          <p className="font-body text-base leading-relaxed text-mist">
            {product.description}
          </p>

          <div className="rounded-xl border border-ash bg-graphite p-5 sm:p-6">
            <ProductPurchase product={product} />
          </div>
        </div>
      </div>

      <Container className="px-0">
        <Divider className="my-4" />
      </Container>

      <ProductGuideSection />
    </Container>
  );
}
