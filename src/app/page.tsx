import Link from "next/link";
import { BRAND } from "@/config/brand";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";

export default function HomePage() {
  return (
    <Container>
      <Section className="flex min-h-[70vh] flex-col items-start justify-center">
        <Badge variant="green">Camisas de futebol tailandesas 1:1</Badge>
        <h1 className="mt-6 font-display text-6xl uppercase leading-none tracking-wide text-paper sm:text-8xl">
          {BRAND.name}
        </h1>
        <p className="mt-4 font-subtitle text-xl uppercase tracking-[0.3em] text-brand">
          {BRAND.slogan}
        </p>
        <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-mist">
          O catálogo promocional versão Torcedor chega em breve. Confiança, qualidade e
          desempenho para quem vive o futebol de verdade.
        </p>
        <Link
          href="/catalogo"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-brand px-8 py-4 font-body text-lg font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Ver catálogo
        </Link>
      </Section>
    </Container>
  );
}
