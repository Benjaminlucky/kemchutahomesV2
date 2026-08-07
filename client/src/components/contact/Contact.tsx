"use client";

import { useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Building2,
  MessageSquare,
} from "lucide-react";
// lucide-react 1.x dropped trademarked brand icons — pulled from
// react-icons (already a dependency) for these instead.
import {
  FaInstagram,
  FaFacebook,
  FaXTwitter,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa6";
import type { Branch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const PURPLE_MID = "#8A2FF0";
const PURPLE_LIGHT = "#EDE9FE";

type DisplayBranch = {
  id: string;
  label: string;
  badge: string;
  badgeColor: string;
  isHQ: boolean;
  address: string;
  phones: string[];
  emails: string[];
  hours: { weekdays: string; saturday: string; sunday: string };
  mapSrc: string;
  mapLink: string;
  social: Branch["social"];
  accentGrad: string;
  icon: ComponentType<{ size?: number; color?: string }>;
};

function shapeBranches(branches: Branch[]): DisplayBranch[] {
  return branches.map((b) => ({
    id: b.branchId,
    label: b.label,
    badge: b.isHQ ? "Headquarters" : "Branch Office",
    badgeColor: b.isHQ ? PURPLE : "#059669",
    isHQ: b.isHQ,
    address: b.address || "",
    phones: (b.phones || []).filter(Boolean),
    emails: (b.emails || []).filter(Boolean),
    hours: {
      weekdays: b.hours?.weekdays || "",
      saturday: b.hours?.saturday || "",
      sunday: b.hours?.sunday || "",
    },
    mapSrc: b.mapEmbedUrl || "",
    mapLink: b.mapLink || "",
    social: b.social || {},
    accentGrad: b.isHQ
      ? `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 100%)`
      : "linear-gradient(135deg,#065f46 0%,#059669 100%)",
    icon: b.isHQ ? Building2 : MapPin,
  }));
}

// The company's socials are set per-branch in the admin ("Contact Info")
// panel, but there's only one "Follow Us" block on the page — resolve one
// link per platform by preferring the HQ branch, falling back to whichever
// other branch has that platform filled in, so admin edits actually reach
// the live site instead of being silently ignored.
const SOCIAL_PLATFORMS = [
  { key: "instagram", icon: FaInstagram, label: "Instagram", color: "#e1306c" },
  { key: "facebook", icon: FaFacebook, label: "Facebook", color: "#1877f2" },
  { key: "twitter", icon: FaXTwitter, label: "X / Twitter", color: "#000000" },
  { key: "whatsapp", icon: FaWhatsapp, label: "WhatsApp", color: "#25d366" },
  { key: "youtube", icon: FaYoutube, label: "YouTube", color: "#ff0000" },
] as const;

function resolveSocialLinks(branches: DisplayBranch[]) {
  const ordered = [...branches].sort((a, b) => Number(b.isHQ) - Number(a.isHQ));
  return SOCIAL_PLATFORMS.map((platform) => {
    const href = ordered.map((b) => b.social?.[platform.key]).find(Boolean);
    return href ? { ...platform, href } : null;
  }).filter((v): v is (typeof SOCIAL_PLATFORMS)[number] & { href: string } => v !== null);
}

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay },
  },
});

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
      style={{
        background: "rgba(112,12,235,0.08)",
        border: "1px solid rgba(112,12,235,0.2)",
        color: PURPLE,
      }}
    >
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full"
        style={{ background: PURPLE }}
      />
      {children}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  color = PURPLE,
}: {
  icon: ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  value: string;
  href?: string;
  color?: string;
}) {
  const content = (
    <div className="group flex items-start gap-3">
      <div
        className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-110"
        style={{ background: `${color}14`, border: `1px solid ${color}22` }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#9ca3af",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: "0 0 2px",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#111827",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} style={{ textDecoration: "none" }}>
      {content}
    </a>
  ) : (
    content
  );
}

function BranchCard({
  branch,
  index,
  isInView,
}: {
  branch: DisplayBranch;
  index: number;
  isInView: boolean;
}) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const Icon = branch.icon;

  return (
    <motion.div
      variants={fadeUp(0.1 + index * 0.12)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          background: branch.accentGrad,
          padding: "24px 28px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -20,
            left: "30%",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        <div className="relative flex items-start justify-between">
          <div>
            <div
              className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black tracking-widest uppercase"
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "#fff",
                backdropFilter: "blur(8px)",
              }}
            >
              {branch.badge === "Headquarters" && (
                <span style={{ fontSize: 10 }}>★</span>
              )}
              {branch.badge}
            </div>
            <h3
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.04em",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {branch.label} Office
            </h3>
          </div>
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Icon size={22} color="#fff" />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          height: 220,
          background: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        {branch.mapSrc ? (
          <>
            {!mapLoaded && (
              <div
                className="absolute inset-0 flex animate-pulse items-center justify-center"
                style={{ background: "#f3f4f6", zIndex: 1 }}
              >
                <MapPin size={32} style={{ color: "#d1d5db" }} />
              </div>
            )}
            <iframe
              title={`${branch.label} office map`}
              src={branch.mapSrc}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
                transition: "opacity 0.4s",
                opacity: mapLoaded ? 1 : 0,
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setMapLoaded(true)}
            />
          </>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "#f3f4f6" }}
          >
            <MapPin size={28} style={{ color: "#d1d5db" }} />
            <p style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af" }}>
              Map preview not available
            </p>
          </div>
        )}
      </div>

      <div style={{ padding: "24px 28px 28px", background: "#fff" }}>
        <div className="space-y-4">
          <InfoRow
            icon={MapPin}
            label="Address"
            value={branch.address}
            href={branch.mapLink}
            color={branch.badgeColor}
          />
          {branch.phones.length > 0 && (
            <div
              className={
                branch.phones.length > 1
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
                  : ""
              }
            >
              {branch.phones.slice(0, 2).map((phone, i) => (
                <InfoRow
                  key={phone}
                  icon={Phone}
                  label={branch.phones.length > 1 ? `Phone ${i + 1}` : "Phone"}
                  value={phone}
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  color={branch.badgeColor}
                />
              ))}
            </div>
          )}
          {branch.emails.length > 0 && (
            <div
              className={
                branch.emails.length > 1
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
                  : ""
              }
            >
              {branch.emails.slice(0, 2).map((email, i) => (
                <InfoRow
                  key={email}
                  icon={Mail}
                  label={branch.emails.length > 1 ? `Email ${i + 1}` : "Email"}
                  value={email}
                  href={`mailto:${email}`}
                  color={branch.badgeColor}
                />
              ))}
            </div>
          )}
          {(branch.hours.weekdays || branch.hours.saturday || branch.hours.sunday) && (
            <InfoRow
              icon={Clock}
              label="Office Hours"
              value={[branch.hours.weekdays, branch.hours.saturday, branch.hours.sunday]
                .filter(Boolean)
                .join("   ·   ")}
              color={branch.badgeColor}
            />
          )}
        </div>

        {branch.mapLink && (
          <a
            href={branch.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: `${branch.badgeColor}10`,
              border: `1.5px solid ${branch.badgeColor}30`,
              color: branch.badgeColor,
              textDecoration: "none",
            }}
          >
            <MapPin size={14} />
            Get Directions
            <ArrowRight size={13} />
          </a>
        )}
      </div>
    </motion.div>
  );
}

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  branch: string;
};

