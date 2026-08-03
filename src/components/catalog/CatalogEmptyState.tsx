import Link from "next/link";
import { Shirt } from "lucide-react";

type CatalogEmptyStateProps = {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function CatalogEmptyState({
  title,
  message,
  actionHref,
  actionLabel,
}: CatalogEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-ash px-6 py-16 text-center">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-3">
      <span className="flex size-16 items-center justify-center rounded-full bg-graphite text-gray">
        <Shirt className="size-7" aria-hidden="true" />
      </span>
      <p className="font-subtitle text-xl font-semibold uppercase tracking-wide text-paper">
        {title}
      </p>
      <p className="max-w-md font-body text-sm leading-relaxed text-mist">{message}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-6 py-3 font-body text-base font-semibold text-ink transition-colors duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {actionLabel}
        </Link>
      ) : null}
      </div>
    </div>
  );
}
