import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/products";
import ProductPage from "@/components/product/ProductPage";

type Props = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Produto",
};

export default async function ProductRoute({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductPage product={product} />;
}
