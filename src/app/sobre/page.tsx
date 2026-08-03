import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import SectionHeading from "@/components/ui/SectionHeading";
import Logo from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "A ALAMBRADO nasceu para quem vive o futebol. Camisas de futebol tailandesas 1:1, com qualidade, confiança e desempenho.",
  alternates: {
    canonical: "/sobre",
  },
};

const VALUES = [
  { title: "Futebol", text: "Nosso norte é a paixão pelo jogo e pelos mantos." },
  { title: "Confiança", text: "Atendimento próximo e transparente, do pedido à entrega." },
  { title: "Qualidade", text: "Réplicas 1:1 com caimento e detalhes fiéis ao original." },
  { title: "Modernidade", text: "Processo simples, sob demanda, com o que há de melhor." },
  { title: "Desempenho", text: "Tecido pensado para o dia a dia e para o torcedor." },
] as const;

const QUALITY_POINTS = [
  "Seleção criteriosa de cada modelo e fornecedor",
  "Tecido premium com toque agradável e boa caída",
  "Costuras reforçadas e acabamento cuidadoso",
  "Produção sob demanda, reduzindo desperdício",
] as const;

export default function SobrePage() {
  return (
    <Container>
      <Section className="space-y-12">
        <div className="relative overflow-hidden rounded-xl border border-ash bg-graphite p-8 sm:p-12">
          <div className="absolute inset-0 bg-fence opacity-40 mask-fade-b" aria-hidden="true" />
          <div className="relative">
            <PageHeader
              eyebrow="Sobre a ALAMBRADO"
              title="Quem veste, sente."
              description="A ALAMBRADO nasceu para quem vive o futebol. Trabalhamos com camisas de futebol tailandesas 1:1, selecionadas e conferidas peça a peça para entregar qualidade, confiança, modernidade e desempenho em cada manto."
            />
          </div>
        </div>

        <div>
          <SectionHeading eyebrow="Valores" title="Nossos valores" />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value) => (
              <li
                key={value.title}
                className="rounded-xl border border-ash bg-graphite p-6 transition-colors duration-200 hover:border-brand/60"
              >
                <p className="font-subtitle text-base font-semibold uppercase tracking-wide text-paper">
                  {value.title}
                </p>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-mist">
                  {value.text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionHeading eyebrow="Qualidade" title="Qualidade que você confere" />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {QUALITY_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-xl border border-ash bg-graphite px-5 py-4"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand/15 text-brand">
                  <BadgeCheck className="size-4" aria-hidden="true" />
                </span>
                <p className="font-body text-sm leading-relaxed text-mist">{point}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-col items-start gap-4 overflow-hidden rounded-xl border border-ash bg-graphite p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="absolute inset-0 bg-fence opacity-30" aria-hidden="true" />
          <div className="relative">
            <Logo className="h-8 w-auto" />
            <h2 className="mt-3 font-subtitle text-xl font-semibold uppercase tracking-wider text-paper">
              Pronto para escolher seu manto?
            </h2>
            <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-mist">
              Confira o catálogo e encontre a camisa do seu time, do seu jeito.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="relative inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-8 py-4 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Ver catálogo
          </Link>
        </div>
      </Section>
    </Container>
  );
}
