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

function getPageItems(currentPage: number, totalPages: number): Array<number | "…"> {
  const items: Array<number | "…"> = [];
  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page++) {
      items.push(page);
    }
    return items;
  }
  items.push(1);
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) {
    items.push("…");
  }
  for (let page = start; page <= end; page++) {
    items.push(page);
  }
  if (end < totalPages - 1) {
    items.push("…");
  }
  items.push(totalPages);
  return items;
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

  const items = getPageItems(currentPage, totalPages);

  return (
    <nav aria-label="Paginação" className="flex flex-col items-center gap-3 pt-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {items.map((item, index) =>
          item === "…" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex min-h-11 min-w-8 items-center justify-center px-1 font-body text-sm text-mist"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={buildHref(basePath, params, item)}
              aria-current={item === currentPage ? "page" : undefined}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 py-2 font-body text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                item === currentPage
                  ? "border-brand bg-brand text-graphite"
                  : "border-ash bg-graphite text-paper hover:border-brand/60 hover:text-brand"
              }`}
            >
              {item}
            </Link>
          ),
        )}
      </div>
      <p className="font-body text-sm text-mist">
        Página {currentPage} de {totalPages} · {total} produtos
      </p>
    </nav>
  );
}
