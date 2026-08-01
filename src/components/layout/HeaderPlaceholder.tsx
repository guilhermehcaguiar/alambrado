import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { BRAND } from "@/config/brand";
import Container from "@/components/ui/Container";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
] as const;

export default function HeaderPlaceholder() {
  return (
    <header className="sticky top-0 z-40 border-b border-ash bg-ink/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl tracking-wider text-paper transition-colors duration-200 hover:text-brand"
        >
          {BRAND.name}
          <span className="ml-2 text-sm text-mist">| {BRAND.slogan}</span>
        </Link>

        <nav aria-label="Navegação principal">
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="hidden sm:block">
                <Link
                  href={link.href}
                  className="font-body text-sm font-medium text-paper transition-colors duration-200 hover:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/carrinho"
                aria-label="Carrinho"
                className="flex items-center gap-2 rounded-md border border-ash p-2 text-paper transition-colors duration-200 hover:border-brand hover:text-brand"
              >
                <ShoppingBag className="size-5" aria-hidden="true" />
                <span className="sr-only">Carrinho</span>
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
