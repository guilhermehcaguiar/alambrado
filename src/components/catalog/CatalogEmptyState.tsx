import Link from "next/link";
import Logo from "@/components/brand/Logo";

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
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ash px-6 py-16 text-center">
      <Logo className="h-12 w-auto opacity-60" />
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
  );
}
