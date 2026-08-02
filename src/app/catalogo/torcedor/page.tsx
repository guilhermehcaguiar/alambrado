import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import CategoryProducts from "@/components/catalog/CategoryProducts";
import { CATEGORY_LABELS } from "@/types/product";

export const metadata: Metadata = {
  title: CATEGORY_LABELS.torcedor,
};

export const revalidate = 60;

export default function TorcedorPage() {
  return (
    <Container>
      <Section className="space-y-8">
        <h1 className="font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl">
          {CATEGORY_LABELS.torcedor}
        </h1>
        <CategoryProducts category="torcedor" />
      </Section>
    </Container>
  );
}
