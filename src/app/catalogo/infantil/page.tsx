import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import CategoryProducts from "@/components/catalog/CategoryProducts";
import { CATEGORY_LABELS } from "@/types/product";

export const metadata: Metadata = {
  title: CATEGORY_LABELS.infantil,
  alternates: {
    canonical: "/catalogo/infantil",
  },
};

export const revalidate = 60;

export default function InfantilPage() {
  return (
    <Container>
      <Section className="space-y-8">
        <PageHeader
          eyebrow="Categoria"
          title={CATEGORY_LABELS.infantil}
          description="Kits infantis para os pequenos torcedores começarem cedo."
        />
        <CategoryProducts category="infantil" />
      </Section>
    </Container>
  );
}
