import Link from "next/link";
import { BadgeCheck, Headset, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { BRAND } from "@/config/brand";
import { getProducts } from "@/services/products";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";
import ProductGrid from "@/components/catalog/ProductGrid";
import CatalogEmptyState from "@/components/catalog/CatalogEmptyState";
import { CATEGORY_LABELS, CATEGORY_STATUS, type ProductCategory } from "@/types/product";

export const revalidate = 60;

const CATEGORIES: { key: ProductCategory; description: string }[] = [
  {
    key: "torcedor",
    description: "Camisas versão Torcedor, com caimento fiel.",
  },
  {
    key: "infantil",
    description: "Kits infantis para os pequenos torcedores.",
  },
  {
    key: "jogador",
    description: "Modelos versão Jogador, do treino ao jogo.",
  },
  {
    key: "retro",
    description: "Retrôs e mantos marcantes para colecionar.",
  },
] as const;

const DIFFERENTIALS = [
  {
    icon: ShieldCheck,
    title: "Qualidade Tailandesa",
    text: "Réplicas 1:1 com caimento e detalhes fiéis ao original.",
  },
  {
    icon: Sparkles,
    title: "Tecido Premium",
    text: "Tecido respirável e toque agradável para o dia a dia.",
  },
  {
    icon: BadgeCheck,
    title: "Acabamento Cuidadoso",
    text: "Costuras reforçadas e escudo aplicado com capricho.",
  },
  {
    icon: Headset,
    title: "Atendimento pelo WhatsApp",
    text: "Suporte próximo, do primeiro clique até a entrega.",
  },
  {
    icon: Truck,
    title: "Prazo 20 a 30 dias úteis",
    text: "Produzido sob demanda e enviado com cuidado.",
  },
] as const;

const STEPS = [
  { title: "Escolha o manto", text: "Navegue pelo catálogo e encontre sua camisa." },
  { title: "Selecione o tamanho", text: "Confira a tabela de medidas na página do produto." },
  { title: "Adicione ao carrinho", text: "Ajuste a quantidade e adicione ao carrinho." },
  { title: "Finalize no WhatsApp", text: "Informe seu nome e feche o pedido no WhatsApp." },
] as const;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <span className="h-0.5 w-10 bg-brand" aria-hidden="true" />
      <h2 className="font-subtitle text-2xl font-semibold uppercase tracking-wider text-paper sm:text-3xl">
        {children}
      </h2>
    </div>
  );
}

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((product) => product.featured);
  const highlights = featured.length > 0 ? featured : products.slice(0, 4);
  const highlightsTitle = featured.length > 0 ? "Destaques" : "Novidades";

  return (
    <>
      <Container>
        <Section className="flex min-h-[60vh] flex-col items-start justify-center">
          <Badge variant="green">Camisas de futebol tailandesas 1:1</Badge>
          <h1 className="mt-6 font-display text-6xl uppercase leading-none tracking-wide text-paper sm:text-7xl lg:text-8xl">
            {BRAND.name}
          </h1>
          <p className="mt-4 font-subtitle text-xl uppercase tracking-[0.3em] text-brand">
            {BRAND.slogan}
          </p>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-mist">
            O catálogo de camisas de torcedor. Confiança, qualidade e desempenho para quem
            vive o futebol de verdade.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-8 py-4 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Ver catálogo
            </Link>
            <Link
              href="#como-comprar"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-paper/30 px-6 py-3 font-body text-base font-semibold text-paper transition-colors duration-200 hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Como funciona
            </Link>
          </div>
        </Section>
      </Container>

      <Container>
        <Section className="space-y-6">
          <SectionHeading>Categorias</SectionHeading>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => {
              const status = CATEGORY_STATUS[category.key];
              const isActive = status === "active";
              return (
                <li key={category.key}>
                  <Link
                    href={`/catalogo/${category.key}`}
                    className="flex h-full flex-col gap-3 rounded-xl border border-ash bg-graphite p-6 transition-colors duration-200 hover:border-brand/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-2xl uppercase tracking-wide text-paper">
                        {CATEGORY_LABELS[category.key]}
                      </p>
                    </div>
                    <p className="font-body text-sm leading-relaxed text-mist">
                      {category.description}
                    </p>
                    <span className="mt-auto inline-flex w-fit items-center rounded-full border border-ash px-3 py-1 font-body text-xs font-semibold uppercase tracking-wider text-mist">
                      {isActive ? "Disponível agora" : "Disponível em breve"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      </Container>

      <Container>
        <Section className="space-y-6">
          <SectionHeading>{highlightsTitle}</SectionHeading>
          {highlights.length > 0 ? (
            <ProductGrid products={highlights} />
          ) : (
            <CatalogEmptyState
              title="Disponível em breve"
              message="Estamos preparando o catálogo com os próximos mantos."
              actionHref="/catalogo"
              actionLabel="Ver catálogo"
            />
          )}
        </Section>
      </Container>

      <Container>
        <Section className="space-y-6">
          <SectionHeading>Por que a ALAMBRADO</SectionHeading>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIALS.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-ash bg-graphite p-6"
              >
                <item.icon className="size-6 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="font-subtitle text-base font-semibold uppercase tracking-wide text-paper">
                    {item.title}
                  </p>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-mist">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </Container>

      <Container>
        <Section id="como-comprar" className="space-y-6">
          <SectionHeading>Como comprar</SectionHeading>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col gap-3 rounded-xl border border-ash bg-graphite p-6"
              >
                <span
                  className="flex size-11 items-center justify-center rounded-full bg-brand font-subtitle text-lg font-semibold text-ink"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <p className="font-subtitle text-base font-semibold uppercase tracking-wide text-paper">
                  {step.title}
                </p>
                <p className="font-body text-sm leading-relaxed text-mist">{step.text}</p>
              </li>
            ))}
          </ol>
        </Section>
      </Container>

      <Container>
        <Section className="flex flex-col items-center gap-6 py-16 text-center sm:py-20">
          <h2 className="max-w-2xl font-display text-5xl uppercase leading-none tracking-wide text-paper sm:text-6xl">
            Seu próximo manto está aqui.
          </h2>
          <p className="max-w-md font-body text-base leading-relaxed text-mist">
            Escolha sua camisa, adicione ao carrinho e finalize o pedido pelo WhatsApp.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-8 py-4 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Explorar catálogo
          </Link>
        </Section>
      </Container>
    </>
  );
}
