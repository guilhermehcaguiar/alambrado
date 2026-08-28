import Link from "next/link";
import { BRAND } from "@/config/brand";
import Container from "@/components/ui/Container";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
  { href: "/carrinho", label: "Carrinho" },
] as const;

const CATEGORY_LINKS = [
  { href: "/catalogo/torcedor", label: "Torcedor" },
  { href: "/catalogo/infantil", label: "Kit Infantil" },
  { href: "/catalogo/jogador", label: "Jogador" },
  { href: "/catalogo/retro", label: "Retrô" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ash bg-coal">
      <div className="bg-fence">
        <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div className="max-w-xs">
            <Link
              href="/"
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              aria-label={BRAND.name}
            >
              <span className="block font-display text-2xl leading-none tracking-wider text-paper">
                {BRAND.name}
              </span>
              <span className="block font-subtitle text-xs uppercase tracking-[0.3em] text-brand">
                {BRAND.slogan}
              </span>
            </Link>
            <p className="mt-4 font-body text-sm leading-relaxed text-mist">
              Camisas de futebol tailandesas 1:1, produzidas sob demanda com acabamento
              cuidadoso.
            </p>
          </div>

          <nav aria-label="Navegação principal">
            <p className="font-subtitle text-sm font-semibold uppercase tracking-wider text-paper">
              Navegação
            </p>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-mist transition-colors duration-200 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Categorias">
            <p className="font-subtitle text-sm font-semibold uppercase tracking-wider text-paper">
              Categorias
            </p>
            <ul className="mt-4 space-y-2.5">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-mist transition-colors duration-200 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-xs">
            <p className="font-subtitle text-sm font-semibold uppercase tracking-wider text-paper">
              Atendimento
            </p>
            <ul className="mt-4 space-y-2.5 font-body text-sm text-mist">
              <li>Recife, Pernambuco · Brasil</li>
              <li>
                Pedidos e dúvidas pelo WhatsApp, sem sair do carrinho.
              </li>
              <li>
                Prazo de entrega:{" "}
                <strong className="text-paper">15 a 20 dias úteis</strong>.
              </li>
            </ul>
          </div>
        </Container>
      </div>

      <div className="border-t border-ash">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 sm:flex-row">
          <p className="font-body text-xs text-gray">
            © {year} {BRAND.name}. Todos os direitos reservados.
          </p>
          <p className="font-subtitle text-xs uppercase tracking-widest text-gray">
            {BRAND.slogan}
          </p>
        </Container>
      </div>

      <div className="h-1 w-full bg-brand" />
    </footer>
  );
}
