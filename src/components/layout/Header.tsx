import Link from "next/link";
import { BRAND } from "@/config/brand";
import Container from "@/components/ui/Container";
import CartIcon from "@/components/cart/CartIcon";
import MobileMenu from "@/components/layout/MobileMenu";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
] as const;

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ash bg-ink/95">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-2xl tracking-wider text-paper transition-colors duration-200 hover:text-brand"
        >
          {BRAND.name}
          <span className="ml-2 hidden text-xs text-mist sm:inline sm:text-sm">
            | {BRAND.slogan}
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden sm:block">
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
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

        <div className="flex items-center gap-2 sm:hidden">
          <CartIcon />
          <MobileMenu links={NAV_LINKS} />
        </div>
      </Container>
    </header>
  );
}
