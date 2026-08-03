import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import CategoryProducts from "@/components/catalog/CategoryProducts";
import { CATEGORY_LABELS } from "@/types/product";

export const metadata: Metadata = {
  title: CATEGORY_LABELS.retro,
  alternates: {
    canonical: "/catalogo/retro",
  },
};

export const revalidate = 60;

export default function RetroPage() {
  return (
    <Container>
      <Section className="space-y-8">
        <PageHeader
          eyebrow="Categoria"
          title={CATEGORY_LABELS.retro}
          description="Retrôs e mantos marcantes para colecionar e reviver."
        />
        <CategoryProducts category="retro" />
      </Section>
    </Container>
  );
}
