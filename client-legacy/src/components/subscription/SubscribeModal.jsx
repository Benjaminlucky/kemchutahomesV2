import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  FileText,
  Users,
  Globe,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const TITLES = ["Mr", "Mrs", "Miss", "Dr", "Chief", "Engr", "Hon"];
const GENDERS = ["Male", "Female", "Prefer not to say"];
const MARITAL = ["Single", "Married", "Divorced", "Widowed"];
const NATIONALITIES = [
  "Nigerian",
  "Ghanaian",
  "South African",
  "Kenyan",
  "British",
  "American",
  "Canadian",
  "Other",
];
const PLOT_TYPES = ["Residential", "Commercial", "Investment"];
const PAYMENT_PLANS = ["Outright", "6 Months Installment"];
const PLOT_SIZES = ["500sqm", "300sqm", "Corner Piece"];
const SURVEY_TYPES = ["Registered Survey", "Provisional Survey"];
const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];
const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "South Africa",
  "Kenya",
  "United Kingdom",
  "United States",
  "Canada",
  "Germany",
  "France",
  "Australia",
  "Other",
];

const EMPTY_FORM = {
  // Personal
  title: "",
  firstName: "",
  lastName: "",
  maritalStatus: "",
  dateOfBirth: "",
  gender: "",
  spouseFirstName: "",
  spouseLastName: "",
  nationality: "Nigerian",
  employerName: "",
  // Address
  residentialAddress: "",
  cityTown: "",
  lga: "",
  state: "",
  countryOfResidence: "Nigeria",
  phone: "",
  email: "",
  // Subscription
  plotType: "Residential",
  paymentPlan: "Outright",
  numberOfPlots: 1,
  plotSize: "500sqm",
  surveyType: "Registered Survey",
  // Next of kin
  kinFirstName: "",
  kinLastName: "",
  kinAddress: "",
  kinCity: "",
  kinLga: "",
  kinPhone: "",
  // Terms
  agreedToTerms: false,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (num) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(num);

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  return Number(String(priceStr).replace(/[₦,\s]/g, "")) || 0;
};

const calcTotal = (basePrice, plotSize, numberOfPlots, paymentPlan) => {
  let unit = basePrice;
  if (plotSize === "Corner Piece") unit = unit + unit * 0.1;
  let total = unit * numberOfPlots;
  return total;
};