function ContactForm({
  isInView,
  branches,
}: {
  isInView: boolean;
  branches: DisplayBranch[];
}) {
  const defaultBranch = branches.find((b) => b.isHQ)?.label ?? branches[0]?.label ?? "";
  const [form, setForm] = useState<ContactFormState>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    branch: defaultBranch,
  });
  const [errors, setErrors] = useState<Partial<ContactFormState>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const setField = (k: keyof ContactFormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
    setApiError("");
  };

  const validate = (): Partial<ContactFormState> => {
    const e: Partial<ContactFormState> = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name.trim()) e.name = "Name is required";
    if (!emailRx.test(form.email)) e.email = "Valid email is required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.trim().length < 10)
      e.message = "Message must be at least 10 characters";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send message");
      setSuccess(true);
      trackEvent("contact_form_submit", { branch: form.branch });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Failed to fetch") || message.includes("404")) {
        const mailto = `mailto:info@kemchutahomesltd.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nBranch: ${form.branch}\n\n${form.message}`)}`;
        window.location.href = mailto;
        setSuccess(true);
        trackEvent("contact_form_submit", { branch: form.branch, via: "mailto_fallback" });
      } else {
        setApiError(message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasErr?: string): React.CSSProperties => ({
    width: "100%",
    padding: "13px 16px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    color: "#111827",
    background: hasErr ? "rgba(239,68,68,0.04)" : "#f9fafb",
    border: `1.5px solid ${hasErr ? "rgba(239,68,68,0.45)" : "rgba(0,0,0,0.1)"}`,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  });

  const focusOn = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    err?: string,
  ) => {
    if (!err) {
      e.target.style.borderColor = `${PURPLE}55`;
      e.target.style.boxShadow = `0 0 0 3px ${PURPLE}12`;
    }
  };
  const focusOff = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    err?: string,
  ) => {
    if (!err) {
      e.target.style.borderColor = "rgba(0,0,0,0.1)";
      e.target.style.boxShadow = "none";
    }
  };

  const SUBJECTS = [
    "General Enquiry",
    "Estate Subscription",
    "Book Inspection",
    "Buy2Sell Scheme",
    "Partnership",
    "Complaint / Feedback",
  ];

  return (
    <motion.div
      variants={fadeUp(0.2)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{
        background: "#fff",
        borderRadius: 24,
        padding: "clamp(24px, 4vw, 48px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="mb-8">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase"
          style={{ background: PURPLE_LIGHT, color: PURPLE }}
        >
          <MessageSquare size={11} />
          Send a Message
        </div>
        <h3
          style={{
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            fontWeight: 900,
            color: "#0f0a1e",
            letterSpacing: "-0.04em",
            margin: 0,
          }}
        >
          We&rsquo;d love to hear from you
        </h3>
        <p
          style={{
            color: "#6b7280",
            fontSize: 14,
            lineHeight: 1.65,
            marginTop: 6,
            marginBottom: 0,
          }}
        >
          Fill in the form and our team will get back to you within 24 hours.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center px-6 py-12 text-center"
            style={{
              borderRadius: 16,
              background: "rgba(5,150,105,0.05)",
              border: "2px solid rgba(5,150,105,0.2)",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 18,
                delay: 0.1,
              }}
              className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: "rgba(5,150,105,0.1)",
                border: "2px solid rgba(5,150,105,0.3)",
              }}
            >
              <CheckCircle size={30} style={{ color: "#059669" }} />
            </motion.div>
            <h4
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#059669",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Message Sent!
            </h4>
            <p
              style={{
                fontSize: 14,
                color: "#525252",
                lineHeight: 1.7,
                maxWidth: 320,
              }}
            >
              Thank you for reaching out. Our team will respond to your
              enquiry within <strong>24 hours</strong>.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  subject: "",
                  message: "",
                  branch: defaultBranch,
                });
              }}
              className="mt-6 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
              }}
            >
              Send Another Message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <AlertTriangle
                  size={15}
                  style={{ color: "#dc2626", flexShrink: 0 }}
                />
                <p
                  style={{
                    fontSize: 13,
                    color: "#dc2626",
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {apiError}
                </p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b7280",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  style={inputStyle(errors.name)}
                  onFocus={(e) => focusOn(e, errors.name)}
                  onBlur={(e) => focusOff(e, errors.name)}
                />
                {errors.name && (
                  <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b7280",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  style={inputStyle(errors.email)}
                  onFocus={(e) => focusOn(e, errors.email)}
                  onBlur={(e) => focusOff(e, errors.email)}
                />
                {errors.email && (
                  <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b7280",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="08012345678"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  style={inputStyle()}
                  onFocus={(e) => focusOn(e)}
                  onBlur={(e) => focusOff(e)}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b7280",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Preferred Branch
                </label>
                <select
                  value={form.branch}
                  onChange={(e) => setField("branch", e.target.value)}
                  style={{ ...inputStyle(), cursor: "pointer" }}
                  onFocus={(e) => focusOn(e)}
                  onBlur={(e) => focusOff(e)}
                >
                  {branches.length === 0 && <option value="">General Enquiry</option>}
                  {branches.map((b) => (
                    <option key={b.id} value={b.label}>
                      {b.label} — {b.badge}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Subject *
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setField("subject", s)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      border: `1.5px solid ${form.subject === s ? PURPLE : "rgba(0,0,0,0.12)"}`,
                      background: form.subject === s ? `${PURPLE}10` : "#fff",
                      color: form.subject === s ? PURPLE : "#6b7280",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type your own subject…"
                value={form.subject}
                onChange={(e) => setField("subject", e.target.value)}
                style={{ ...inputStyle(errors.subject), marginTop: 10 }}
                onFocus={(e) => focusOn(e, errors.subject)}
                onBlur={(e) => focusOff(e, errors.subject)}
              />
              {errors.subject && (
                <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>
                  {errors.subject}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Message *
              </label>
              <textarea
                rows={5}
                placeholder="Tell us how we can help you…"
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                style={{
                  ...inputStyle(errors.message),
                  resize: "vertical",
                  minHeight: 120,
                  lineHeight: 1.65,
                }}
                onFocus={(e) => focusOn(e, errors.message)}
                onBlur={(e) => focusOff(e, errors.message)}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.message ? (
                  <p style={{ fontSize: 11, color: "#dc2626" }}>
                    {errors.message}
                  </p>
                ) : (
                  <span />
                )}
                <span
                  style={{
                    fontSize: 11,
                    color: form.message.length < 10 ? "#9ca3af" : "#059669",
                    fontWeight: 600,
                  }}
                >
                  {form.message.length} chars
                </span>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-black text-white transition-all"
              style={{
                fontSize: 15,
                letterSpacing: "-0.01em",
                background: loading
                  ? "rgba(112,12,235,0.45)"
                  : `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE}, ${PURPLE_MID})`,
                boxShadow: loading
                  ? "none"
                  : "0 8px 28px rgba(112,12,235,0.38)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Send size={16} /> Send Message
                </>
              )}
            </motion.button>

            <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
              We respond within 24 hours &middot; Your information is kept
              private
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp(0.05 * index)}
      style={{
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 text-left"
        style={{
          padding: "18px 22px",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f0a1e" }}>
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: open ? PURPLE : "rgba(0,0,0,0.06)",
            color: open ? "#fff" : "#6b7280",
            fontSize: 18,
            fontWeight: 300,
          }}
        >
          +
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                padding: "0 22px 18px",
                fontSize: 14,
                color: "#6b7280",
                lineHeight: 1.75,
                margin: 0,
                borderTop: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const FAQS = [
  {
    q: "How do I subscribe to an estate?",
    a: "You can subscribe by filling out the subscription form on any estate's details page, or by visiting any of our offices directly. A 30% initial deposit is required to secure your plot.",
  },
  {
    q: "What documents do I need to buy land?",
    a: "You'll need a valid government-issued ID (National ID, Driver's Licence, or International Passport), two passport photographs, and your completed subscription form. Our team will guide you through the rest.",
  },
  {
    q: "Does Kemchuta Homes offer payment plans?",
    a: "Yes! We offer both outright purchase and flexible installment payment plans across all our estates. The terms vary by estate — contact us or visit any branch for details.",
  },
  {
    q: "What is the Buy2Sell scheme?",
    a: "The Buy2Sell scheme is a land-bank investment where you purchase land at today's price, hold it for 6 months, 1 year, or 18 months, then receive your capital back plus a fixed ROI. No site visit is required.",
  },
  {
    q: "How do I book a site inspection?",
    a: "You can book an inspection directly on any estate's page on our website, or call any of our offices. Inspections are conducted on weekdays and Saturday mornings.",
  },
];

export default function Contact({ branches }: { branches: Branch[] }) {
  const displayBranches = shapeBranches(branches);
  const socialLinks = resolveSocialLinks(displayBranches);
  const hqBranch = displayBranches.find((b) => b.isHQ) ?? displayBranches[0];
  const heroPhone = hqBranch?.phones[0] ?? "";
  const heroEmail = hqBranch?.emails[0] ?? "info@kemchutahomesltd.com";
  const heroRef = useRef(null);
  const officesRef = useRef(null);
  const formRef = useRef(null);
  const faqRef = useRef(null);

  const officesInView = useInView(officesRef, { once: true, amount: 0.05 });
  const formInView = useInView(formRef, { once: true, amount: 0.05 });
  const faqInView = useInView(faqRef, { once: true, amount: 0.05 });

  return (
    <main
      className="contact__page w-full overflow-x-hidden"
      style={{ background: "#f9f6ff" }}
    >
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{
          background: `linear-gradient(145deg, #060111 0%, ${PURPLE_DARK} 45%, #060111 100%)`,
          paddingTop: "clamp(80px, 14vw, 140px)",
          paddingBottom: "clamp(60px, 10vw, 100px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.3,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(112,12,235,0.15)",
            filter: "blur(100px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-5%",
            width: 450,
            height: 450,
            borderRadius: "50%",
            background: "rgba(63,12,145,0.12)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 mx-auto w-11/12 text-center md:w-10/12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
              style={{
                background: "rgba(112,12,235,0.25)",
                border: "1px solid rgba(112,12,235,0.45)",
                color: "#c084fc",
              }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
              Get In Touch
            </div>
          </motion.div>

          <motion.h1
            className="font-black text-white uppercase"
            style={{
              fontSize: "clamp(2.2rem,7vw,5.5rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              margin: "0 0 16px",
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.06,
            }}
          >
            We&rsquo;re Here{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#c084fc,#a855f7,#7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              For You
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto text-gray-400"
            style={{
              maxWidth: 520,
              fontSize: "clamp(1rem,2vw,1.15rem)",
              lineHeight: 1.75,
              margin: "0 auto 36px",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
          >
            Whether you want to invest, book an inspection, or simply ask a
            question — our team{" "}
            {displayBranches.length > 1
              ? `across all ${displayBranches.length} offices`
              : ""}{" "}
            is ready to help.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {heroPhone && (
              <a
                href={`tel:${heroPhone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`,
                  boxShadow: "0 6px 20px rgba(112,12,235,0.4)",
                  textDecoration: "none",
                }}
              >
                <Phone size={14} /> Call {hqBranch?.label} {hqBranch?.isHQ ? "HQ" : ""}
              </a>
            )}
            <a
              href={`mailto:${heroEmail}`}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              <Mail size={14} /> Send Email
            </a>
          </motion.div>

          <motion.div
            className="mt-14 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
              style={{
                width: 1,
                height: 48,
                background:
                  "linear-gradient(to bottom,rgba(255,255,255,0.5),transparent)",
                borderRadius: 1,
              }}
            />
          </motion.div>
        </div>
      </section>

      <section
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="mx-auto w-11/12 py-6 md:w-10/12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { val: String(displayBranches.length), label: "Office Locations" },
              { val: "< 24h", label: "Response Time" },
              { val: "Mon–Sat", label: "We're Available" },
              { val: "5,000+", label: "Happy Clients" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p
                  style={{
                    fontSize: "clamp(1.4rem,3vw,2rem)",
                    fontWeight: 900,
                    color: PURPLE,
                    letterSpacing: "-0.04em",
                    margin: "0 0 2px",
                  }}
                >
                  {s.val}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    margin: 0,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={officesRef}
        className="w-full"
        style={{ padding: "clamp(48px,8vw,96px) 0" }}
      >
        <div className="mx-auto w-11/12 md:w-10/12">
          <motion.div
            className="mb-12 text-center md:mb-16"
            variants={fadeUp(0)}
            initial="hidden"
            animate={officesInView ? "visible" : "hidden"}
          >
            <SectionBadge>Our Offices</SectionBadge>
            <h2
              className="font-black uppercase"
              style={{
                fontSize: "clamp(1.8rem,4.5vw,3.5rem)",
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                color: "#0f0a1e",
              }}
            >
              Find Us{" "}
              <span
                style={{
                  background: `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Near You
              </span>
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: 15,
                maxWidth: 440,
                margin: "10px auto 0",
                lineHeight: 1.7,
              }}
            >
              Visit any of our offices — our team is always ready to guide
              you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {displayBranches.map((branch, i) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                index={i}
                isInView={officesInView}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        ref={formRef}
        style={{
          background: `linear-gradient(180deg,#f9f6ff 0%,#fff 100%)`,
          padding: "clamp(48px,8vw,96px) 0",
        }}
      >
        <div className="mx-auto w-11/12 md:w-10/12">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-5 lg:gap-12">
            <motion.div
              className="lg:col-span-2"
              variants={fadeUp(0)}
              initial="hidden"
              animate={formInView ? "visible" : "hidden"}
            >
              <SectionBadge>Contact Form</SectionBadge>
              <h2
                className="font-black uppercase"
                style={{
                  fontSize: "clamp(1.8rem,4vw,3rem)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                  color: "#0f0a1e",
                  margin: "0 0 14px",
                }}
              >
                Let&rsquo;s Start a{" "}
                <span
                  style={{
                    background: `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Conversation
                </span>
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 15,
                  lineHeight: 1.75,
                  marginBottom: 28,
                }}
              >
                Have a question about our estates, the Buy2Sell scheme, or
                anything else? Drop us a message and we&rsquo;ll get back to
                you within 24 hours.
              </p>

              <div className="mb-8 space-y-4">
                {displayBranches.map((b) =>
                  b.phones[0] ? (
                    <InfoRow
                      key={b.id}
                      icon={Phone}
                      label={b.isHQ ? `${b.label} HQ` : `${b.label} Branch`}
                      value={b.phones[0]}
                      href={`tel:${b.phones[0].replace(/\s+/g, "")}`}
                    />
                  ) : null,
                )}
                <InfoRow
                  icon={Mail}
                  label="General Email"
                  value={heroEmail}
                  href={`mailto:${heroEmail}`}
                />
              </div>

              {socialLinks.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#9ca3af",
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    Follow Us
                  </p>
                  <div className="flex gap-3">
                    {socialLinks.map(({ icon: Icon, label, href, color }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:-translate-y-1"
                        style={{
                          background: `${color}12`,
                          border: `1px solid ${color}25`,
                          color,
                          textDecoration: "none",
                        }}
                      >
                        <Icon size={17} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <div className="lg:col-span-3">
              <ContactForm isInView={formInView} branches={displayBranches} />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={faqRef}
        style={{ background: "#fff", padding: "clamp(48px,8vw,96px) 0" }}
      >
        <div className="mx-auto w-11/12 md:w-10/12">
          <motion.div
            className="mb-12 text-center"
            variants={fadeUp(0)}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
          >
            <SectionBadge>FAQ</SectionBadge>
            <h2
              className="font-black uppercase"
              style={{
                fontSize: "clamp(1.8rem,4.5vw,3.5rem)",
                letterSpacing: "-0.04em",
                color: "#0f0a1e",
              }}
            >
              Common{" "}
              <span
                style={{
                  background: `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Questions
              </span>
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: 15,
                maxWidth: 420,
                margin: "10px auto 0",
              }}
            >
              Can&rsquo;t find your answer here? Send us a message above.
            </p>
          </motion.div>

          <motion.div
            className="mx-auto max-w-3xl space-y-3"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
          >
            {FAQS.map((faq, i) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      <section
        style={{
          background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 55%, ${PURPLE_MID} 100%)`,
          padding: "clamp(48px,8vw,80px) 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "20%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            right: "10%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 mx-auto w-11/12 text-center md:w-10/12">
          <h2
            className="font-black text-white uppercase"
            style={{
              fontSize: "clamp(1.8rem,5vw,4rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              margin: "0 0 14px",
            }}
          >
            Ready to Own Your Land?
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 16,
              maxWidth: 440,
              margin: "0 auto 32px",
              lineHeight: 1.7,
            }}
          >
            Explore our active estates and subscribe today. Our team will
            guide you every step of the way.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/developments"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-black tracking-widest uppercase transition-all hover:-translate-y-0.5"
              style={{
                background: "#fff",
                color: PURPLE,
                boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
                textDecoration: "none",
              }}
            >
              Explore Estates <ArrowRight size={15} />
            </Link>
            {heroPhone && (
              <a
                href={`tel:${heroPhone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-black tracking-widest uppercase transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                <Phone size={14} /> Call Us Now
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
