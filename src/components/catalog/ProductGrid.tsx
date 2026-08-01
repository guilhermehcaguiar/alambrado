import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: Product[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
