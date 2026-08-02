import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import CategoryFilter from "@/components/catalog/CategoryFilter";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import LeagueFilter from "@/components/catalog/LeagueFilter";
import ProductGrid from "@/components/catalog/ProductGrid";
import CatalogEmptyState from "@/components/catalog/CatalogEmptyState";
import Pagination from "@/components/catalog/Pagination";
import { PAGE_SIZE, getLeagues, searchProducts } from "@/services/products";
import { parseCategory, parseLeague, parseSort } from "@/utils/catalog";

export const metadata: Metadata = {
  title: "Catálogo Promocional",
  description:
    "Explore o catálogo promocional de camisas de futebol tailandesas 1:1 da ALAMBRADO. Torcedor, Kit Infantil, Jogador e Retrô.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = parseCategory(first(params.category));
  const league = parseLeague(first(params.league));
  const query = first(params.q) ?? "";
  const sort = parseSort(first(params.sort));
  const page = Math.max(1, Number.parseInt(first(params.page) ?? "1", 10) || 1);

  const [leagues, { products, total }] = await Promise.all([
    getLeagues(),
    searchProducts({
      category,
      league,
      query,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const urlParams = new URLSearchParams();
  if (category !== "all") {
    urlParams.set("category", category);
  }
  if (league) {
    urlParams.set("league", league);
  }
  if (query) {
    urlParams.set("q", query);
  }
  if (sort !== "newest") {
    urlParams.set("sort", sort);
  }

  const paginationParams: Record<string, string> = {
    ...(category !== "all" ? { category } : {}),
    ...(league ? { league } : {}),
    ...(query ? { q: query } : {}),
    ...(sort !== "newest" ? { sort } : {}),
  };

  const clearParams = new URLSearchParams();
  if (category !== "all") {
    clearParams.set("category", category);
  }
  if (league) {
    clearParams.set("league", league);
  }
  if (sort !== "newest") {
    clearParams.set("sort", sort);
  }
  const clearQueryString = clearParams.toString();
  const clearSearchHref = clearQueryString ? `/catalogo?${clearQueryString}` : "/catalogo";

  const emptyTitle = query
    ? "Nenhum resultado"
    : category !== "all"
      ? "Disponível em breve"
      : "Disponível em breve";

  const emptyMessage = query
    ? `Nenhum produto encontrado para "${query}". Tente outro nome ou limpe a busca.`
    : category !== "all"
      ? "Estamos preparando esta categoria. Volte em breve."
      : "Estamos preparando o catálogo. Volte em breve.";

  return (
    <Container>
      <Section className="space-y-8">
        <div className="space-y-6">
          <h1 className="font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl">
            Catálogo Promocional
          </h1>
          <CategoryFilter current={category} params={urlParams} />
          <LeagueFilter leagues={leagues} current={league} params={urlParams} />
          <CatalogFilters defaultQuery={query} defaultSort={sort} />
        </div>

        {products.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-body text-sm text-mist">
                {total === 1 ? "1 produto encontrado" : `${total} produtos encontrados`}
              </p>
            </div>
            <ProductGrid products={products} />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              total={total}
              basePath="/catalogo"
              params={paginationParams}
            />
          </>
        ) : (
          <CatalogEmptyState
            title={emptyTitle}
            message={emptyMessage}
            actionHref={query ? clearSearchHref : "/catalogo"}
            actionLabel={query ? "Limpar busca" : "Ver catálogo"}
          />
        )}
      </Section>
    </Container>
  );
}
