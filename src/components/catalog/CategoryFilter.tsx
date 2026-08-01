import Link from "next/link";
import { CATEGORY_LABELS, PRODUCT_CATEGORIES } from "@/types/product";
import type { CategoryFilter as CategoryFilterValue } from "@/utils/catalog";

type CategoryFilterProps = {
  current: CategoryFilterValue;
};

export default function CategoryFilter({ current }: CategoryFilterProps) {
  const items: { value: CategoryFilterValue; label: string }[] = [
    { value: "all", label: "Todos" },
    ...PRODUCT_CATEGORIES.map((category) => ({
      value: category as CategoryFilterValue,
      label: CATEGORY_LABELS[category],
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
      {items.map((item) => {
        const href =
          item.value === "all" ? "/catalogo" : `/catalogo?category=${item.value}`;
        const isActive = current === item.value;
        return (
          <Link
            key={item.value}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full border px-4 py-2 font-body text-sm font-semibold transition-colors duration-200 ${
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
