import Link from "next/link";
import {
  BadgeCheck,
  Headset,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { BRAND } from "@/config/brand";
import { getLeagues, getProducts } from "@/services/products";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Divider from "@/components/ui/Divider";
import Logo from "@/components/brand/Logo";
import ProductGrid from "@/components/catalog/ProductGrid";
import CatalogEmptyState from "@/components/catalog/CatalogEmptyState";
import { CATEGORY_LABELS, CATEGORY_STATUS, type ProductCategory } from "@/types/product";

export const revalidate = 60;

const CATEGORIES: { key: ProductCategory; description: string; tag: string }[] = [
  {
    key: "torcedor",
    description: "Camisas versão Torcedor, com caimento fiel.",
    tag: "Disponível agora",
  },
  {
    key: "infantil",
    description: "Kits infantis para os pequenos torcedores.",
    tag: "Em breve",
  },
  {
    key: "jogador",
    description: "Modelos versão Jogador, do treino ao jogo.",
    tag: "Em breve",
  },
  {
    key: "retro",
    description: "Retrôs e mantos marcantes para colecionar.",
    tag: "Em breve",
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

export default async function HomePage() {
  const [products, leagues] = await Promise.all([getProducts(), getLeagues()]);
  const featured = products.filter((product) => product.featured);
  const highlights = featured.length > 0 ? featured : products.slice(0, 8);
  const highlightsTitle = featured.length > 0 ? "Destaques" : "Novidades";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ash">
        <div
          className="absolute inset-0 bg-fence-strong opacity-40 mask-fade-b"
          aria-hidden="true"
        />
        <div
          className="absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />
        <Container className="relative">
          <Section className="flex min-h-[80vh] flex-col items-start justify-center py-20">
            <Logo className="h-14 w-auto opacity-90 sm:h-16" priority />
            <h1 className="mt-6 font-display text-6xl uppercase leading-none tracking-wide text-paper sm:text-8xl lg:text-9xl">
              {BRAND.name}
            </h1>
            <p className="mt-3 font-subtitle text-lg uppercase tracking-[0.35em] text-brand sm:text-2xl">
              {BRAND.slogan}
            </p>
            <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-mist sm:text-lg">
              Camisas de futebol tailandesas 1:1. Catálogo de torcedor com qualidade,
              confiança e desempenho para quem vive o jogo de verdade.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/catalogo"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand px-8 py-4 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Ver catálogo
              </Link>
              <Link
                href="#como-comprar"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-paper/30 px-6 py-3 font-body text-base font-semibold text-paper transition-colors duration-200 hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Como funciona
              </Link>
            </div>
            {leagues.length > 0 ? (
              <p className="mt-10 max-w-xl font-body text-sm text-gray">
                {leagues.length} ligas disponíveis ·{" "}
                {products.length} camisas no catálogo
              </p>
            ) : null}
          </Section>
        </Container>
      </section>

      {/* Categorias */}
      <section className="border-b border-ash bg-graphite">
        <Container>
          <Section className="space-y-8">
            <SectionHeading
              eyebrow="Coleções"
              title="Escolha sua categoria"
              description="Do clássico torcedor aos mantos retrô e kits infantis, cada coleção tem o seu jeito."
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORIES.map((category) => {
                const status = CATEGORY_STATUS[category.key];
                const isActive = status === "active";
                return (
                  <li key={category.key}>
                    <Link
                      href={`/catalogo/${category.key}`}
                      className="group flex h-full flex-col gap-3 rounded-xl border border-ash bg-ink p-6 transition-colors duration-200 hover:border-brand/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-display text-2xl uppercase tracking-wide text-paper transition-colors duration-200 group-hover:text-brand">
                          {CATEGORY_LABELS[category.key]}
                        </p>
                        <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
                      </div>
                      <p className="font-body text-sm leading-relaxed text-mist">
                        {category.description}
                      </p>
                      <span
                        className={`mt-auto inline-flex w-fit items-center rounded-full border px-3 py-1 font-body text-xs font-semibold uppercase tracking-wider ${
                          isActive
                            ? "border-brand/60 text-brand"
                            : "border-ash text-mist"
                        }`}
                      >
                        {category.tag}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        </Container>
      </section>

      {/* Ligas */}
      {leagues.length > 0 ? (
        <section className="border-b border-ash">
          <Container>
            <Section className="space-y-8">
              <SectionHeading
                eyebrow="Ligas"
                title="Seu time, nossa prateleira"
                description="Filtre por liga e encontre o manto do clube que você torce."
              />
              <ul className="flex flex-wrap gap-2">
                {leagues.map((league) => (
                  <li key={league}>
                    <Link
                      href={`/catalogo?league=${encodeURIComponent(league)}`}
                      className="inline-flex min-h-11 items-center rounded-full border border-ash bg-graphite px-5 py-2 font-body text-sm font-semibold text-paper transition-colors duration-200 hover:border-brand/60 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {league}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          </Container>
        </section>
      ) : null}

      {/* Novidades */}
      <section className="border-b border-ash bg-graphite">
        <Container>
          <Section className="space-y-8">
            <SectionHeading
              eyebrow={highlightsTitle}
              title="Os mais recentes"
              description="As camisas que acabaram de chegar no catálogo."
            />
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
      </section>

      {/* Diferenciais */}
      <section className="border-b border-ash">
        <Container>
          <Section className="space-y-8">
            <SectionHeading
              eyebrow="Por que a ALAMBRADO"
              title="Feito para quem vive o futebol"
              description="Cada peça é selecionada e conferida para entregar o melhor da réplica tailandesa 1:1."
              align="center"
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DIFFERENTIALS.map((item) => (
                <li
                  key={item.title}
                  className="group flex items-start gap-4 rounded-xl border border-ash bg-graphite p-6 transition-colors duration-200 hover:border-brand/60"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand transition-colors duration-200 group-hover:bg-brand group-hover:text-ink">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
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
      </section>

      {/* Como comprar */}
      <section id="como-comprar" className="border-b border-ash bg-graphite">
        <Container>
          <Section className="space-y-8">
            <SectionHeading
              eyebrow="Como comprar"
              title="Do clique ao manto em 4 passos"
              align="center"
            />
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="relative flex flex-col gap-3 rounded-xl border border-ash bg-ink p-6"
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
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-fence opacity-30" aria-hidden="true" />
        <Container className="relative">
          <Section className="flex flex-col items-center gap-6 py-20 text-center sm:py-24">
            <Logo className="h-12 w-auto opacity-90" />
            <h2 className="max-w-2xl font-display text-5xl uppercase leading-none tracking-wide text-paper sm:text-6xl">
              Seu próximo manto está aqui.
            </h2>
            <p className="max-w-md font-body text-base leading-relaxed text-mist">
              Escolha sua camisa, adicione ao carrinho e finalize o pedido pelo WhatsApp.
            </p>
            <Link
              href="/catalogo"
              className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand px-8 py-4 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              Explorar catálogo
            </Link>
          </Section>
        </Container>
      </section>

      <Container>
        <Divider className="my-2" />
      </Container>
    </>
  );
}
