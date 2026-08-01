import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Container>
      <Section>
        <Badge variant="green">Estrutura pronta</Badge>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-mist">
          {description}
        </p>
      </Section>
    </Container>
  );
}
