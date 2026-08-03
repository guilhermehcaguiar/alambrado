import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import CategoryProducts from "@/components/catalog/CategoryProducts";
import { CATEGORY_LABELS } from "@/types/product";

export const metadata: Metadata = {
  title: CATEGORY_LABELS.jogador,
  alternates: {
    canonical: "/catalogo/jogador",
  },
};

export const revalidate = 60;

export default function JogadorPage() {
  return (
    <Container>
      <Section className="space-y-8">
        <PageHeader
          eyebrow="Categoria"
          title={CATEGORY_LABELS.jogador}
          description="Modelos versão Jogador, do treino ao dia de jogo."
        />
        <CategoryProducts category="jogador" />
      </Section>
    </Container>
  );
}
