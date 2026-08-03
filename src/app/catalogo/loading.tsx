import Container from "@/components/ui/Container";
import ProductGridSkeleton from "@/components/catalog/ProductGridSkeleton";

export default function CatalogoLoading() {
  return (
    <Container>
      <div className="space-y-8 py-10 sm:py-14">
        <div className="space-y-3">
          <div className="h-5 w-32 animate-pulse rounded-full bg-ash" />
          <div className="h-12 w-64 animate-pulse rounded bg-ash" />
        </div>
        <div className="h-10 w-full animate-pulse rounded bg-ash sm:max-w-md" />
        <ProductGridSkeleton count={6} />
      </div>
    </Container>
  );
}
