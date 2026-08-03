import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND } from "@/config/brand";
import { getSiteUrl } from "@/config/site";
import { getProductBySlug } from "@/services/products";
import ProductPage from "@/components/product/ProductPage";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produto" };
  }

  const description =
    product.description || `Camisa ${product.name} versão Torcedor.`;
  const canonicalUrl = `${getSiteUrl()}/produto/${product.slug}`;

  return {
    title: product.name,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | ${BRAND.name}`,
      description,
      type: "website",
      siteName: BRAND.name,
      url: canonicalUrl,
      images: product.image_url
        ? [{ url: product.image_url, alt: `Camisa ${product.name}` }]
        : [],
    },
  };
}

export default async function ProductRoute({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductPage product={product} />;
}
