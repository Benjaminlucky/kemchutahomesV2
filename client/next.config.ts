import type { NextConfig } from "next";

// Canonical host — must match SITE_URL in src/lib/seo.ts.
const CANONICAL_HOST = "kemchutahomesltd.com";

// Every other host this app might be reachable on ahead of/around cutover:
// the Netlify default domain (PRD §3.1: "netlify.app host 301s or
// noindexes" — duplicate-content risk across two hosts) and the www
// subdomain, which the server's CORS allow-list still accepts but which
// isn't the canonical URL any page declares.
const NON_CANONICAL_HOSTS = [
  "kemchutahomes.netlify.app",
  `www.${CANONICAL_HOST}`,
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Estate/gallery images are uploaded under a single Cloudinary
        // account — narrow this once the production cloud name is final.
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        // Fallback avatar generator for realtors without an uploaded photo.
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        // Static thumbnail for the homepage's YouTube facade
        // (components/home/YoutubeIntro.tsx) — the real embed only mounts
        // on click, so this is the only YouTube-hosted asset loaded eagerly.
      },
    ],
  },
  async redirects() {
    // Next's `redirects()` only offers 307/308 (not a literal 301) via the
    // `permanent` flag, but 308 is the modern equivalent — permanent and
    // method-preserving — and search engines treat it the same as a 301 for
    // ranking/consolidation purposes. This runs before the filesystem, so it
    // applies to every route without needing per-page code.
    return NON_CANONICAL_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `https://${CANONICAL_HOST}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
