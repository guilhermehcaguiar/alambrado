import { Shirt } from "lucide-react";

type CatalogEmptyStateProps = {
  title: string;
  message: string;
};

export default function CatalogEmptyState({ title, message }: CatalogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ash px-6 py-16 text-center">
      <Shirt className="size-10 text-mist" aria-hidden="true" />
      <p className="font-subtitle text-xl font-semibold uppercase tracking-wide text-paper">
        {title}
      </p>
      <p className="max-w-md font-body text-sm leading-relaxed text-mist">{message}</p>
    </div>
  );
}
