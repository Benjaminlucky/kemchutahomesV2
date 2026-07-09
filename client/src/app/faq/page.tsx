import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getKnowledgeBase } from "@/lib/api";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about subscriptions, Buy2Sell, inspections, documents, and payments at Kemchuta Homes Limited.",
  path: "/faq",
});

export default async function FaqPage() {
  const { faqs } = await getKnowledgeBase();
  const activeFaqs = faqs.filter((f) => f.active !== false);
  const categories = Array.from(new Set(activeFaqs.map((f) => f.category)));

  // FAQPage JSON-LD (PRD FR-1) built from the same admin-managed FAQs
  // rendered on the page below, not a separately maintained copy.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: activeFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      {activeFaqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <div className="mx-auto w-10/12 max-w-3xl py-16">
        <h1 className="mb-2 text-3xl font-bold text-customBlack-900">
          Frequently Asked Questions
        </h1>
        <p className="mb-10 text-gray-600">
          Can&rsquo;t find what you&rsquo;re looking for?{" "}
          <Link href="/contact" className="text-customPurple-600 underline">
            Contact us
          </Link>{" "}
          directly.
        </p>

        {activeFaqs.length === 0 && (
          <p className="text-gray-500">
            No FAQs published yet — check back soon.
          </p>
        )}

        {categories.map((category) => (
          <section key={category} className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-customPurple-700">
              {category}
            </h2>
            <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
              {activeFaqs
                .filter((f) => f.category === category)
                .map((f) => (
                  <details key={f._id} className="group p-4">
                    <summary className="cursor-pointer list-none font-medium text-customBlack-900 marker:content-none">
                      {f.question}
                    </summary>
                    <p className="mt-2 text-gray-600">{f.answer}</p>
                  </details>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
