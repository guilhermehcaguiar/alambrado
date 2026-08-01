import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  total: number;
  basePath: string;
  params: Record<string, string>;
};

function buildHref(basePath: string, params: Record<string, string>, page: number) {
  const searchParams = new URLSearchParams(params);
  searchParams.set("page", String(page));
  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function Pagination({
  currentPage,
  totalPages,
  total,
  basePath,
  params,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-4 pt-2">
      {currentPage > 1 ? (
        <Link
          href={buildHref(basePath, params, currentPage - 1)}
          className="inline-flex min-h-11 items-center rounded-md border border-ash bg-graphite px-4 py-2 font-body text-sm font-semibold text-paper transition-colors duration-200 hover:border-brand/60 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Anterior
        </Link>
      ) : null}

      <p className="font-body text-sm text-mist">
        Página {currentPage} de {totalPages} · {total} produtos
      </p>

      {currentPage < totalPages ? (
        <Link
          href={buildHref(basePath, params, currentPage + 1)}
          className="inline-flex min-h-11 items-center rounded-md border border-ash bg-graphite px-4 py-2 font-body text-sm font-semibold text-paper transition-colors duration-200 hover:border-brand/60 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Próxima
        </Link>
      ) : null}
    </nav>
  );
}
