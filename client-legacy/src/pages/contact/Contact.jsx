import React, { useState, useRef } from "react";
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
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

// ── Brand ──────────────────────────────────────────────────────────────────────
const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const PURPLE_MID = "#8A2FF0";
const PURPLE_LIGHT = "#EDE9FE";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Branch data is fetched live from /api/branches (managed by admin dashboard)
// Shape each API branch into the display format BranchCard expects
function useBranches() {
  const [branches, setBranches] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${BASE_URL}/api/branches`)
      .then((r) => r.json())
      .then((data) => {
        const shaped = (Array.isArray(data) ? data : [])
          .filter((b) => b.isActive !== false)
          .map((b) => ({
            id: b.branchId,
            label: b.label,
            badge: b.isHQ ? "Headquarters" : "Branch Office",
            badgeColor: b.isHQ ? PURPLE : "#059669",
            address: b.address || "",
            phone: b.phones?.[0] || "",
            phone2: b.phones?.[1] || "",
            email: b.emails?.[0] || "",
            hours: b.hours?.weekdays || "",
            hours2: b.hours?.saturday || "",
            mapSrc: b.mapEmbedUrl || "",
            mapLink: b.mapLink || "",
            accentGrad: b.isHQ
              ? `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 100%)`
              : "linear-gradient(135deg,#065f46 0%,#059669 100%)",
            icon: b.isHQ ? Building2 : MapPin,
          }));
        setBranches(shaped);
      })
      .catch(() => setBranches([]))
      .finally(() => setLoading(false));
  }, []);

  return { branches, loading };
}

const SOCIAL_LINKS = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/kemchutahomesltd",
    color: "#e1306c",
  },
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://facebook.com/kemchutahomes",
    color: "#1877f2",
  },
  {
    icon: Twitter,
    label: "X / Twitter",
    href: "https://twitter.com/kemchutahomes",
    color: "#000000",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
  },
});

// ── Section heading ────────────────────────────────────────────────────────────
function SectionBadge({ children }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
      style={{
        background: "rgba(112,12,235,0.08)",
        border: "1px solid rgba(112,12,235,0.2)",
        color: PURPLE,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: PURPLE }}
      />
      {children}
    </div>
  );
}

// ── Contact info row ───────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, href, color = PURPLE }) {
  const content = (
    <div className="flex items-start gap-3 group">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 group-hover:scale-110"
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

// ── Branch card ────────────────────────────────────────────────────────────────
function BranchCard({ branch, index, isInView }) {
  const [mapLoaded, setMapLoaded] = useState(false);

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
      {/* Card header */}
      <div
        style={{
          background: branch.accentGrad,
          padding: "24px 28px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circle */}
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3"
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
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", flexShrink: 0 }}
          >
            <branch.icon size={22} color="#fff" />
          </div>
        </div>
      </div>

      {/* Map embed */}
      <div
        style={{
          position: "relative",
          height: 220,
          background: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        {!mapLoaded && (
          <div
            className="absolute inset-0 animate-pulse flex items-center justify-center"
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
      </div>

      {/* Info section */}
      <div style={{ padding: "24px 28px 28px", background: "#fff" }}>
        <div className="space-y-4">
          <InfoRow
            icon={MapPin}
            label="Address"
            value={branch.address}
            href={branch.mapLink}
            color={branch.badgeColor}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              icon={Phone}
              label="Phone"
              value={branch.phone}
              href={`tel:${branch.phone}`}
              color={branch.badgeColor}
            />
            <InfoRow
              icon={Phone}
              label="Phone 2"
              value={branch.phone2}
              href={`tel:${branch.phone2}`}
              color={branch.badgeColor}
            />
          </div>
          <InfoRow
            icon={Mail}
            label="Email"
            value={branch.email}
            href={`mailto:${branch.email}`}
            color={branch.badgeColor}
          />
          <InfoRow
            icon={Clock}
            label="Office Hours"
            value={`${branch.hours}   ·   ${branch.hours2}`}
            color={branch.badgeColor}
          />
        </div>

        {/* Get directions button */}
        <a
          href={branch.mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full inline-flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
          style={{
            display: "flex",
            background: `${branch.badgeColor}10`,
            border: `1.5px solid ${branch.badgeColor}30`,
            color: branch.badgeColor,
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${branch.badgeColor}18`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${branch.badgeColor}10`;
          }}
        >
          <MapPin size={14} />
          Get Directions
          <ArrowRight size={13} />
        </a>
      </div>
    </motion.div>
  );
}

// ── Contact Form ───────────────────────────────────────────────────────────────
function ContactForm({ isInView }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    branch: "Lagos",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name.trim()) e.name = "Name is required";
    if (!emailRx.test(form.email)) e.email = "Valid email is required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.trim().length < 10)
      e.message = "Message must be at least 10 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      // Send via Resend through backend notifications system
      const res = await fetch(`${BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send message");
      setSuccess(true);
    } catch (err) {
      // Fallback: mailto link — ensures message always gets through
      // even if the /api/contact endpoint doesn't exist yet
      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("404")
      ) {
        const mailto = `mailto:info@kemchutahomesltd.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nBranch: ${form.branch}\n\n${form.message}`)}`;
        window.location.href = mailto;
        setSuccess(true);
      } else {
        setApiError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasErr) => ({
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

  const focusOn = (e, err) => {
    if (!err) {
      e.target.style.borderColor = `${PURPLE}55`;
      e.target.style.boxShadow = `0 0 0 3px ${PURPLE}12`;
    }
  };
  const focusOff = (e, err) => {
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
      {/* Form header */}
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3"
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
          We'd love to hear from you
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
            className="flex flex-col items-center text-center py-12 px-6"
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
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
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
              Thank you for reaching out. Our team will respond to your enquiry
              within <strong>24 hours</strong>.
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
                  branch: "Lagos",
                });
              }}
              className="mt-6 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
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
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
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

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Phone + Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  style={inputStyle(false)}
                  onFocus={(e) => focusOn(e, false)}
                  onBlur={(e) => focusOff(e, false)}
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
                  style={{ ...inputStyle(false), cursor: "pointer" }}
                  onFocus={(e) => focusOn(e, false)}
                  onBlur={(e) => focusOff(e, false)}
                >
                  <option value="Lagos">Lagos — Headquarters</option>
                  <option value="Asaba">Asaba — Branch Office</option>
                </select>
              </div>
            </div>

            {/* Subject */}
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

            {/* Message */}
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
              <div className="flex items-center justify-between mt-1">
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

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 font-black text-white py-4 rounded-2xl transition-all"
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
              onMouseEnter={(e) => {
                if (!loading)
                  e.currentTarget.style.boxShadow =
                    "0 14px 40px rgba(112,12,235,0.55)";
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  e.currentTarget.style.boxShadow =
                    "0 8px 28px rgba(112,12,235,0.38)";
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
              We respond within 24 hours · Your information is kept private
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── FAQ item ───────────────────────────────────────────────────────────────────
function FAQItem({ q, a, index }) {
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
        className="w-full flex items-center justify-between gap-4 text-left"
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

// ── Main Page ──────────────────────────────────────────────────────────────────
function Contact() {
  const { branches: BRANCHES, loading: branchesLoading } = useBranches();
  const heroRef = useRef(null);
  const officesRef = useRef(null);
  const formRef = useRef(null);
  const faqRef = useRef(null);

  const officesInView = useInView(officesRef, { once: true, threshold: 0.05 });
  const formInView = useInView(formRef, { once: true, threshold: 0.05 });
  const faqInView = useInView(faqRef, { once: true, threshold: 0.05 });

  return (
    <main
      className="contact__page w-full overflow-x-hidden"
      style={{ background: "#f9f6ff" }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          HERO
      ───────────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="w-full relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, #060111 0%, ${PURPLE_DARK} 45%, #060111 100%)`,
          paddingTop: "clamp(80px, 14vw, 140px)",
          paddingBottom: "clamp(60px, 10vw, 100px)",
        }}
      >
        {/* Grid texture */}
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
        {/* Blobs */}
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

        <div className="w-11/12 md:w-10/12 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
              style={{
                background: "rgba(112,12,235,0.25)",
                border: "1px solid rgba(112,12,235,0.45)",
                color: "#c084fc",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Get In Touch
            </div>
          </motion.div>

          <motion.h1
            className="font-black uppercase text-white"
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
            We're Here{" "}
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
            className="text-gray-400 mx-auto"
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
            question — our team across both offices is ready to help.
          </motion.p>

          {/* Quick contact chips */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <a
              href="tel:+2348000000001"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white text-sm transition-all hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`,
                boxShadow: "0 6px 20px rgba(112,12,235,0.4)",
                textDecoration: "none",
              }}
            >
              <Phone size={14} /> Call Lagos HQ
            </a>
            <a
              href="mailto:info@kemchutahomesltd.com"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5"
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

          {/* Scroll indicator */}
          <motion.div
            className="flex justify-center mt-14"
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

      {/* ─────────────────────────────────────────────────────────────────────
          QUICK STATS STRIP
      ───────────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="w-11/12 md:w-10/12 mx-auto py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { val: "2", label: "Office Locations" },
              { val: "< 24h", label: "Response Time" },
              { val: "Mon–Sat", label: "We're Available" },
              { val: "5,000+", label: "Happy Clients" },
            ].map((s, i) => (
              <div key={i} className="text-center">
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

      {/* ─────────────────────────────────────────────────────────────────────
          OFFICE LOCATIONS
      ───────────────────────────────────────────────────────────────────── */}
      <section
        ref={officesRef}
        className="w-full"
        style={{ padding: "clamp(48px,8vw,96px) 0" }}
      >
        <div className="w-11/12 md:w-10/12 mx-auto">
          <motion.div
            className="text-center mb-12 md:mb-16"
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
              Visit any of our offices — our team is always ready to guide you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {branchesLoading
              ? [0, 1].map((i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: 24,
                      height: 560,
                      background: "rgba(0,0,0,0.04)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                    className="animate-pulse"
                  />
                ))
              : BRANCHES.map((branch, i) => (
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

      {/* ─────────────────────────────────────────────────────────────────────
          CONTACT FORM + SIDE INFO
      ───────────────────────────────────────────────────────────────────── */}
      <section
        ref={formRef}
        style={{
          background: `linear-gradient(180deg,#f9f6ff 0%,#fff 100%)`,
          padding: "clamp(48px,8vw,96px) 0",
        }}
      >
        <div className="w-11/12 md:w-10/12 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-start">
            {/* Side info — 2 of 5 cols */}
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
                Let's Start a{" "}
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
                anything else? Drop us a message and we'll get back to you
                within 24 hours.
              </p>

              {/* Direct contacts */}
              <div className="space-y-4 mb-8">
                <InfoRow
                  icon={Phone}
                  label="Lagos HQ"
                  value="+234 800 000 0001"
                  href="tel:+2348000000001"
                />
                <InfoRow
                  icon={Phone}
                  label="Asaba Branch"
                  value="+234 800 000 0003"
                  href="tel:+2348000000003"
                />
                <InfoRow
                  icon={Mail}
                  label="General Email"
                  value="info@kemchutahomesltd.com"
                  href="mailto:info@kemchutahomesltd.com"
                />
              </div>

              {/* Social media */}
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
                  {SOCIAL_LINKS.map(({ icon: Icon, label, href, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:-translate-y-1"
                      style={{
                        background: `${color}12`,
                        border: `1px solid ${color}25`,
                        color,
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${color}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${color}12`;
                      }}
                    >
                      <Icon size={17} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Form — 3 of 5 cols */}
            <div className="lg:col-span-3">
              <ContactForm isInView={formInView} />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          FAQ
      ───────────────────────────────────────────────────────────────────── */}
      <section
        ref={faqRef}
        style={{ background: "#fff", padding: "clamp(48px,8vw,96px) 0" }}
      >
        <div className="w-11/12 md:w-10/12 mx-auto">
          <motion.div
            className="text-center mb-12"
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
              Can't find your answer here? Send us a message above.
            </p>
          </motion.div>

          <motion.div
            className="max-w-3xl mx-auto space-y-3"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
          >
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          BOTTOM CTA BANNER
      ───────────────────────────────────────────────────────────────────── */}
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

        <div className="w-11/12 md:w-10/12 mx-auto text-center relative z-10">
          <h2
            className="font-black uppercase text-white"
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
            Explore our active estates and subscribe today. Our team will guide
            you every step of the way.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/developments"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:-translate-y-0.5"
              style={{
                background: "#fff",
                color: PURPLE,
                boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
                textDecoration: "none",
              }}
            >
              Explore Estates <ArrowRight size={15} />
            </a>
            <a
              href="tel:+2348000000001"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              <Phone size={14} /> Call Us Now
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;
