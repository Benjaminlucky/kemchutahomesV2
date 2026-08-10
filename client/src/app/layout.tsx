import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import SiteChrome from "@/components/layout/SiteChrome";
import ChatWidgetGate from "@/components/chat/ChatWidgetGate";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { getBranches, getKnowledgeBase, type Branch, type KnowledgeBase } from "@/lib/api";
import "./globals.css";

// Fallback contact details if the knowledge-base fetch fails — keeps the
// widget's WhatsApp link and error-fallback message functional even during
// an API outage, rather than rendering broken/empty.
const DEFAULT_COMPANY_INFO: KnowledgeBase["companyInfo"] = {
  lagosPhone: "+234 800 000 0001",
  asabaPhone: "+234 800 000 0003",
  whatsappNumber: "+234 800 000 0001",
  email: "info@kemchutahomesltd.com",
  lagosAddress: "Lekki-Epe Expressway, Abijo, Lekki Peninsula, Lagos State",
  asabaAddress: "Asaba, Delta State",
  workingHours: "Monday–Friday 8am–6pm, Saturday 9am–4pm, Closed Sunday",
  instagramHandle: "@kemchutahomesltd",
};

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
  // Header/footer/announcement-bar visibility on /dashboard/* and
  // /client/portal/* is handled by SiteChrome (client-side pathname check —
  // see that file for why this is a safe SSR/SEO tradeoff for these three).

  // Sitewide Organization/RealEstateAgent JSON-LD (PRD FR-1) — every public
  // page should carry this, not just /contact's per-branch LocalBusiness
  // entries. Built from the same branch data so there's one source of truth;
  // a branches-API outage must never take down page rendering, so this
  // degrades to an id-only entry rather than failing the layout.
  //
  // Fetched alongside the knowledge base (for the chat widget's real
  // WhatsApp/phone numbers, replacing the placeholder values the legacy SPA
  // hardcoded) — allSettled so either source failing independently degrades
  // to a safe default instead of taking the whole layout down.
  const [branchesResult, kbResult] = await Promise.allSettled([getBranches(), getKnowledgeBase()]);
  const branches: Branch[] = branchesResult.status === "fulfilled" ? branchesResult.value : [];
  const companyInfo: KnowledgeBase["companyInfo"] =
    kbResult.status === "fulfilled" ? kbResult.value.companyInfo : DEFAULT_COMPANY_INFO;
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
        <SiteChrome>{children}</SiteChrome>
        <ChatWidgetGate
          companyInfo={{
            whatsappNumber: companyInfo.whatsappNumber,
            // Same "one source of truth" branch data used for the JSON-LD
            // above — falls back to the legacy knowledge-base field only if
            // no branch is configured, so the widget never regresses.
            lagosPhone: hq?.phones?.[0] || companyInfo.lagosPhone,
          }}
        />
      </body>
    </html>
  );
}
