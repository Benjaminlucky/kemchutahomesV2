import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import LegalDocument, {
  ContactBlock,
  getLegalContact,
  SUPPORT_EMAIL,
  type LegalSection,
} from "@/components/legal/LegalDocument";

// This page's URL is what goes into Google Play Console's "Delete account
// URL" field — Play requires it to name the app/developer, explain how to
// request deletion, and say what is deleted vs. kept and for how long.
export const metadata = buildMetadata({
  title: "Delete Your Account",
  description:
    "How to delete your Kemchuta Homes app or website account, what data is deleted, and what records we keep and for how long.",
  path: "/delete-account",
});

// Bump when the process or retention periods change.
const EFFECTIVE_DATE = "29 September 2026";

const link = "text-customPurple-600 underline";

const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Account deletion request")}`;

export default async function DeleteAccountPage() {
  const contact = await getLegalContact();

  const sections: LegalSection[] = [
    {
      id: "how-to-request",
      title: "How to delete your account",
      body: (
        <>
          <p>You can ask us to delete your client or realtor account in either of these ways:</p>
          <ul>
            <li>
              <strong>In the Kemchuta Homes app:</strong> sign in, open your
              profile, choose <strong>Delete account</strong>, and confirm.
            </li>
            <li>
              <strong>By email:</strong> send an email to{" "}
              <a href={MAILTO} className={link}>{SUPPORT_EMAIL}</a> with the
              subject &ldquo;Account deletion request&rdquo;, from the email
              address registered to your account. Include your full name, the
              phone number on your account, and whether it is a client or
              realtor account.
            </li>
          </ul>
          <p>
            You don&rsquo;t need the app installed to delete your account by
            email. Uninstalling the app on its own does <strong>not</strong>{" "}
            delete your account.
          </p>
        </>
      ),
    },
    {
      id: "what-happens",
      title: "What happens next",
      body: (
        <ul>
          <li>
            To protect you, we may contact you to confirm the request came
            from you before we delete anything.
          </li>
          <li>
            We complete deletion within 30 days of confirming your request and
            email you when it is done.
          </li>
          <li>
            You are signed out on all devices, and you will no longer be able
            to sign in to the app, the client portal or the realtor dashboard.
          </li>
          <li>Deletion is permanent and cannot be undone.</li>
        </ul>
      ),
    },
    {
      id: "what-we-delete",
      title: "Data we delete",
      body: (
        <ul>
          <li>Your account profile: name, email, phone number, date of birth and profile photo</li>
          <li>Your password and sign-in sessions, including sign-in tokens on your devices</li>
          <li>Identity (KYC) documents you uploaded</li>
          <li>Push notification tokens for your devices</li>
          <li>For realtors: bank account details and referral code</li>
          <li>Enquiries and inspection bookings that did not lead to a subscription or investment</li>
        </ul>
      ),
    },
    {
      id: "what-we-keep",
      title: "Data we keep, and for how long",
      body: (
        <>
          <p>
            Nigerian company, tax and land law requires us to keep some
            records even after you delete your account. We keep only what we
            need, restrict access to it, and use it only for these purposes:
          </p>
          <ul>
            <li>
              <strong>Subscription, payment and receipt records</strong>{" "}
              (including the name, contact details, next of kin and payment
              history on each subscription) &mdash; kept for six years after
              the transaction is completed or ends, to meet accounting and tax
              record-keeping requirements.
            </li>
            <li>
              <strong>Plot allocation and title records</strong> &mdash; kept
              for as long as the plot is registered to you, and for six years
              afterwards, because they prove ownership of land.
            </li>
            <li>
              <strong>Buy2Sell investment records</strong> (contracts, identity
              type and number, payments and payouts) &mdash; kept for six years
              after the investment is paid out or ends.
            </li>
            <li>
              <strong>Realtor commission and payout records</strong> &mdash;
              kept for six years after the commission is paid or reversed.
            </li>
            <li>
              <strong>Records needed for a legal claim or dispute</strong>{" "}
              &mdash; kept until the claim or dispute is finally resolved.
            </li>
          </ul>
          <p>
            When these periods end, we delete the records or anonymise them so
            they no longer identify you.
          </p>
        </>
      ),
    },
    {
      id: "active-contracts",
      title: "If you have an active subscription, investment or commission",
      body: (
        <ul>
          <li>
            Deleting your account does not cancel an active plot subscription,
            instalment plan or Buy2Sell investment. Those continue under their
            signed documents, and we keep the details needed to complete them,
            issue your title documents and pay any amount due to you. To cancel
            a subscription, see the refund terms in our{" "}
            <Link href="/terms#refunds" className={link}>Terms of Use</Link>.
          </li>
          <li>
            Realtors: approved commissions due to you are paid to your
            registered bank account before we delete your bank details.
          </li>
        </ul>
      ),
    },
    {
      id: "partial-deletion",
      title: "Deleting some data without closing your account",
      body: (
        <p>
          You can also ask us to delete specific data &mdash; for example your
          profile photo or an identity document you uploaded &mdash; without
          deleting your whole account. Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={link}>{SUPPORT_EMAIL}</a>{" "}
          and tell us what you want deleted. The same legal record-keeping
          limits apply.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact us",
      body: <ContactBlock contact={contact} />,
    },
  ];

  return (
    <LegalDocument
      title="Delete Your Account"
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <p>
          This page explains how to delete your account for the{" "}
          <strong>Kemchuta Homes</strong> mobile app and website, provided by{" "}
          <strong>Kemchuta Homes Limited</strong>, what data we delete, and
          what we must keep. For more on how we handle your data, see our
          Privacy Policy.
        </p>
      }
      sections={sections}
      related={{ name: "Privacy Policy", href: "/privacy#delete-account" }}
    />
  );
}
