import Link from "next/link";
import { BRAND } from "@/config/brand";
import Container from "@/components/ui/Container";
import Logo from "@/components/brand/Logo";
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
    <header className="sticky top-0 z-40 border-b border-ash bg-ink/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex min-h-11 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label={`${BRAND.name} — ${BRAND.slogan}`}
        >
          <Logo className="h-8 w-auto transition-opacity duration-200 group-hover:opacity-80" />
          <span className="hidden sm:inline">
            <span className="block font-display text-2xl leading-none tracking-wider text-paper">
              {BRAND.name}
            </span>
            <span className="block font-subtitle text-[0.65rem] uppercase tracking-[0.3em] text-brand">
              {BRAND.slogan}
            </span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-md px-3 font-body text-sm font-medium text-paper transition-colors duration-200 hover:bg-graphite hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
