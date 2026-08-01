import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "A ALAMBRADO nasceu para quem vive o futebol. Camisas de futebol tailandesas 1:1, com qualidade, confiança e desempenho.",
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
        <div>
          <Badge variant="green">Sobre a ALAMBRADO</Badge>
          <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl">
            Quem veste, sente.
          </h1>
          <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-mist">
            A ALAMBRADO nasceu para quem vive o futebol. Trabalhamos com camisas de
            futebol tailandesas 1:1, selecionadas e conferidas peça a peça para entregar
            qualidade, confiança, modernidade e desempenho em cada manto.
          </p>
        </div>

        <div>
          <h2 className="font-subtitle text-2xl font-semibold uppercase tracking-wider text-paper">
            Nossos valores
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value) => (
              <li
                key={value.title}
                className="rounded-xl border border-ash bg-graphite p-6"
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
          <h2 className="font-subtitle text-2xl font-semibold uppercase tracking-wider text-paper">
            Qualidade que você confere
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {QUALITY_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-xl border border-ash bg-graphite px-5 py-4"
              >
                <BadgeCheck className="size-5 shrink-0 text-brand" aria-hidden="true" />
                <p className="font-body text-sm leading-relaxed text-mist">{point}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-start gap-4 rounded-xl border border-ash bg-graphite p-8">
          <h2 className="font-subtitle text-xl font-semibold uppercase tracking-wider text-paper">
            Pronto para escolher seu manto?
          </h2>
          <p className="max-w-xl font-body text-sm leading-relaxed text-mist">
            Confira o catálogo e encontre a camisa do seu time, do seu jeito.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-8 py-4 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Ver catálogo
          </Link>
        </div>
      </Section>
    </Container>
  );
}
