import Container from "@/components/ui/Container";

export default function ProductLoading() {
  return (
    <Container className="py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square w-full animate-pulse rounded-xl bg-ash" />
        <div className="flex flex-col gap-6">
          <div className="h-8 w-32 animate-pulse rounded bg-ash" />
          <div className="h-12 w-2/3 animate-pulse rounded bg-ash" />
          <div className="h-10 w-28 animate-pulse rounded bg-ash" />
          <div className="h-24 w-full animate-pulse rounded bg-ash" />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {Array.from({ length: 7 }, (_, index) => (
              <div
                key={index}
                className="h-11 animate-pulse rounded-md bg-ash"
              />
            ))}
          </div>
          <div className="h-14 w-full animate-pulse rounded-md bg-ash" />
        </div>
      </div>
    </Container>
  );
}
