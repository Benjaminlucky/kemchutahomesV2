import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import LegalDocument, {
  ContactBlock,
  getLegalContact,
  type LegalSection,
} from "@/components/legal/LegalDocument";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description:
    "The terms that govern your use of the Kemchuta Homes website, plot subscriptions, inspections, the Buy2Sell scheme, and the realtor programme.",
  path: "/terms",
});

// Bump when the terms change materially (see "Changes to these terms").
const EFFECTIVE_DATE = "29 September 2026";

const link = "text-customPurple-600 underline";

export default async function TermsPage() {
  const contact = await getLegalContact();

  // NOTE: the "Plot subscriptions" and "Cancellations and refunds" sections
  // must stay consistent with the clauses a subscriber explicitly accepts in
  // components/subscription/SubscribeModal.tsx (TermsModal) — update both
  // together.
  const sections: LegalSection[] = [
    {
      id: "about",
      title: "About these terms",
      body: (
        <>
          <p>
            These Terms of Use (&ldquo;Terms&rdquo;) govern your use of
            kemchutahomesltd.com and its subdomains (the &ldquo;Website&rdquo;),
            the client portal, the realtor dashboard, and the services we offer
            through them. The Website is operated by Kemchuta Homes Limited
            (&ldquo;Kemchuta Homes&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;
            or &ldquo;our&rdquo;), a company incorporated in Nigeria.
          </p>
          <p>
            By using the Website, creating an account, booking an inspection,
            subscribing to a plot, or investing through Buy2Sell, you agree to
            these Terms. If you do not agree, please do not use the Website.
          </p>
          <p>
            A specific transaction may also be governed by written documents
            you sign with us &mdash; for example a subscription form, contract
            of sale, allocation letter, deed of assignment, or Buy2Sell
            investment contract and deed of buyback (together,
            &ldquo;Transaction Documents&rdquo;). If a Transaction Document
            conflicts with these Terms, the Transaction Document prevails for
            that transaction.
          </p>
          <p>
            Our{" "}
            <Link href="/privacy" className={link}>Privacy Policy</Link>{" "}
            explains how we handle your personal data and forms part of these
            Terms.
          </p>
        </>
      ),
    },
    {
      id: "eligibility",
      title: "Eligibility",
      body: (
        <p>
          You must be at least 18 years old and legally able to enter into
          binding contracts to create an account, subscribe to a plot, invest
          through Buy2Sell, or register as a realtor. If you act on behalf of
          a company or another person, you confirm that you are authorised to
          bind them to these Terms.
        </p>
      ),
    },
    {
      id: "accounts",
      title: "Your account",
      body: (
        <ul>
          <li>
            You must give accurate, complete and current information and keep
            it up to date.
          </li>
          <li>
            Keep your password confidential. You are responsible for activity
            on your account; tell us immediately if you suspect unauthorised
            access.
          </li>
          <li>
            We may temporarily lock an account after repeated failed sign-in
            attempts, and we may suspend or close an account that breaches
            these Terms or is used fraudulently.
          </li>
        </ul>
      ),
    },
    {
      id: "property-information",
      title: "Property information",
      body: (
        <>
          <p>
            We work hard to keep estate information on the Website accurate,
            but it is provided for general information and does not by itself
            form an offer or contract:
          </p>
          <ul>
            <li>
              Prices, plot sizes, payment plans, promotions and availability
              can change at any time until your subscription is confirmed by us
              in writing.
            </li>
            <li>
              Photographs, videos, layouts, site plans and artist&rsquo;s
              impressions are illustrative. Infrastructure and amenities shown
              for an estate may be planned or in progress rather than complete.
            </li>
            <li>
              Details of the title for each estate are provided in good faith.
              We encourage you to inspect the estate and to carry out your own
              due diligence, including with a lawyer or surveyor of your
              choice, before you commit.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "inspections",
      title: "Site inspections",
      body: (
        <p>
          You can book a site inspection through the Website or by
          contacting us. Please book at least 24 hours in advance so we can
          coordinate. Inspection dates are subject to confirmation and may be
          rescheduled because of weather, safety or operational reasons. You
          attend inspections at your own risk; please follow the directions
          of our staff on site.
        </p>
      ),
    },
    {
      id: "subscriptions",
      title: "Plot subscriptions",
      body: (
        <>
          <p>
            When you subscribe to a plot you enter a binding agreement with
            Kemchuta Homes on the following terms, together with any
            Transaction Documents for that plot:
          </p>
          <ul>
            <li>
              <strong>Payment.</strong> You must pay as agreed under your
              chosen payment plan. For outright purchase, full payment is due
              within 7 working days of subscription. For instalment plans,
              payments must be made according to the agreed schedule. Failure
              to pay on time may result in forfeiture of the plot without
              refund.
            </li>
            <li>
              <strong>Allocation and title.</strong> Physical allocation of a
              plot is subject to full payment and completion of all
              documentation. Title documents are processed and issued after
              full payment is confirmed. The type of title issued will be as
              agreed at subscription.
            </li>
            <li>
              <strong>Corner pieces.</strong> Corner-piece plots attract an
              additional 10% premium on the standard plot price.
            </li>
            <li>
              <strong>Transfers.</strong> You may not transfer a plot to a
              third party without our prior written consent. A transfer fee of
              2% of the current market value applies to every approved
              transfer.
            </li>
            <li>
              <strong>Development.</strong> You must develop your plot within
              the estate&rsquo;s development timeline. We may repurchase an
              undeveloped plot at the original subscription price once the
              development period has lapsed.
            </li>
            <li>
              <strong>Other charges.</strong> Survey, documentation,
              development and other fees for an estate are payable as stated in
              the Transaction Documents for that estate.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "payments",
      title: "Payments",
      body: (
        <>
          <p>
            Make payments only into official Kemchuta Homes Limited bank
            accounts &mdash; those shown in your subscription details, your
            client portal, or written communication from us. Always use the
            payment reference we give you and keep your proof of payment.
          </p>
          <p>
            <strong>
              Never pay money into the personal account of a realtor, staff
              member or any other individual.
            </strong>{" "}
            We are not responsible for payments made to any account other than
            our official company accounts. If you are unsure whether an
            account is genuine, contact us before paying.
          </p>
          <p>
            A payment counts towards your plot or investment only once we have
            confirmed receipt. We will issue a receipt for every confirmed
            payment.
          </p>
        </>
      ),
    },
    {
      id: "refunds",
      title: "Cancellations and refunds",
      body: (
        <ul>
          <li>
            If you cancel a subscription within 48 hours of subscribing, a 5%
            administrative fee is deducted from any refund.
          </li>
          <li>
            If you cancel more than 48 hours after subscribing, a 15%
            administrative fee is deducted from any refund.
          </li>
          <li>
            No refund is made for a plot that has already been allocated,
            unless the refund is due to our fault.
          </li>
          <li>
            Refund requests must be made in writing using the contact details
            below. Approved refunds are paid to the account from which the
            payment was made, within a reasonable time after approval.
          </li>
          <li>
            Buy2Sell investments are governed by their own investment
            contracts, including any terms on early exit &mdash; see{" "}
            <a href="#buy2sell" className={link}>Buy2Sell investments</a>.
          </li>
        </ul>
      ),
    },
    {
      id: "buy2sell",
      title: "Buy2Sell investments",
      body: (
        <>
          <p>
            Under our Buy2Sell scheme, you buy a property interest from us and
            we agree to buy it back at a higher price at the end of an agreed
            term.
          </p>
          <ul>
            <li>
              Return rates, terms and minimum or maximum investment amounts
              shown on the Website are for information and may change. The
              rate, principal, maturity date and payout that apply to you are
              fixed only in your signed Buy2Sell Transaction Documents.
            </li>
            <li>
              Your investment and payout are governed by those Transaction
              Documents, including the contract of investment and deed of
              buyback. An investment becomes active only once your payment is
              confirmed and the documents are issued.
            </li>
            <li>
              Information on the Website is not financial, legal or tax
              advice. Consider getting independent advice before investing.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "realtors",
      title: "Realtors",
      body: (
        <>
          <p>If you register as a Kemchuta Homes realtor:</p>
          <ul>
            <li>
              You act as an independent marketer, not as our employee, agent
              or partner. You may not make promises, sign documents, or accept
              money on our behalf.
            </li>
            <li>
              You must describe our estates, prices, titles and Buy2Sell terms
              accurately, using only the information we publish, and must
              direct every client payment to our official company accounts.
            </li>
            <li>
              Commissions, including any on sales made by realtors you
              recruit, are earned under the commission structure we publish
              from time to time. Commission is calculated only on payments we
              have confirmed and is paid to the bank account registered on
              your profile.
            </li>
            <li>
              Commission is not final until the clawback period in the
              commission structure has passed. If the underlying subscription
              is rejected, cancelled or refunded within that period, the
              related commission is reversed and, if already paid, may be
              recovered from future commissions.
            </li>
            <li>
              We may suspend or terminate a realtor account, and withhold
              commission connected with the misconduct, for
              misrepresentation, collecting client funds, fraud or other
              serious breach of these Terms.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "ai-assistant",
      title: "AI chat assistant",
      body: (
        <p>
          The chat assistant on the Website is an automated tool that provides
          general information. It can make mistakes. Its answers are not
          advice, and they do not create, change or form part of any agreement
          with us. Please confirm prices, availability and terms with our
          staff before relying on them. Do not share passwords, identity
          numbers or bank details in the chat.
        </p>
      ),
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      body: (
        <>
          <p>When using the Website you must not:</p>
          <ul>
            <li>give false information or impersonate any person or business;</li>
            <li>use the Website for fraud or any unlawful purpose;</li>
            <li>
              attempt to gain unauthorised access to the Website, other
              accounts, or our systems, or interfere with their security or
              operation;
            </li>
            <li>
              scrape, copy or harvest content or personal data from the
              Website by automated means without our written permission; or
            </li>
            <li>upload viruses or other harmful code.</li>
          </ul>
        </>
      ),
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      body: (
        <p>
          The Website and its content &mdash; including text, photographs,
          videos, estate layouts, logos and the Kemchuta Homes name &mdash;
          belong to us or our licensors. You may view and print pages for your
          own personal, non-commercial use. You may not reproduce, modify or
          distribute our content without our written permission, except that
          registered realtors may use marketing material we provide for the
          purpose of marketing our estates.
        </p>
      ),
    },
    {
      id: "third-party-links",
      title: "Third-party links and services",
      body: (
        <p>
          The Website links to third-party services such as Google Maps,
          WhatsApp, YouTube and social media platforms. We do not control
          them and are not responsible for their content, availability or
          practices.
        </p>
      ),
    },
    {
      id: "availability",
      title: "Website availability",
      body: (
        <p>
          We aim to keep the Website available and accurate, but we do not
          guarantee that it will be uninterrupted, error-free or free of
          viruses. We may change, suspend or withdraw any part of the Website
          for maintenance or other reasons.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Limitation of liability",
      body: (
        <>
          <p>To the extent permitted by law:</p>
          <ul>
            <li>
              the Website and its content are provided &ldquo;as is&rdquo;
              without warranties of any kind, other than those set out in your
              Transaction Documents;
            </li>
            <li>
              we are not liable for indirect or consequential loss, or for loss
              of profit, business or opportunity, arising from your use of the
              Website; and
            </li>
            <li>
              we are not liable for loss caused by payments made to accounts
              other than our official company accounts, or by your reliance on
              information that our staff did not confirm in writing.
            </li>
          </ul>
          <p>
            Nothing in these Terms limits our liability for fraud, for death or
            personal injury caused by our negligence, or for anything else that
            cannot be limited under Nigerian law, and nothing in these Terms
            affects your rights under the Federal Competition and Consumer
            Protection Act 2018.
          </p>
        </>
      ),
    },
    {
      id: "indemnity",
      title: "Indemnity",
      body: (
        <p>
          You agree to compensate us for any loss, claim or expense (including
          reasonable legal fees) that arises from your breach of these Terms,
          your misuse of the Website, or false information you give us.
        </p>
      ),
    },
    {
      id: "disputes",
      title: "Governing law and disputes",
      body: (
        <p>
          These Terms are governed by the laws of the Federal Republic of
          Nigeria. If a dispute arises, please contact us first so we can try
          to resolve it informally. Any dispute that is not resolved informally
          will first be referred to mediation. If mediation fails, the dispute
          will be referred to arbitration in Lagos, Nigeria, under the
          Arbitration and Mediation Act 2023. This does not prevent either
          party from seeking urgent interim relief from a court of competent
          jurisdiction.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to these terms",
      body: (
        <p>
          We may update these Terms from time to time. The effective date at
          the top shows when they last changed. Changes do not affect
          Transaction Documents you have already signed. If you keep using the
          Website after a change takes effect, you accept the updated Terms.
        </p>
      ),
    },
    {
      id: "general",
      title: "General",
      body: (
        <p>
          If any part of these Terms is found to be unenforceable, the rest
          remains in effect. If we do not enforce a right straight away, we
          have not waived it. You may not transfer your rights under these
          Terms without our written consent.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact us",
      body: (
        <>
          <p>For questions about these Terms, or to request a refund, contact:</p>
          <ContactBlock contact={contact} />
        </>
      ),
    },
  ];

  return (
    <LegalDocument
      title="Terms of Use"
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <p>
          Please read these Terms carefully. They explain the rules for using
          our Website and the terms that apply when you book an inspection,
          subscribe to a plot, invest through Buy2Sell, or work with us as a
          realtor.
        </p>
      }
      sections={sections}
      related={{ name: "Privacy Policy", href: "/privacy" }}
    />
  );
}
