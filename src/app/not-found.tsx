import Link from "next/link";
import Container from "@/components/ui/Container";
import Logo from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <Container className="py-24 sm:py-32">
      <div className="flex flex-col items-center gap-6 text-center">
        <Logo className="h-10 w-auto opacity-80" />
        <p className="font-display text-7xl uppercase leading-none tracking-wide text-brand sm:text-8xl">
          404
        </p>
        <h1 className="font-display text-4xl uppercase tracking-wide text-paper">
          Página não encontrada
        </h1>
        <p className="max-w-md font-body text-base leading-relaxed text-mist">
          O endereço que você acessou não existe ou foi movido. Volte para o catálogo e
          continue escolhendo o seu próximo manto.
        </p>
        <Link
          href="/catalogo"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-8 py-4 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Ver catálogo
        </Link>
      </div>
    </Container>
  );
}
