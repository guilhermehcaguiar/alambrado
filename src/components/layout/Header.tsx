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
    <header className="sticky top-0 z-40 border-b border-ash bg-ink/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-2 sm:gap-4">
        <Link
          href="/"
          className="group flex min-h-11 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label={`${BRAND.name} — ${BRAND.slogan}`}
        >
          <span>
            <span className="block font-display text-xl leading-none tracking-wide text-paper transition-colors duration-200 group-hover:text-brand sm:text-2xl sm:tracking-wider">
              {BRAND.name}
            </span>
            <span className="block font-subtitle text-[0.6rem] uppercase tracking-[0.22em] text-brand sm:text-[0.65rem] sm:tracking-[0.3em]">
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
