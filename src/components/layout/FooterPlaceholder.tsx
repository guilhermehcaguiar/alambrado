import Link from "next/link";
import { BRAND } from "@/config/brand";
import Container from "@/components/ui/Container";

const CATEGORY_LINKS = [
  { href: "/catalogo/promocional-torcedor", label: "Promocional Torcedor" },
  { href: "/catalogo/infantil", label: "Kit Infantil" },
  { href: "/catalogo/jogador", label: "Jogador" },
  { href: "/catalogo/retro", label: "Retrô" },
] as const;

export default function FooterPlaceholder() {
  return (
    <footer className="border-t border-ash bg-coal">
      <Container className="flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-3xl tracking-wider text-paper">{BRAND.name}</p>
          <p className="mt-1 font-subtitle text-sm uppercase tracking-widest text-brand">
            {BRAND.slogan}
          </p>
        </div>

        <nav aria-label="Categorias">
          <ul className="space-y-2">
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
          <p className="font-body text-sm font-semibold text-paper">Prazo de entrega</p>
          <p className="mt-2 font-body text-sm text-mist">
            Os pedidos são produzidos e enviados em <strong className="text-paper">15 a 25 dias úteis</strong>.
          </p>
        </div>
      </Container>

      <div className="h-1 w-full bg-brand" />
    </footer>
  );
}
