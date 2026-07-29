import type { Metadata } from "next";

export const SITE_NAME = "Kemchuta Homes Limited";
export const SITE_URL = "https://kemchutahomesltd.com";

/**
 * Merges page-specific title/description into consistent site-wide
 * defaults (OG, Twitter card, canonical) so every page opts into full
 * metadata by construction instead of by remembering to add it — the
 * PRD's FR-1 requirement is "every public page", not "the ones someone
 * remembered."
 */
export function buildMetadata({
  title,
  description,
  path,
  ogImage,
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const isHome = path === "/";
  // The root layout already declares a `%s | Site Name` title template, so
  // `title` here is left as a plain string for Next to interpolate — except
  // on "/", where `.absolute` bypasses the template so the homepage title
  // isn't "Kemchuta Homes Limited | Kemchuta Homes Limited".
  // OG/Twitter titles aren't covered by the title template, so those are
  // built out manually below.
  const fullTitle = isHome ? title : `${title} | ${SITE_NAME}`;

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      // `images` is only set here when a page explicitly supplies one. Left
      // unset, Next.js falls back to the nearest opengraph-image.tsx
      // file-convention route (the per-estate branded card, or the sitewide
      // fallback) — which is a real raster PNG, unlike the old SVG default
      // this used to hardcode here. Setting `images` unconditionally used to
      // silently override that file-convention image on every page, which is
      // why WhatsApp (and every other scraper) never rendered a thumbnail.
      ...(ogImage && { images: [{ url: ogImage }] }),
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}
