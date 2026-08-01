import type { Product } from "@/types/product";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProductImage from "@/components/product/ProductImage";
import ProductInfo from "@/components/product/ProductInfo";
import ProductPrice from "@/components/product/ProductPrice";
import ProductSelector from "@/components/product/ProductSelector";
import ProductGuideSection from "@/components/product/ProductGuideSection";

export default function ProductPage({ product }: { product: Product }) {
  return (
    <Container className="py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductImage
          imageUrl={product.image_url}
          alt={`Camisa ${product.name} — ${product.club || product.category}`}
        />

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

          <ProductSelector />

          <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-mist/40 bg-graphite/50 px-4 py-3">
            <span className="font-body text-sm font-medium text-paper">Personalização</span>
            <Badge>Disponível em breve</Badge>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-mist/40 bg-graphite/50 px-4 py-3">
            <span className="font-body text-sm font-medium text-paper">Patch</span>
            <Badge>Disponível em breve</Badge>
          </div>

          <Button disabled size="lg">
            Adicionar ao Carrinho
          </Button>

          <p className="font-body text-sm text-mist">
            Prazo de produção e entrega: <strong className="text-paper">15 a 25 dias úteis</strong>.
          </p>
        </div>
      </div>

      <ProductGuideSection />
    </Container>
  );
}
