import Link from "next/link";
import type { ReactNode } from "react";
import { getBranches } from "@/lib/api";

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

export type LegalContact = {
  email: string;
  phone: string;
  address: string;
};

// The single support address for the legal pages, the account-deletion page
// and the app-store listings (app.json's support email). Deliberately NOT
// taken from the branch record: Google Play checks that the policy, the
// deletion page and the store listing all show the same address, so it
// must not change just because a branch email is edited in the dashboard.
export const SUPPORT_EMAIL = "support@kemchutahomesltd.com";

// Mirrors the live HQ branch record — only used if the branches API is
// unreachable, so a legal page never renders without a way to reach us.
const FALLBACK_CONTACT: LegalContact = {
  email: SUPPORT_EMAIL,
  phone: "08160699199",
  address:
    "NO 36B Ibrahim Babatunde Street, Olive Park Estate, by BisBus Petrol Station Oko-Ado, Sangotedo Lagos.",
};

/**
 * Phone and address for the legal pages come from the same admin-managed
 * branch data as /contact, so a change in the dashboard doesn't leave the
 * policies pointing at stale details; the email is always SUPPORT_EMAIL.
 * A branches-API outage degrades to the fallback rather than failing the page.
 */
export async function getLegalContact(): Promise<LegalContact> {
  try {
    const branches = await getBranches();
    const hq = branches.find((b) => b.isHQ) ?? branches[0];
    if (!hq) return FALLBACK_CONTACT;
    return {
      email: SUPPORT_EMAIL,
      phone: hq.phones?.[0] || FALLBACK_CONTACT.phone,
      address: hq.address || FALLBACK_CONTACT.address,
    };
  } catch {
    return FALLBACK_CONTACT;
  }
}

export function ContactBlock({ contact }: { contact: LegalContact }) {
  return (
    <address className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 not-italic">
      <strong className="text-customBlack-900">Kemchuta Homes Limited</strong>
      <br />
      {contact.address}
      <br />
      Email:{" "}
      <a href={`mailto:${contact.email}`} className="text-customPurple-600 underline">
        {contact.email}
      </a>
      <br />
      Phone:{" "}
      <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="text-customPurple-600 underline">
        {contact.phone}
      </a>
    </address>
  );
}

export default function LegalDocument({
  title,
  effectiveDate,
  intro,
  sections,
  related,
}: {
  title: string;
  effectiveDate: string;
  intro: ReactNode;
  sections: LegalSection[];
  related: { name: string; href: string };
}) {
  return (
    <div className="mx-auto w-10/12 max-w-3xl py-16">
      <h1 className="mb-2 text-3xl font-bold text-customBlack-900">{title}</h1>
      <p className="mb-8 text-sm text-gray-500">Effective date: {effectiveDate}</p>

      <div className="[&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 mb-10 space-y-4 text-gray-700">{intro}</div>

      <nav
        aria-label="Contents"
        className="mb-12 rounded-lg border border-gray-200 p-5"
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-customPurple-700">
          Contents
        </h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="hover:text-customPurple-600 hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((s, i) => (
        <section key={s.id} id={s.id} className="mb-10 scroll-mt-28">
          <h2 className="mb-4 text-xl font-semibold text-customPurple-700">
            {i + 1}. {s.title}
          </h2>
          <div className="[&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 space-y-4 leading-relaxed text-gray-700">
            {s.body}
          </div>
        </section>
      ))}

      <p className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500">
        See also our{" "}
        <Link href={related.href} className="text-customPurple-600 underline">
          {related.name}
        </Link>
        .
      </p>
    </div>
  );
}
