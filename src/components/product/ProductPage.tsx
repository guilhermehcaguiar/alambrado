import type { Product } from "@/types/product";
import Container from "@/components/ui/Container";
import ProductImage from "@/components/product/ProductImage";
import ProductInfo from "@/components/product/ProductInfo";
import ProductPrice from "@/components/product/ProductPrice";
import ProductPurchase from "@/components/product/ProductPurchase";
import ProductGuideSection from "@/components/product/ProductGuideSection";

export default function ProductPage({ product }: { product: Product }) {
  return (
    <Container className="py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductImage imageUrl={product.image_url} alt={`Camisa ${product.name}`} />

        <div className="flex flex-col gap-6">
          <ProductInfo
            name={product.name}
            category={product.category}
            club={product.club}
            season={product.season}
          />

          <ProductPrice price={product.price} />

          <p className="font-body text-base leading-relaxed text-mist">
            {product.description}
          </p>

          <ProductPurchase product={product} />
        </div>
      </div>

      <ProductGuideSection />
    </Container>
  );
}
