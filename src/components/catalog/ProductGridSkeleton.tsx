import ProductCardSkeleton from "./ProductCardSkeleton";

type ProductGridSkeletonProps = {
  count?: number;
};

export default function ProductGridSkeleton({ count = 6 }: ProductGridSkeletonProps) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
