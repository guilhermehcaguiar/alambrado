"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { ProductSort } from "@/utils/catalog";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Mais recentes" },
  { value: "price-asc", label: "Preço crescente" },
  { value: "price-desc", label: "Preço decrescente" },
  { value: "name-asc", label: "Nome A–Z" },
  { value: "season-desc", label: "Temporada decrescente" },
  { value: "season-asc", label: "Temporada crescente" },
];

type CatalogFiltersProps = {
  defaultQuery: string;
  defaultSort: ProductSort;
};

export default function CatalogFilters({ defaultQuery, defaultSort }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultQuery);
  const isFirstRender = useRef(true);

  function updateParams(partial: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    for (const [key, value] of Object.entries(partial)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      updateParams({ q: query.trim() });
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative flex-1">
        <span className="sr-only">Buscar produto</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist"
          aria-hidden="true"
        />
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome"
          className="min-h-11 w-full rounded-md border border-ash bg-graphite py-2.5 pl-9 pr-10 font-body text-base text-paper placeholder:text-gray focus:outline-2 focus:outline-offset-2 focus:outline-brand"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Limpar busca"
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-mist transition-colors duration-200 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </label>

      <label>
        <span className="sr-only">Ordenar por</span>
        <select
          value={defaultSort}
          onChange={(event) => updateParams({ sort: event.target.value })}
          className="min-h-11 w-full rounded-md border border-ash bg-graphite px-3 py-2.5 font-body text-base text-paper focus:outline-2 focus:outline-offset-2 focus:outline-brand sm:w-auto"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
