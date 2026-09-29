import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import LegalDocument, {
  ContactBlock,
  getLegalContact,
  type LegalSection,
} from "@/components/legal/LegalDocument";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How Kemchuta Homes Limited collects, uses, shares, and protects your personal data on our website and mobile app under the Nigeria Data Protection Act 2023.",
  path: "/privacy",
});

// Bump when the policy text changes materially (see "Changes to this policy").
const EFFECTIVE_DATE = "29 September 2026";

export default async function PrivacyPage() {
  const contact = await getLegalContact();

  const sections: LegalSection[] = [
    {
      id: "who-we-are",
      title: "Who we are",
      body: (
        <>
          <p>
            Kemchuta Homes Limited (&ldquo;Kemchuta Homes&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;) is a real
            estate company incorporated in Nigeria. We market estates and
            plots, process plot subscriptions, arrange site inspections, run
            the Buy2Sell property investment scheme, and operate a network of
            independent realtors.
          </p>
          <p>
            For the purposes of the Nigeria Data Protection Act 2023
            (&ldquo;NDPA&rdquo;) and the regulations and directives issued
            under it, Kemchuta Homes is the <strong>data controller</strong>{" "}
            of the personal data described in this policy. Our contact
            details are in the <a href="#contact" className="text-customPurple-600 underline">Contact us</a> section.
          </p>
        </>
      ),
    },
    {
      id: "scope",
      title: "What this policy covers",
      body: (
        <p>
          This policy applies to personal data we process through
          kemchutahomesltd.com and its subdomains (the &ldquo;Website&rdquo;),
          the Kemchuta Homes mobile app (the &ldquo;App&rdquo;), the client
          portal, the realtor and staff dashboards, and our AI chat assistant
          (together, our &ldquo;Services&rdquo;), and to the offline dealings
          connected to them &mdash; for
          example when you visit one of our offices, call us, or inspect an
          estate. It covers visitors, prospective and existing clients,
          subscribers, Buy2Sell investors, realtors, and the next of kin or
          spouses whose details are given to us.
        </p>
      ),
    },
    {
      id: "data-we-collect",
      title: "Personal data we collect",
      body: (
        <>
          <p>Depending on how you deal with us, we collect:</p>
          <ul>
            <li>
              <strong>Contact and enquiry details</strong> &mdash; your name,
              email address, phone number, preferred branch, and the subject
              and content of messages you send through our contact form,
              email, phone, or WhatsApp.
            </li>
            <li>
              <strong>Inspection bookings</strong> &mdash; your name, email,
              phone number, the estate and date you choose, the number of
              people attending, and any notes you add.
            </li>
            <li>
              <strong>Account details</strong> &mdash; for client and realtor
              accounts: name, email, phone number, profile photo (optional
              &mdash; in the App you can take one with your camera or choose
              one from your photos), and a password, which we store only as a one-way hash and never
              in readable form. We also keep security records such as failed
              sign-in attempts and password-reset requests.
            </li>
            <li>
              <strong>Plot subscription details</strong> &mdash; title, full
              name, gender, date of birth, marital status, spouse&rsquo;s
              name, nationality, country of residence, residential address,
              city, state and local government area, employer, email and phone
              number; next-of-kin name, address and phone number; the estate,
              plot size, plot type, number of plots and payment plan you
              choose; and the realtor who referred you, if any.
            </li>
            <li>
              <strong>Buy2Sell investment details</strong> &mdash; full name,
              gender, date of birth, nationality, address, email, phone
              number, the type and number of an identity document you provide
              (for example NIN, BVN, international passport, driver&rsquo;s
              licence or voter&rsquo;s card), and your investment amount and
              duration.
            </li>
            <li>
              <strong>Identity (KYC) documents</strong> &mdash; photos or
              scans of identity documents you choose to upload, for example
              through the App&rsquo;s camera or photo picker, so we can verify
              your identity for a subscription, investment or realtor
              account.
            </li>
            <li>
              <strong>Payment and transaction records</strong> &mdash;
              amounts paid, payment dates, payment references, instalment
              schedules, receipts, and the documents we generate for you
              (such as allocation letters, agreements and certificates). We do
              not collect or store your card details through our Services.
            </li>
            <li>
              <strong>Realtor details</strong> &mdash; in addition to account
              details: date of birth, state, referral code, who recruited you,
              your bank name, account name and account number (to pay
              commissions), and your sales and commission history.
            </li>
            <li>
              <strong>AI chat assistant messages</strong> &mdash; the
              questions you type into the chat assistant on the Website or in the
              App.
            </li>
            <li>
              <strong>Technical data</strong> &mdash; your IP address, browser
              and device type, pages visited, and error diagnostics collected
              automatically when you use our Services; and, in the App, your
              device model, operating system and app version, and a push
              notification token that identifies your device to our
              notification service (see{" "}
              <a href="#mobile-app" className="text-customPurple-600 underline">Our mobile app</a> and{" "}
              <a href="#cookies" className="text-customPurple-600 underline">Cookies and device storage</a>).
            </li>
          </ul>
          <p>
            If you give us personal data about someone else &mdash; such as
            your next of kin, spouse, or a person attending an inspection with
            you &mdash; please make sure they know you are sharing it and have
            seen this policy.
          </p>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "How we use your data and our lawful bases",
      body: (
        <>
          <p>
            We only process personal data where the NDPA gives us a lawful
            basis to do so:
          </p>
          <ul>
            <li>
              <strong>To perform a contract with you, or take steps at your
              request before entering one</strong> &mdash; processing plot
              subscriptions and Buy2Sell investments, recording payments,
              allocating plots, issuing receipts and title documentation,
              scheduling inspections, running your client or realtor account,
              and paying realtor commissions.
            </li>
            <li>
              <strong>To comply with legal obligations</strong> &mdash;
              keeping accounting and tax records, verifying identity where the
              law requires it, meeting land-registration requirements, and
              responding to lawful requests from courts, regulators and law
              enforcement.
            </li>
            <li>
              <strong>For our legitimate interests</strong>, where these are
              not overridden by your rights &mdash; answering enquiries,
              sending payment reminders and service updates, preventing fraud
              and securing our systems, improving our Services, and
              establishing or defending legal claims.
            </li>
            <li>
              <strong>With your consent</strong> &mdash; for optional
              analytics and marketing messages about new estates and offers.
              You can withdraw consent at any time without affecting processing
              that took place before you withdrew it.
            </li>
          </ul>
          <p>
            We send service messages by email and SMS &mdash; for example
            confirmations, payment reminders, receipts and account
            notifications. We only send marketing messages where the law
            allows, and every marketing message tells you how to opt out.
          </p>
        </>
      ),
    },
    {
      id: "ai-chat",
      title: "Our AI chat assistant",
      body: (
        <>
          <p>
            The chat assistant on the Website and in the App answers
            questions using information about our estates, prices and FAQs.
            The messages you type are sent to our AI service provider to
            generate a reply. We do not save chat transcripts to our database;
            the conversation is kept only on your device &mdash; on the
            Website, in your browser until you close the tab.
          </p>
          <p>
            Please do not enter passwords, identity numbers, bank details or
            other sensitive information into the chat. The assistant can make
            mistakes, and nothing it says forms part of any agreement with us
            &mdash; see our{" "}
            <Link href="/terms#ai-assistant" className="text-customPurple-600 underline">Terms of Use</Link>.
          </p>
        </>
      ),
    },
    {
      id: "mobile-app",
      title: "Our mobile app",
      body: (
        <>
          <p>
            The App asks for device permissions only when a feature needs
            them, and you can refuse or later withdraw any permission in your
            phone&rsquo;s settings. Refusing a permission only switches off
            the feature that needs it.
          </p>
          <ul>
            <li>
              <strong>Camera and photos</strong> &mdash; used only when you
              choose to take or pick a profile photo or an identity document to
              upload. The App does not access your camera or photo library in
              the background, and only the images you select are uploaded.
            </li>
            <li>
              <strong>Fingerprint or face unlock</strong> &mdash; if you turn
              on biometric sign-in, your phone&rsquo;s operating system checks
              your fingerprint or face and only tells the App whether the
              check passed. Your biometric data stays on your phone; we never
              receive or store it.
            </li>
            <li>
              <strong>Push notifications</strong> &mdash; if you allow
              notifications, your device receives a push token, which we store
              with your account so we can send you payment reminders,
              subscription and investment updates, and account alerts. You can
              turn notifications off at any time in your phone&rsquo;s
              settings.
            </li>
            <li>
              <strong>Device and diagnostic data</strong> &mdash; device model,
              operating system and app version, and crash and error reports,
              which we use to keep the App working and secure.
            </li>
            <li>
              <strong>Sign-in tokens</strong> &mdash; saved on your device to
              keep you signed in, as described in{" "}
              <a href="#cookies" className="text-customPurple-600 underline">Cookies and device storage</a>.
            </li>
          </ul>
          <p>
            The App does not collect your precise location or your contacts,
            and we do not sell your data or use it for third-party
            advertising.
          </p>
        </>
      ),
    },
    {
      id: "sharing",
      title: "Who we share your data with",
      body: (
        <>
          <p>We do not sell your personal data. We share it only with:</p>
          <ul>
            <li>
              <strong>Our realtors</strong> &mdash; the realtor who referred
              you can see the details needed to follow up on your subscription
              or investment and earn their commission.
            </li>
            <li>
              <strong>Service providers who process data on our
              behalf</strong>, under contractual confidentiality and security
              obligations: website and database hosting; email delivery;
              SMS delivery; image and document storage; error monitoring;
              website analytics; and our AI chat provider.
            </li>
            <li>
              <strong>Professional advisers and land authorities</strong>{" "}
              &mdash; lawyers, surveyors, auditors, and government land
              registries where needed to perfect title or meet legal
              requirements.
            </li>
            <li>
              <strong>Authorities</strong> &mdash; courts, regulators and law
              enforcement where the law requires it, or where needed to
              protect our rights, our clients or the public.
            </li>
            <li>
              <strong>A successor business</strong> &mdash; if we are involved
              in a merger, acquisition or sale of assets, subject to this
              policy continuing to protect your data.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "international-transfers",
      title: "International transfers",
      body: (
        <p>
          Some of our service providers store or process data outside Nigeria,
          including in the United States and the European Union. Where we
          transfer personal data outside Nigeria we rely on the transfer
          mechanisms the NDPA allows &mdash; such as the recipient country
          having adequate protection, appropriate contractual safeguards, or
          your consent &mdash; and we require providers to protect the data
          to a standard consistent with this policy.
        </p>
      ),
    },
    {
      id: "cookies",
      title: "Cookies and device storage",
      body: (
        <>
          <p>We use a small number of cookies and browser-storage items:</p>
          <ul>
            <li>
              <strong>Strictly necessary sign-in cookies</strong> &mdash; when
              you sign in to the client portal or a dashboard, we set a
              short-lived session cookie (about 15 minutes), a refresh cookie
              that keeps you signed in for up to 30 days, and a security token
              that protects your account against cross-site request forgery.
              The Website&rsquo;s accounts cannot work without them.
            </li>
            <li>
              <strong>Session storage</strong> &mdash; your browser keeps your
              current chat conversation and whether you have dismissed the
              site announcement bar. These are cleared when you close the tab.
            </li>
            <li>
              <strong>App sign-in tokens</strong> &mdash; when you sign in to
              the App, your sign-in tokens are saved on your device so you stay
              signed in. They are removed when you sign out or uninstall the
              App, and they stop working when they expire or when your account
              is deleted.
            </li>
            <li>
              <strong>Analytics cookies</strong> &mdash; if enabled, Google
              Analytics sets cookies that help us understand how visitors use
              the Website in aggregate. The App does not use advertising
              identifiers and does not show ads.
            </li>
          </ul>
          <p>
            You can block or delete cookies in your browser settings. If you
            block the sign-in cookies, you will not be able to use the client
            portal or dashboards. You can opt out of Google Analytics using
            Google&rsquo;s opt-out browser add-on.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      title: "How long we keep your data",
      body: (
        <>
          <p>We keep personal data only as long as we need it:</p>
          <ul>
            <li>
              <strong>Subscription, investment, payment and title
              records</strong> &mdash; for as long as you hold an interest in
              the property or investment, and afterwards for as long as tax,
              accounting, land-transaction and limitation laws require.
            </li>
            <li>
              <strong>Account data</strong> &mdash; for as long as your account
              is open, and for a reasonable period after closure to deal with
              any queries or claims.
            </li>
            <li>
              <strong>Enquiries and inspection bookings</strong> &mdash; for as
              long as needed to deal with the enquiry or follow up on your
              interest, unless they lead to a subscription or investment.
            </li>
            <li>
              <strong>Sign-in refresh tokens</strong> &mdash; deleted
              automatically when they expire.
            </li>
          </ul>
          <p>
            When data is no longer needed we delete it or anonymise it so it
            can no longer identify you.
          </p>
        </>
      ),
    },
    {
      id: "security",
      title: "How we protect your data",
      body: (
        <p>
          We use technical and organisational measures to protect personal
          data, including encrypted connections (HTTPS), hashed passwords,
          httpOnly sign-in cookies, protection against cross-site request
          forgery, temporary account lockout after repeated failed sign-in
          attempts, role-based access so staff see only what their job needs,
          and rate limiting. No system is completely secure. If a personal
          data breach is likely to put your rights and freedoms at high risk,
          we will notify you and the Nigeria Data Protection Commission as the
          NDPA requires.
        </p>
      ),
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: (
        <>
          <p>Under the NDPA you have the right to:</p>
          <ul>
            <li>be informed about how we use your personal data;</li>
            <li>access your personal data and get a copy of it;</li>
            <li>have inaccurate or incomplete data corrected;</li>
            <li>have your data deleted where we no longer have a lawful reason to keep it;</li>
            <li>restrict how we process your data in certain circumstances;</li>
            <li>object to processing based on our legitimate interests, and to direct marketing at any time;</li>
            <li>receive your data in a commonly used, machine-readable format and have it sent to another controller;</li>
            <li>withdraw consent at any time, where we rely on consent;</li>
            <li>not be subject to a decision based solely on automated processing that significantly affects you; and</li>
            <li>
              complain to the{" "}
              <a
                href="https://ndpc.gov.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="text-customPurple-600 underline"
              >
                Nigeria Data Protection Commission
              </a>
              .
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us using the details
            below. We may need to verify your identity before acting on a
            request. We will respond within the time the law requires, and we
            won&rsquo;t charge you unless a request is manifestly unfounded or
            excessive. Some rights have limits &mdash; for example, we cannot
            delete records we are legally required to keep.
          </p>
          <p>
            To delete your account, follow the steps in{" "}
            <a href="#delete-account" className="text-customPurple-600 underline">Deleting your account</a>.
          </p>
          <p>
            If any of your details change &mdash; for example your phone
            number, address or bank account &mdash; please let us know so we
            can keep our records accurate.
          </p>
        </>
      ),
    },
    {
      id: "delete-account",
      title: "Deleting your account",
      body: (
        <>
          <p>
            You can delete your client or realtor account at any time, in the
            App (open your profile and choose <strong>Delete account</strong>)
            or by emailing us from the address registered to your account.
            When we delete your account we remove your profile, sign-in
            details, profile photo, uploaded identity documents, push
            notification tokens and, for realtors, your bank details.
          </p>
          <p>
            We keep records we are legally required to keep &mdash; such as
            subscription, payment, investment, commission and title records
            &mdash; for as long as the law requires, and we keep what we need
            to honour any subscription or investment that is still active.
            Full details, including how long each type of record is kept,
            are on our{" "}
            <Link href="/delete-account" className="text-customPurple-600 underline">account deletion page</Link>.
          </p>
        </>
      ),
    },
    {
      id: "children",
      title: "Children",
      body: (
        <p>
          Our services are intended for adults aged 18 and over. We do not
          knowingly collect personal data from children. If you believe a
          child has given us personal data, please contact us and we will
          delete it.
        </p>
      ),
    },
    {
      id: "third-party-links",
      title: "Third-party websites",
      body: (
        <p>
          Our Services link to third-party services such as Google Maps,
          WhatsApp, YouTube and social media, and the App is distributed
          through app stores such as Google Play. Their own privacy policies
          govern how they handle your data, and we are not responsible for
          their practices.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: (
        <p>
          We may update this policy from time to time. The effective date at
          the top shows when it last changed. If we make a significant change,
          we will tell you through our Services or by email before it takes
          effect.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact us",
      body: (
        <>
          <p>
            For any question about this policy or your personal data, or to
            exercise your rights, contact us at:
          </p>
          <ContactBlock contact={contact} />
        </>
      ),
    },
  ];

  return (
    <LegalDocument
      title="Privacy Policy"
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <p>
          Your privacy matters to us. This policy explains what personal data
          Kemchuta Homes Limited collects through our website and mobile app, why we collect it, who we share it
          with, how long we keep it, and the rights you have over it.
        </p>
      }
      sections={sections}
      related={{ name: "Terms of Use", href: "/terms" }}
    />
  );
}
