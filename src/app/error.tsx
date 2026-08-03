"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function GlobalError() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-ink px-4 py-24 text-paper">
      <div className="flex flex-col items-center gap-6 text-center">
        <Logo className="h-10 w-auto opacity-80" />
        <p className="font-display text-7xl uppercase leading-none tracking-wide text-brand">
          500
        </p>
        <h1 className="font-display text-4xl uppercase tracking-wide text-paper">
          Algo deu errado
        </h1>
        <p className="max-w-md font-body text-base leading-relaxed text-mist">
          Não conseguimos carregar esta página agora. Tente novamente em instantes.
        </p>
        <Link
          href="/catalogo"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-8 py-4 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Voltar ao catálogo
        </Link>
      </div>
    </div>
  );
}
