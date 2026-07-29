import { describe, it, expect } from "vitest";
import { buildMetadata, SITE_NAME, SITE_URL } from "./seo";

describe("buildMetadata", () => {
  it("uses an absolute title on the homepage instead of the site-name suffix", () => {
    const meta = buildMetadata({ title: "Kemchuta Homes Limited", description: "d", path: "/" });
    expect(meta.title).toEqual({ absolute: "Kemchuta Homes Limited" });
  });

  it("suffixes non-home page titles with the site name for the layout template", () => {
    const meta = buildMetadata({ title: "Oxford Heights Awoyaya", description: "d", path: "/estate/oxford-heights" });
    expect(meta.title).toBe("Oxford Heights Awoyaya");
    expect(meta.openGraph?.title).toBe(`Oxford Heights Awoyaya | ${SITE_NAME}`);
    expect(meta.twitter?.title).toBe(`Oxford Heights Awoyaya | ${SITE_NAME}`);
  });

  it("builds a canonical URL by joining SITE_URL with the given path", () => {
    const meta = buildMetadata({ title: "Contact", description: "d", path: "/contact" });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/contact`);
    expect(meta.openGraph?.url).toBe(`${SITE_URL}/contact`);
  });

  it("omits explicit OG/Twitter images when none is supplied, so Next's opengraph-image file-convention route applies instead", () => {
    const meta = buildMetadata({ title: "Company", description: "d", path: "/company" });
    expect(meta.openGraph?.images).toBeUndefined();
    expect(meta.twitter?.images).toBeUndefined();
  });

  it("uses a per-estate OG image when supplied", () => {
    const meta = buildMetadata({
      title: "Oxford Heights",
      description: "d",
      path: "/estate/oxford-heights",
      ogImage: "https://res.cloudinary.com/demo/oxford.jpg",
    });
    expect(meta.openGraph?.images).toEqual([{ url: "https://res.cloudinary.com/demo/oxford.jpg" }]);
  });

  it("always sets a Twitter summary_large_image card so estate links preview correctly", () => {
    const meta = buildMetadata({ title: "Oxford Heights", description: "d", path: "/estate/oxford-heights" });
    // `meta.twitter` is a discriminated union and one variant (TwitterMetadata)
    // has no `card` field at all, so TS won't allow accessing `.card` without
    // narrowing first — this cast just describes the shape this function
    // actually returns.
    expect((meta.twitter as { card?: string } | undefined)?.card).toBe("summary_large_image");
  });

  it("passes the description through unchanged", () => {
    const meta = buildMetadata({ title: "Contact", description: "Reach our branches", path: "/contact" });
    expect(meta.description).toBe("Reach our branches");
    expect(meta.openGraph?.description).toBe("Reach our branches");
  });
});
