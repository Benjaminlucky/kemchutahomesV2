import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import AnnouncementBar from "@/components/announcements/AnnouncementBar";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { getBranches, type Branch } from "@/lib/api";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves relative OG/canonical URLs declared by page-level metadata.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Kemchuta Homes Limited — estate marketing, plot subscriptions, and property investment across Lagos, Asaba, Anambra, and Abuja.",
  // Search Console verification (PRD FR-6) — omitted entirely rather than
  // rendered empty until NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION is set.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // NOTE: the legacy SPA hides header/footer/announcement on /dashboard/*
  // and /client/portal/* — replicate that once those routes are ported in
  // Phase 5-6 (likely via a route group with its own layout).

  // Sitewide Organization/RealEstateAgent JSON-LD (PRD FR-1) — every public
  // page should carry this, not just /contact's per-branch LocalBusiness
  // entries. Built from the same branch data so there's one source of truth;
  // a branches-API outage must never take down page rendering, so this
  // degrades to an id-only entry rather than failing the layout.
  let branches: Branch[] = [];
  try {
    branches = await getBranches();
  } catch {
    branches = [];
  }
  const hq = branches.find((b) => b.isHQ) ?? branches[0];
  const sameAs = Array.from(
    new Set(
      branches.flatMap((b) => Object.values(b.social ?? {})).filter(Boolean),
    ),
  );

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/kemchutaMainLogo.svg`,
    ...(hq?.phones?.[0] && { telephone: hq.phones[0] }),
    ...(hq?.emails?.[0] && { email: hq.emails[0] }),
    ...(hq?.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: hq.address,
        addressCountry: "NG",
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <GoogleAnalytics />
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
