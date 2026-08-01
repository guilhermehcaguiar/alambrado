export default function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-ash bg-graphite">
      <div className="aspect-square w-full animate-pulse bg-ash" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-5 w-28 animate-pulse rounded-full bg-ash" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-ash" />
        <div className="h-6 w-16 animate-pulse rounded bg-ash" />
        <div className="mt-2 h-10 w-full animate-pulse rounded-md bg-ash" />
      </div>
    </div>
  );
}
