import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import CategoryProducts from "@/components/catalog/CategoryProducts";
import { CATEGORY_LABELS } from "@/types/product";

export const metadata: Metadata = {
  title: CATEGORY_LABELS.jogador,
};

export const revalidate = 60;

export default function JogadorPage() {
  return (
    <Container>
      <Section className="space-y-8">
        <h1 className="font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl">
          {CATEGORY_LABELS.jogador}
        </h1>
        <CategoryProducts category="jogador" />
      </Section>
    </Container>
  );
}