// ── Terms Modal ───────────────────────────────────────────────────────────────
function TermsModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: "rgba(8,4,20,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94 }}
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "#fff",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-8 py-6 flex items-center justify-between shrink-0"
          style={{
            background: "linear-gradient(135deg,#3F0C91,#700CEB)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: "-0.03em",
            }}
          >
            Terms & Conditions
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto" style={{ flex: 1 }}>
          {[
            {
              title: "1. Subscription Agreement",
              body: "By subscribing to any plot on the Kemchuta Homes platform, the subscriber agrees to be bound by the terms herein. This subscription constitutes a binding agreement between the subscriber and Kemchuta Homes Ltd.",
            },
            {
              title: "2. Payment Terms",
              body: "All payments must be made as agreed under the chosen payment plan. For outright purchase, full payment is required within 7 working days of subscription. For installment plans, payments must be made according to the agreed schedule. Failure to make payments on time may result in forfeiture of the plot without refund.",
            },
            {
              title: "3. Allocation & Title",
              body: "Physical allocation of plots is subject to full payment and completion of all documentation. Title documents will be processed and issued after full payment has been confirmed. The type of title issued will be as agreed during subscription.",
            },
            {
              title: "4. Corner Piece Premium",
              body: "Corner piece plots attract an additional 10% premium on the standard plot price. This premium is non-negotiable and applies to all corner piece selections.",
            },
            {
              title: "5. Refund Policy",
              body: "Cancellations made within 48 hours of subscription will attract a 5% administrative fee. Cancellations after 48 hours will attract a 15% administrative fee. No refunds will be processed for plots already allocated unless due to fault of Kemchuta Homes Ltd.",
            },
            {
              title: "6. Transfer of Ownership",
              body: "Plots may not be transferred to third parties without prior written consent from Kemchuta Homes Ltd. A transfer fee of 2% of the current market value will apply to all approved transfers.",
            },
            {
              title: "7. Development Rights",
              body: "Subscribers are required to develop their plots within the estate's development timeline. Kemchuta Homes Ltd reserves the right to repurchase undeveloped plots at the original subscription price after the development period lapses.",
            },
            {
              title: "8. Dispute Resolution",
              body: "Any disputes arising from this agreement shall first be resolved through mediation. If mediation fails, the matter shall be referred to arbitration in accordance with Nigerian law.",
            },
          ].map(({ title, body }) => (
            <div key={title} className="mb-6">
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#0f0a1e",
                  marginBottom: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </h4>
              <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.8 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
        <div
          className="px-8 py-5 shrink-0"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-bold text-sm"
            style={{
              background: "linear-gradient(135deg,#700CEB,#8A2FF0)",
              color: "#fff",
            }}
          >
            I've Read the Terms
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────────
function SuccessScreen({ data, totalAmount, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center p-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{
          background: "linear-gradient(135deg,#700CEB,#8A2FF0)",
          boxShadow: "0 12px 40px rgba(112,12,235,0.35)",
        }}
      >
        <CheckCircle size={36} color="#fff" strokeWidth={2.5} />
      </motion.div>
      <h3
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: "#0f0a1e",
          letterSpacing: "-0.04em",
          marginBottom: 8,
        }}
      >
        Subscription Submitted!
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "#6b7280",
          lineHeight: 1.7,
          marginBottom: 24,
          maxWidth: 320,
        }}
      >
        Your subscription form has been received. Our team will contact you
        within 24 hours to confirm and guide you through the next steps.
      </p>
      <div
        className="w-full rounded-2xl p-5 mb-6 text-left"
        style={{
          background: "rgba(112,12,235,0.04)",
          border: "1px solid rgba(112,12,235,0.1)",
        }}
      >
        {[
          { label: "Estate", value: data.estateName },
          {
            label: "Subscriber",
            value: `${data.title} ${data.firstName} ${data.lastName}`,
          },
          { label: "Plot Type", value: data.plotType },
          { label: "Plot Size", value: data.plotSize },
          { label: "No. of Plots", value: `${data.numberOfPlots}` },
          { label: "Payment Plan", value: data.paymentPlan },
          { label: "Total Amount", value: formatCurrency(totalAmount) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between items-center py-2"
            style={{ borderBottom: "1px solid rgba(112,12,235,0.06)" }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>
              {label}
            </span>
            <span style={{ fontSize: 13, color: "#0f0a1e", fontWeight: 700 }}>
              {value}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-xl font-bold text-sm"
        style={{
          background: "linear-gradient(135deg,#700CEB,#8A2FF0)",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(112,12,235,0.35)",
        }}
      >
        Close
      </button>
    </motion.div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, required, error, children, half }) {
  return (
    <div className={half ? "" : "col-span-2 sm:col-span-1"}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: error ? "#dc2626" : "#6b7280",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          display: "block",
          marginBottom: 7,
        }}
      >
        {label}
        {required && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
      {children}
      {error && (
        <p
          style={{
            fontSize: 11,
            color: "#dc2626",
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ── Shared input styles ───────────────────────────────────────────────────────
const inp = (err) => ({
  width: "100%",
  padding: "10px 13px",
  borderRadius: 10,
  fontSize: 13,
  border: `1.5px solid ${err ? "#dc2626" : "rgba(112,12,235,0.15)"}`,
  background: err ? "rgba(220,38,38,0.03)" : "#fafafa",
  outline: "none",
  color: "#0f0a1e",
  fontWeight: 500,
});

const sel = (err) => ({ ...inp(err), appearance: "none", cursor: "pointer" });

function SectionHeader({ children, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 col-span-2 mt-2 mb-1">
      <div style={{ flex: 1, height: 1, background: "rgba(112,12,235,0.1)" }} />
      <div className="flex items-center gap-1.5 shrink-0">
        {Icon && <Icon size={12} style={{ color: "#700CEB" }} />}
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#700CEB",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          {children}
        </span>
      </div>
      <div style={{ flex: 1, height: 1, background: "rgba(112,12,235,0.1)" }} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SubscribeModal({
  isOpen,
  onClose,
  estateName = "",
  estateId = null,
  estatePrice = "",
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const basePrice = parsePrice(estatePrice);
  const totalAmount = calcTotal(
    basePrice,
    form.plotSize,
    Number(form.numberOfPlots) || 1,
    form.paymentPlan,
  );

  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY_FORM });
      setErrors({});
      setApiError("");
      setSubmitted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    const req = (f, label) => {
      if (!form[f]?.toString().trim()) e[f] = `${label} is required`;
    };
    req("title", "Title");
    req("firstName", "First name");
    req("lastName", "Last name");
    req("maritalStatus", "Marital status");
    req("dateOfBirth", "Date of birth");
    req("gender", "Gender");
    req("residentialAddress", "Residential address");
    req("cityTown", "City / Town");
    req("lga", "LGA");
    req("state", "State");
    req("phone", "Phone number");
    req("kinFirstName", "Next of kin first name");
    req("kinLastName", "Next of kin last name");
    req("kinAddress", "Next of kin address");
    req("kinPhone", "Next of kin phone");
    if (!form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email is required";
    if (!form.agreedToTerms)
      e.agreedToTerms = "You must agree to the terms and conditions";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstKey = Object.keys(errs)[0];
      document
        .getElementById(`field-${firstKey}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${BASE}/api/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estateName, estateId, totalAmount, ...form }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to submit subscription.");
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Terms overlay — sits above subscribe modal */}
          <AnimatePresence>
            {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9991] flex items-center justify-center p-4"
            style={{
              background: "rgba(8,4,20,0.78)",
              backdropFilter: "blur(12px)",
            }}
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              style={{
                background: "#fff",
                maxHeight: "92vh",
                boxShadow:
                  "0 40px 100px rgba(112,12,235,0.2), 0 0 0 1px rgba(112,12,235,0.08)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header ── */}
              <div
                className="relative px-8 py-7 shrink-0 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg,#3F0C91,#700CEB)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 160,
                    height: 160,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "50%",
                  }}
                />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowUpRight
                        size={13}
                        style={{ color: "rgba(255,255,255,0.65)" }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.6)",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        Subscribe
                      </span>
                    </div>
                    <h2
                      style={{
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: 900,
                        letterSpacing: "-0.03em",
                        maxWidth: 320,
                      }}
                      className="truncate"
                    >
                      {estateName || "Estate Subscription"}
                    </h2>
                    {basePrice > 0 && (
                      <p
                        style={{
                          color: "rgba(239,194,255,0.8)",
                          fontSize: 13,
                          marginTop: 3,
                          fontWeight: 600,
                        }}
                      >
                        From {formatCurrency(basePrice)} per plot
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="overflow-y-auto flex-1">
                {submitted ? (
                  <SuccessScreen
                    data={{ ...form, estateName }}
                    totalAmount={totalAmount}
                    onClose={onClose}
                  />
                ) : (
                  <form onSubmit={handleSubmit} className="p-8">
                    {/* API Error */}
                    {apiError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
                        style={{
                          background: "rgba(220,38,38,0.08)",
                          border: "1px solid rgba(220,38,38,0.2)",
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
                          }}
                        >
                          {apiError}
                        </p>
                      </motion.div>
                    )}

                    {/* Estate read-only */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
                      style={{
                        background: "rgba(112,12,235,0.05)",
                        border: "1px solid rgba(112,12,235,0.12)",
                      }}
                    >
                      <Building2
                        size={15}
                        style={{ color: "#700CEB", flexShrink: 0 }}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: 10,
                            color: "#9ca3af",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          Estate
                        </p>
                        <p
                          style={{
                            fontSize: 14,
                            color: "#0f0a1e",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {estateName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* ── PERSONAL INFO ── */}
                      <SectionHeader icon={User}>
                        Personal Information
                      </SectionHeader>

                      {/* Title — tick boxes */}
                      <div className="col-span-2">
                        <label
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: errors.title ? "#dc2626" : "#6b7280",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: 9,
                          }}
                        >
                          Title <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div className="flex flex-wrap gap-2" id="field-title">
                          {TITLES.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => set("title", t)}
                              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                              style={{
                                background:
                                  form.title === t ? "#700CEB" : "#f3f4f6",
                                color: form.title === t ? "#fff" : "#374151",
                                border:
                                  form.title === t
                                    ? "1.5px solid #700CEB"
                                    : "1.5px solid transparent",
                                boxShadow:
                                  form.title === t
                                    ? "0 4px 14px rgba(112,12,235,0.3)"
                                    : "none",
                              }}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        {errors.title && (
                          <p
                            style={{
                              fontSize: 11,
                              color: "#dc2626",
                              marginTop: 5,
                              fontWeight: 500,
                            }}
                          >
                            {errors.title}
                          </p>
                        )}
                      </div>

                      {/* First Name */}
                      <Field
                        label="First Name"
                        required
                        error={errors.firstName}
                      >
                        <input
                          id="field-firstName"
                          value={form.firstName}
                          onChange={(e) => set("firstName", e.target.value)}
                          placeholder="John"
                          style={inp(errors.firstName)}
                        />
                      </Field>

                      {/* Last Name */}
                      <Field label="Last Name" required error={errors.lastName}>
                        <input
                          id="field-lastName"
                          value={form.lastName}
                          onChange={(e) => set("lastName", e.target.value)}
                          placeholder="Doe"
                          style={inp(errors.lastName)}
                        />
                      </Field>

                      {/* Date of Birth */}
                      <Field
                        label="Date of Birth"
                        required
                        error={errors.dateOfBirth}
                      >
                        <input
                          id="field-dateOfBirth"
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(e) => set("dateOfBirth", e.target.value)}
                          max={
                            new Date(
                              Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000,
                            )
                              .toISOString()
                              .split("T")[0]
                          }
                          style={inp(errors.dateOfBirth)}
                        />
                      </Field>

                      {/* Gender */}
                      <Field label="Gender" required error={errors.gender}>
                        <div className="relative">
                          <select
                            id="field-gender"
                            value={form.gender}
                            onChange={(e) => set("gender", e.target.value)}
                            style={sel(errors.gender)}
                          >
                            <option value="">Select gender</option>
                            {GENDERS.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={13}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "#9ca3af" }}
                          />
                        </div>
                      </Field>

                      {/* Marital Status */}
                      <Field
                        label="Marital Status"
                        required
                        error={errors.maritalStatus}
                      >
                        <div className="relative">
                          <select
                            id="field-maritalStatus"
                            value={form.maritalStatus}
                            onChange={(e) =>
                              set("maritalStatus", e.target.value)
                            }
                            style={sel(errors.maritalStatus)}
                          >
                            <option value="">Select status</option>
                            {MARITAL.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={13}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "#9ca3af" }}
                          />
                        </div>
                      </Field>

                      {/* Spouse — conditionally shown */}
                      {form.maritalStatus === "Married" && (
                        <>
                          <Field
                            label="Spouse First Name"
                            error={errors.spouseFirstName}
                          >
                            <input
                              value={form.spouseFirstName}
                              onChange={(e) =>
                                set("spouseFirstName", e.target.value)
                              }
                              placeholder="Spouse first name"
                              style={inp(errors.spouseFirstName)}
                            />
                          </Field>
                          <Field
                            label="Spouse Last Name"
                            error={errors.spouseLastName}
                          >
                            <input
                              value={form.spouseLastName}
                              onChange={(e) =>
                                set("spouseLastName", e.target.value)
                              }
                              placeholder="Spouse last name"
                              style={inp(errors.spouseLastName)}
                            />
                          </Field>
                        </>
                      )}

                      {/* Nationality */}
                      <Field label="Nationality" error={errors.nationality}>
                        <div className="relative">
                          <select
                            value={form.nationality}
                            onChange={(e) => set("nationality", e.target.value)}
                            style={sel(errors.nationality)}
                          >
                            {NATIONALITIES.map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={13}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "#9ca3af" }}
                          />
                        </div>
                      </Field>

                      {/* Employer */}
                      <Field
                        label="Employer's Name"
                        error={errors.employerName}
                      >
                        <input
                          value={form.employerName}
                          onChange={(e) => set("employerName", e.target.value)}
                          placeholder="Company / Business name"
                          style={inp(errors.employerName)}
                        />
                      </Field>

                      {/* ── CONTACT & ADDRESS ── */}
                      <SectionHeader icon={MapPin}>
                        Contact & Address
                      </SectionHeader>

                      <div className="col-span-2">
                        <Field
                          label="Residential Address"
                          required
                          error={errors.residentialAddress}
                        >
                          <input
                            id="field-residentialAddress"
                            value={form.residentialAddress}
                            onChange={(e) =>
                              set("residentialAddress", e.target.value)
                            }
                            placeholder="Full residential address"
                            style={inp(errors.residentialAddress)}
                          />
                        </Field>
                      </div>

                      <Field
                        label="City / Town"
                        required
                        error={errors.cityTown}
                      >
                        <input
                          id="field-cityTown"
                          value={form.cityTown}
                          onChange={(e) => set("cityTown", e.target.value)}
                          placeholder="City or town"
                          style={inp(errors.cityTown)}
                        />
                      </Field>

                      <Field label="LGA" required error={errors.lga}>
                        <input
                          id="field-lga"
                          value={form.lga}
                          onChange={(e) => set("lga", e.target.value)}
                          placeholder="Local Govt. Area"
                          style={inp(errors.lga)}
                        />
                      </Field>

                      <Field label="State" required error={errors.state}>
                        <div className="relative">
                          <select
                            id="field-state"
                            value={form.state}
                            onChange={(e) => set("state", e.target.value)}
                            style={sel(errors.state)}
                          >
                            <option value="">Select state</option>
                            {NIGERIAN_STATES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={13}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "#9ca3af" }}
                          />
                        </div>
                      </Field>

                      <Field
                        label="Country of Residence"
                        error={errors.countryOfResidence}
                      >
                        <div className="relative">
                          <select
                            value={form.countryOfResidence}
                            onChange={(e) =>
                              set("countryOfResidence", e.target.value)
                            }
                            style={sel(errors.countryOfResidence)}
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={13}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "#9ca3af" }}
                          />
                        </div>
                      </Field>

                      <Field label="Phone Number" required error={errors.phone}>
                        <input
                          id="field-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          placeholder="+234 800 000 0000"
                          style={inp(errors.phone)}
                        />
                      </Field>

                      <Field
                        label="Email Address"
                        required
                        error={errors.email}
                      >
                        <input
                          id="field-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          placeholder="you@example.com"
                          style={inp(errors.email)}
                        />
                      </Field>

                      {/* ── SUBSCRIPTION DETAILS ── */}
                      <SectionHeader icon={FileText}>
                        Subscription Details
                      </SectionHeader>

                      {/* Plot Type */}
                      <div className="col-span-2">
                        <label
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#6b7280",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: 9,
                          }}
                        >
                          Type of Plot
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {PLOT_TYPES.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => set("plotType", t)}
                              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                              style={{
                                background:
                                  form.plotType === t ? "#700CEB" : "#f3f4f6",
                                color: form.plotType === t ? "#fff" : "#374151",
                                border:
                                  form.plotType === t
                                    ? "1.5px solid #700CEB"
                                    : "1.5px solid transparent",
                                boxShadow:
                                  form.plotType === t
                                    ? "0 4px 14px rgba(112,12,235,0.3)"
                                    : "none",
                              }}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Plot Size */}
                      <div className="col-span-2">
                        <label
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#6b7280",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: 9,
                          }}
                        >
                          Plot Size
                          {form.plotSize === "Corner Piece" && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: "#ea580c",
                                fontWeight: 700,
                                textTransform: "none",
                                fontSize: 11,
                              }}
                            >
                              +10% corner piece premium applies
                            </span>
                          )}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {PLOT_SIZES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => set("plotSize", s)}
                              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                              style={{
                                background:
                                  form.plotSize === s
                                    ? s === "Corner Piece"
                                      ? "#ea580c"
                                      : "#700CEB"
                                    : "#f3f4f6",
                                color: form.plotSize === s ? "#fff" : "#374151",
                                border:
                                  form.plotSize === s
                                    ? `1.5px solid ${s === "Corner Piece" ? "#ea580c" : "#700CEB"}`
                                    : "1.5px solid transparent",
                                boxShadow:
                                  form.plotSize === s
                                    ? `0 4px 14px ${s === "Corner Piece" ? "rgba(234,88,12,0.3)" : "rgba(112,12,235,0.3)"}`
                                    : "none",
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Payment Plan */}
                      <div className="col-span-2">
                        <label
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#6b7280",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: 9,
                          }}
                        >
                          Payment Plan
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {PAYMENT_PLANS.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => set("paymentPlan", p)}
                              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                              style={{
                                background:
                                  form.paymentPlan === p
                                    ? "#700CEB"
                                    : "#f3f4f6",
                                color:
                                  form.paymentPlan === p ? "#fff" : "#374151",
                                border:
                                  form.paymentPlan === p
                                    ? "1.5px solid #700CEB"
                                    : "1.5px solid transparent",
                                boxShadow:
                                  form.paymentPlan === p
                                    ? "0 4px 14px rgba(112,12,235,0.3)"
                                    : "none",
                              }}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Number of Plots */}
                      <Field
                        label="Number of Plots"
                        error={errors.numberOfPlots}
                      >
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={form.numberOfPlots}
                          onChange={(e) =>
                            set(
                              "numberOfPlots",
                              Math.max(1, Number(e.target.value)),
                            )
                          }
                          style={inp(errors.numberOfPlots)}
                        />
                      </Field>

                      {/* Survey Type */}
                      <Field label="Survey Type" error={errors.surveyType}>
                        <div className="relative">
                          <select
                            value={form.surveyType}
                            onChange={(e) => set("surveyType", e.target.value)}
                            style={sel(errors.surveyType)}
                          >
                            {SURVEY_TYPES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={13}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "#9ca3af" }}
                          />
                        </div>
                      </Field>

                      {/* Total Amount Payable */}
                      <div className="col-span-2">
                        <div
                          className="rounded-2xl p-5"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(112,12,235,0.06), rgba(112,12,235,0.02))",
                            border: "1.5px solid rgba(112,12,235,0.15)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                style={{
                                  fontSize: 11,
                                  color: "#9ca3af",
                                  fontWeight: 700,
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase",
                                  marginBottom: 4,
                                }}
                              >
                                Total Amount Payable
                              </p>
                              <p
                                style={{
                                  fontSize: 24,
                                  fontWeight: 900,
                                  color: "#700CEB",
                                  letterSpacing: "-0.05em",
                                }}
                              >
                                {basePrice > 0
                                  ? formatCurrency(totalAmount)
                                  : "—"}
                              </p>
                              {form.plotSize === "Corner Piece" &&
                                basePrice > 0 && (
                                  <p
                                    style={{
                                      fontSize: 11,
                                      color: "#ea580c",
                                      fontWeight: 600,
                                      marginTop: 3,
                                    }}
                                  >
                                    Includes 10% corner piece premium
                                  </p>
                                )}
                            </div>
                            <div className="text-right">
                              <p
                                style={{
                                  fontSize: 11,
                                  color: "#9ca3af",
                                  fontWeight: 600,
                                }}
                              >
                                {form.numberOfPlots} plot
                                {form.numberOfPlots > 1 ? "s" : ""} ×{" "}
                                {form.plotSize}
                              </p>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "#6b7280",
                                  marginTop: 2,
                                  fontWeight: 600,
                                }}
                              >
                                {form.paymentPlan}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── NEXT OF KIN ── */}
                      <SectionHeader icon={Users}>Next of Kin</SectionHeader>

                      <Field
                        label="First Name"
                        required
                        error={errors.kinFirstName}
                      >
                        <input
                          id="field-kinFirstName"
                          value={form.kinFirstName}
                          onChange={(e) => set("kinFirstName", e.target.value)}
                          placeholder="Next of kin first name"
                          style={inp(errors.kinFirstName)}
                        />
                      </Field>

                      <Field
                        label="Last Name"
                        required
                        error={errors.kinLastName}
                      >
                        <input
                          id="field-kinLastName"
                          value={form.kinLastName}
                          onChange={(e) => set("kinLastName", e.target.value)}
                          placeholder="Next of kin last name"
                          style={inp(errors.kinLastName)}
                        />
                      </Field>

                      <div className="col-span-2">
                        <Field
                          label="Residential Address"
                          required
                          error={errors.kinAddress}
                        >
                          <input
                            id="field-kinAddress"
                            value={form.kinAddress}
                            onChange={(e) => set("kinAddress", e.target.value)}
                            placeholder="Next of kin full address"
                            style={inp(errors.kinAddress)}
                          />
                        </Field>
                      </div>

                      <Field label="City / Town" error={errors.kinCity}>
                        <input
                          value={form.kinCity}
                          onChange={(e) => set("kinCity", e.target.value)}
                          placeholder="City or town"
                          style={inp(errors.kinCity)}
                        />
                      </Field>

                      <Field label="LGA" error={errors.kinLga}>
                        <input
                          value={form.kinLga}
                          onChange={(e) => set("kinLga", e.target.value)}
                          placeholder="Local Govt. Area"
                          style={inp(errors.kinLga)}
                        />
                      </Field>

                      <Field
                        label="Phone Number"
                        required
                        error={errors.kinPhone}
                      >
                        <input
                          id="field-kinPhone"
                          type="tel"
                          value={form.kinPhone}
                          onChange={(e) => set("kinPhone", e.target.value)}
                          placeholder="Next of kin phone"
                          style={inp(errors.kinPhone)}
                        />
                      </Field>

                      {/* ── TERMS ── */}
                      <div className="col-span-2 mt-2">
                        <div
                          className="flex items-start gap-3 p-4 rounded-2xl"
                          style={{
                            background: errors.agreedToTerms
                              ? "rgba(220,38,38,0.04)"
                              : "rgba(112,12,235,0.04)",
                            border: `1.5px solid ${errors.agreedToTerms ? "rgba(220,38,38,0.3)" : "rgba(112,12,235,0.12)"}`,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              set("agreedToTerms", !form.agreedToTerms)
                            }
                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all"
                            style={{
                              background: form.agreedToTerms
                                ? "#700CEB"
                                : "#fff",
                              border: `2px solid ${form.agreedToTerms ? "#700CEB" : "rgba(112,12,235,0.3)"}`,
                              boxShadow: form.agreedToTerms
                                ? "0 2px 8px rgba(112,12,235,0.3)"
                                : "none",
                            }}
                          >
                            {form.agreedToTerms && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                width="11"
                                height="9"
                                viewBox="0 0 11 9"
                                fill="none"
                              >
                                <path
                                  d="M1 4L4 7.5L10 1"
                                  stroke="#fff"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </motion.svg>
                            )}
                          </button>
                          <p
                            style={{
                              fontSize: 13,
                              color: "#4b5563",
                              lineHeight: 1.6,
                            }}
                          >
                            I have read and agree to the{" "}
                            <button
                              type="button"
                              onClick={() => setShowTerms(true)}
                              style={{
                                color: "#700CEB",
                                fontWeight: 700,
                                textDecoration: "underline",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              Terms and Conditions
                            </button>{" "}
                            of this subscription. I confirm that all information
                            provided is accurate and complete.
                          </p>
                        </div>
                        {errors.agreedToTerms && (
                          <p
                            style={{
                              fontSize: 11,
                              color: "#dc2626",
                              marginTop: 5,
                              fontWeight: 500,
                            }}
                          >
                            {errors.agreedToTerms}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* end grid */}

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-8"
                      style={{
                        background: loading
                          ? "rgba(112,12,235,0.5)"
                          : "linear-gradient(135deg,#700CEB,#8A2FF0)",
                        color: "#fff",
                        fontSize: 15,
                        letterSpacing: "-0.01em",
                        boxShadow: loading
                          ? "none"
                          : "0 8px 28px rgba(112,12,235,0.38)",
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />{" "}
                          Submitting...
                        </>
                      ) : (
                        <>
                          <ArrowUpRight size={17} /> Submit Subscription
                        </>
                      )}
                    </motion.button>

                    <p
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        textAlign: "center",
                        marginTop: 12,
                      }}
                    >
                      Our team will contact you within 24 hours to complete your
                      subscription
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
