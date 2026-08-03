import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";
import { getProducts } from "@/services/products";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const base: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/catalogo/torcedor`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/sobre`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/contato`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const products = await getProducts();
  const productEntries: MetadataRoute.Sitemap = products
    .filter((product) => product.available)
    .map((product) => ({
      url: `${siteUrl}/produto/${product.slug}`,
      changeFrequency: "daily",
      priority: 0.7,
      lastModified: product.created_at,
    }));

  return [...base, ...productEntries];
}
