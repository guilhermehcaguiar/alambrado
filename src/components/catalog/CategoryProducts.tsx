import type { ProductCategory } from "@/types/product";
import { getProductsByCategory } from "@/services/products";
import ProductGrid from "./ProductGrid";
import CatalogEmptyState from "./CatalogEmptyState";

type CategoryProductsProps = {
  category: ProductCategory;
};

export default async function CategoryProducts({ category }: CategoryProductsProps) {
  const products = await getProductsByCategory(category);

  if (products.length === 0) {
    return (
      <CatalogEmptyState
        title="Disponível em breve"
        message="Estamos preparando novos mantos para esta categoria."
      />
    );
  }

  return <ProductGrid products={products} />;
}
