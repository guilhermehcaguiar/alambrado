import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-ash px-6 py-16 text-center">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-4">
      <span className="flex size-16 items-center justify-center rounded-full bg-graphite text-gray">
        <ShoppingBag className="size-7" aria-hidden="true" />
      </span>
      <p className="font-subtitle text-2xl font-semibold uppercase tracking-wide text-paper">
        Seu carrinho está vazio.
      </p>
      <p className="max-w-md font-body text-sm leading-relaxed text-mist">
        Escolha seu próximo manto no catálogo.
      </p>
      <Link
        href="/catalogo"
        className="mt-2 inline-flex items-center justify-center rounded-md bg-brand px-8 py-4 font-body text-lg font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Ver catálogo
      </Link>
      </div>
    </div>
  );
}
