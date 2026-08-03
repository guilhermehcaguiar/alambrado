import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import CategoryProducts from "@/components/catalog/CategoryProducts";
import { CATEGORY_LABELS } from "@/types/product";

export const metadata: Metadata = {
  title: CATEGORY_LABELS.torcedor,
  alternates: {
    canonical: "/catalogo/torcedor",
  },
};

export const revalidate = 60;

export default function TorcedorPage() {
  return (
    <Container>
      <Section className="space-y-8">
        <PageHeader
          eyebrow="Categoria"
          title={CATEGORY_LABELS.torcedor}
          description="Camisas versão Torcedor com caimento fiel, prontas para o jogo e para a arquibancada."
        />
        <CategoryProducts category="torcedor" />
      </Section>
    </Container>
  );
}
