import { buildMetadata, SITE_URL } from "@/lib/seo";
import { getBranches } from "@/lib/api";
import Contact from "@/components/contact/Contact";

export const metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Kemchuta Homes Limited — visit our Lagos or Asaba office, call, email, or send us a message. We respond within 24 hours.",
  path: "/contact",
});

export default async function ContactPage() {
  const branches = await getBranches();

  // LocalBusiness JSON-LD per branch (PRD FR-1) — built from the same
  // live branch data rendered on the page, not separately maintained copy.
  const jsonLd = branches.map((b) => ({
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: `Kemchuta Homes Limited — ${b.label}`,
    image: `${SITE_URL}/assets/kemchutaMainLogo.svg`,
    url: `${SITE_URL}/contact`,
    telephone: b.phones?.[0],
    email: b.emails?.[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address,
      addressCountry: "NG",
    },
    openingHours: [b.hours?.weekdays, b.hours?.saturday].filter(Boolean),
  }));

  return (
    <>
      {jsonLd.map((entry) => (
        <script
          key={entry.name}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
      <Contact branches={branches} />
    </>
  );
}
