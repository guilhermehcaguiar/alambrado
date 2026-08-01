import Link from "next/link";
import { BRAND } from "@/config/brand";
import { getProducts } from "@/services/products";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";
import ProductGrid from "@/components/catalog/ProductGrid";
import CatalogEmptyState from "@/components/catalog/CatalogEmptyState";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  const novidades = products.slice(0, 4);
  const destaque = products.filter((product) => product.featured);

  return (
    <>
      <Container>
        <Section className="flex min-h-[60vh] flex-col items-start justify-center">
          <Badge variant="green">Camisas de futebol tailandesas 1:1</Badge>
          <h1 className="mt-6 font-display text-6xl uppercase leading-none tracking-wide text-paper sm:text-8xl">
            {BRAND.name}
          </h1>
          <p className="mt-4 font-subtitle text-xl uppercase tracking-[0.3em] text-brand">
            {BRAND.slogan}
          </p>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-mist">
            O catálogo promocional versão Torcedor. Confiança, qualidade e desempenho
            para quem vive o futebol de verdade.
          </p>
          <Link
            href="/catalogo"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-brand px-8 py-4 font-body text-lg font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Ver catálogo
          </Link>
        </Section>
      </Container>

      <Container>
        <Section className="space-y-6">
          <h2 className="font-subtitle text-2xl font-semibold uppercase tracking-wider text-paper">
            Novidades
          </h2>
          {novidades.length > 0 ? (
            <ProductGrid products={novidades} />
          ) : (
            <CatalogEmptyState
              title="Disponível em breve"
              message="Estamos preparando o catálogo."
            />
          )}
        </Section>
      </Container>

      {destaque.length > 0 ? (
        <Container>
          <Section className="space-y-6">
            <h2 className="font-subtitle text-2xl font-semibold uppercase tracking-wider text-paper">
              Produtos em destaque
            </h2>
            <ProductGrid products={destaque} />
          </Section>
        </Container>
      ) : null}
    </>
  );
}
