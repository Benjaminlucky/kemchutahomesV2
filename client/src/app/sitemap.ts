import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getEstates } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/company`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/buy2sell`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/developments`, changeFrequency: "daily", priority: 0.9 },
  ];

  // Generated from the estate collection, lastmod = updatedAt, per PRD FR-1.
  // If the API is unreachable at build/request time, fall back to the
  // static routes rather than failing the whole sitemap.
  let estateRoutes: MetadataRoute.Sitemap = [];
  try {
    const { estates } = await getEstates({ limit: 1000, active: "true" });
    estateRoutes = estates.map((estate) => ({
      url: `${SITE_URL}/estate/${estate.slug}`,
      lastModified: new Date(estate.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    estateRoutes = [];
  }

  return [...staticRoutes, ...estateRoutes];
}
