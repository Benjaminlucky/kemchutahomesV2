import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // These routes don't exist in this app yet (still served by
      // client-legacy until Phase 5-6), but disallowing them now means
      // nothing has to change here at cutover.
      disallow: ["/dashboard", "/client/portal", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
