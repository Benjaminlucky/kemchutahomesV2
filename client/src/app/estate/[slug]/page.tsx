import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getEstateBySlug, getEstateRedirect, getEstates } from "@/lib/api";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import EstateDetails from "@/components/estate/EstateDetails";

// Pre-render known estate slugs at build time; anything not covered here
// (new estates added after build, or if the API is unreachable at build
// time) still renders on-demand via ISR — dynamicParams defaults to true.
export async function generateStaticParams() {
  try {
    const { estates } = await getEstates({ limit: 500, active: "true" });
    return estates.map((estate) => ({ slug: estate.slug }));
  } catch {
    return [];
  }
}

const parsePriceToNumber = (price: string) => Number(String(price).replace(/[₦,\s]/g, "")) || 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const estate = await getEstateBySlug(slug);

  if (!estate) {
    return buildMetadata({
      title: "Estate Not Found",
      description: "This estate listing could not be found.",
      path: `/estate/${slug}`,
    });
  }

  const description = `${estate.estate} — ${estate.sqm} ${estate.title} plot for ${estate.purpose.toLowerCase()} in ${estate.location}. Starting from ₦${estate.price}. ${estate.desc.slice(0, 120)}`;

  return buildMetadata({
    title: estate.estate,
    description,
    path: `/estate/${estate.slug}`,
    ogImage: estate.img,
  });
}

export default async function EstatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const estate = await getEstateBySlug(slug);

  // PRD FR-1: renamed estates 301 (via permanentRedirect) to their current
  // slug, deactivated/hard-deleted estates redirect to /developments, and a
  // slug with no history at all still gets a real 404.
  if (!estate) {
    const redirect = await getEstateRedirect(slug);
    if (redirect) permanentRedirect(redirect.target);
    notFound();
  }
  if (!estate.isActive) {
    permanentRedirect("/developments");
  }

  const canonicalUrl = `${SITE_URL}/estate/${estate.slug}`;
  const galleryImages = [estate.img, ...estate.gallery.map((g) => g.url)];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: estate.estate,
    description: estate.desc,
    image: galleryImages,
    category: estate.category || estate.purpose,
    offers: {
      "@type": "Offer",
      price: parsePriceToNumber(estate.price),
      priceCurrency: "NGN",
      availability: estate.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: canonicalUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Developments", item: `${SITE_URL}/developments` },
      { "@type": "ListItem", position: 3, name: estate.estate, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <EstateDetails estate={estate} />
    </>
  );
}
