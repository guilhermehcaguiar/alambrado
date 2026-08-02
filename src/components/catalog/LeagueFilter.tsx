import Link from "next/link";

type LeagueFilterProps = {
  leagues: string[];
  current: string;
  params: URLSearchParams;
};

export default function LeagueFilter({ leagues, current, params }: LeagueFilterProps) {
  if (leagues.length === 0) {
    return null;
  }

  const items = [{ value: "", label: "Todas as ligas" }, ...leagues.map((league) => ({
    value: league,
    label: league,
  }))];

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por liga">
      {items.map((item) => {
        const isActive = current === item.value;
        const nextParams = new URLSearchParams(params);
        nextParams.delete("page");
        if (item.value) {
          nextParams.set("league", item.value);
        } else {
          nextParams.delete("league");
        }
        const queryString = nextParams.toString();
        const href = queryString ? `/catalogo?${queryString}` : "/catalogo";
        return (
          <Link
            key={item.value || "all"}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 font-body text-sm font-semibold transition-colors duration-200 ${
              isActive
                ? "border-brand bg-brand text-ink"
                : "border-ash bg-graphite text-paper hover:border-brand/60"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
