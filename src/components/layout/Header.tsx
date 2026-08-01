import Link from "next/link";
import { BRAND } from "@/config/brand";
import Container from "@/components/ui/Container";
import CartIcon from "@/components/cart/CartIcon";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
] as const;

export default function Header() {
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
              <CartIcon />
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
