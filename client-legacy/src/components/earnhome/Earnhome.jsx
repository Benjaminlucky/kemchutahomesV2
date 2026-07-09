import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Shield,
  Banknote,
  BarChart3,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Brand ──────────────────────────────────────────────────────────────────────
const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const PURPLE_MID = "#8A2FF0";

// ── Duration config ────────────────────────────────────────────────────────────
const DURATIONS = [
  {
    key: "6 Months",
    label: "6 Mo",
    roiKey: "roiPercent6Months",
    desc: "Short-term",
  },
  {
    key: "12 Months",
    label: "12 Mo",
    roiKey: "roiPercent12Months",
    desc: "Mid-term",
  },
  {
    key: "18 Months",
    label: "18 Mo",
    roiKey: "roiPercent18Months",
    desc: "Maximum yield",
  },
];

// ── Feature list (right panel) ─────────────────────────────────────────────────
const FEATURES = [
  { icon: Shield, text: "No inspection required — purely investment" },
  { icon: Banknote, text: "Buy at today's market price, sell at profit" },
  { icon: BarChart3, text: "Guaranteed capital + ROI at maturity" },
  { icon: Clock, text: "Choose 6 months, 1 year, or 18 months" },
];

// ── ROI skeleton ───────────────────────────────────────────────────────────────
function ROISkeleton() {
  return (
    <div className="flex gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex-1 rounded-2xl animate-pulse"
          style={{ height: 90, background: "rgba(255,255,255,0.06)" }}
        />
      ))}
    </div>
  );
}

// ── Animated ROI number ────────────────────────────────────────────────────────
function ROINumber({ value }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "inline-block" }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

// ── Floating stat badge ────────────────────────────────────────────────────────
function FloatBadge({ top, right, bottom, left, label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute",
        top,
        right,
        bottom,
        left,
        background: "rgba(255,255,255,0.97)",
        borderRadius: 14,
        padding: "10px 14px",
        boxShadow: "0 12px 40px rgba(112,12,235,0.2)",
        backdropFilter: "blur(12px)",
        zIndex: 10,
        minWidth: 110,
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#9ca3af",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: PURPLE,
          letterSpacing: "-0.04em",
          margin: "2px 0 0",
        }}
      >
        {value}
      </p>
    </motion.div>
  );
}

// ── Input field ────────────────────────────────────────────────────────────────
function FormField({ label, error, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          style={{
            fontSize: 11,
            color: "#fca5a5",
            fontWeight: 500,
            marginTop: 4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function Earnhome() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  // ── All original state — unchanged ────────────────────────────────────────
  const navigate = useNavigate();
  const [roi, setRoi] = useState(null);
  const [roiLoading, setRoiLoad] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    duration: "12 Months",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Fetch live ROI — unchanged ────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE_URL}/api/buy2sell/roi`)
      .then((r) => r.json())
      .then(setRoi)
      .catch(() => null)
      .finally(() => setRoiLoad(false));
  }, []);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const currentROI = () => {
    if (!roi) return null;
    const dur = DURATIONS.find((d) => d.key === form.duration);
    return dur ? roi[dur.roiKey] : null;
  };

  // ── Validation — unchanged ────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRx = /^(\+234|0)[789][01]\d{8}$/;
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!emailRx.test(form.email)) e.email = "Enter a valid email address";
    if (!phoneRx.test(form.phone))
      e.phone = "Enter a valid Nigerian phone number";
    return e;
  };

  // ── Submit — unchanged ────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    // Redirect to the full Buy2Sell investment flow, pre-filling any entered data
    const params = new URLSearchParams({ duration: form.duration });
    if (form.fullName.trim()) params.set("fullName", form.fullName.trim());
    if (form.email.trim()) params.set("email", form.email.trim());
    if (form.phone.trim()) params.set("phone", form.phone.trim());
    navigate(`/buy2sell?${params.toString()}`);
  };

  const roiNow = currentROI();

  // ── Shared animation helpers ───────────────────────────────────────────────
  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
    },
  });

  const inputStyle = (hasErr) => ({
    width: "100%",
    padding: "13px 16px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    color: "#fff",
    background: hasErr ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.08)",
    border: `1.5px solid ${hasErr ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}`,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s, background 0.2s",
  });

  return (
    <section
      ref={ref}
      className="earn__section w-full relative overflow-hidden"
      style={{
        background: `linear-gradient(160deg, #0d0120 0%, ${PURPLE_DARK} 45%, #0d0120 100%)`,
      }}
    >
      {/* ── Background decoration ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "rgba(112,12,235,0.12)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-8%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(63,12,145,0.15)",
          filter: "blur:100px",
          pointerEvents: "none",
        }}
      />
      {/* Grid texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.4,
        }}
      />

      <div className="earn__wrapper w-11/12 md:w-10/12 mx-auto py-20 md:py-32 relative z-10">
        {/* ── Section badge ───────────────────────────────────────────────── */}
        <motion.div
          className="flex justify-center mb-10"
          variants={fadeUp(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{
              background: "rgba(112,12,235,0.25)",
              border: "1px solid rgba(112,12,235,0.45)",
              color: "#c084fc",
            }}
          >
            <TrendingUp size={12} />
            Buy2Sell Land Bank Scheme
          </div>
        </motion.div>

        {/* ── Main headline ───────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-14 md:mb-20"
          variants={fadeUp(0.08)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <h2
            className="font-black uppercase text-white"
            style={{
              fontSize: "clamp(2rem, 6vw, 5rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            Earn Up To{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {roiLoading ? (
                "..."
              ) : (
                <ROINumber value={`${roi?.roiPercent18Months ?? 100}%`} />
              )}
            </span>{" "}
            ROI
          </h2>
          <p
            className="text-gray-400 mt-4 mx-auto"
            style={{ maxWidth: 500, fontSize: "clamp(1rem, 1.8vw, 1.2rem)" }}
          >
            The ultimate real estate land bank investment in Nigeria — your
            capital works while you wait
          </p>
        </motion.div>

        {/* ── Two column content ──────────────────────────────────────────── */}
        <div className="earn__content grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* ────────────────────────────────────────────────────────────────
              LEFT — Duration picker + form
          ──────────────────────────────────────────────────────────────── */}
          <motion.div
            variants={fadeUp(0.15)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {/* Glass card wraps the entire left panel */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 24,
                padding: "32px 28px",
                boxShadow:
                  "0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              {/* ── Duration picker label ─────────────────────────────── */}
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Select Investment Duration
              </p>

              {/* ── Duration cards ────────────────────────────────────── */}
              {roiLoading ? (
                <ROISkeleton />
              ) : (
                <div className="flex gap-3 mb-5">
                  {DURATIONS.map((d) => {
                    const pct = roi?.[d.roiKey] ?? "—";
                    const active = form.duration === d.key;
                    return (
                      <motion.button
                        key={d.key}
                        type="button"
                        onClick={() => set("duration", d.key)}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ y: -2 }}
                        style={{
                          flex: 1,
                          padding: "14px 8px",
                          borderRadius: 16,
                          border: `1.5px solid ${active ? PURPLE : "rgba(255,255,255,0.08)"}`,
                          background: active
                            ? `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`
                            : "rgba(255,255,255,0.04)",
                          boxShadow: active
                            ? `0 8px 24px rgba(112,12,235,0.4)`
                            : "none",
                          transition: "all 0.25s ease",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: active
                              ? "rgba(255,255,255,0.7)"
                              : "rgba(255,255,255,0.35)",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          {d.desc}
                        </p>
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: active
                              ? "rgba(255,255,255,0.6)"
                              : "rgba(255,255,255,0.3)",
                            marginBottom: 4,
                          }}
                        >
                          {d.key}
                        </p>
                        <p
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            lineHeight: 1,
                            color: active ? "#fff" : "rgba(255,255,255,0.55)",
                            letterSpacing: "-0.04em",
                            margin: "6px 0 2px",
                          }}
                        >
                          {roiLoading ? "—" : <ROINumber value={`${pct}%`} />}
                        </p>
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: active
                              ? "rgba(255,255,255,0.5)"
                              : "rgba(255,255,255,0.25)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          ROI
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* ── Live ROI callout ──────────────────────────────────── */}
              <AnimatePresence>
                {roiNow !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6 overflow-hidden"
                    style={{
                      background: "rgba(112,12,235,0.2)",
                      border: "1px solid rgba(112,12,235,0.35)",
                    }}
                  >
                    <TrendingUp
                      size={15}
                      style={{ color: "#c084fc", flexShrink: 0 }}
                    />
                    <p
                      style={{
                        fontSize: 13,
                        color: "#c084fc",
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      {form.duration} plan — earn{" "}
                      <span style={{ color: "#fff", fontWeight: 900 }}>
                        {roiNow}% ROI
                      </span>{" "}
                      on your capital
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Divider ───────────────────────────────────────────── */}
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                  marginBottom: 24,
                }}
              />

              {/* ── Form ──────────────────────────────────────────────── */}
              <AnimatePresence mode="wait">
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                      }}
                    >
                      <AlertTriangle
                        size={14}
                        style={{ color: "#fca5a5", flexShrink: 0 }}
                      />
                      <p
                        style={{
                          fontSize: 13,
                          color: "#fca5a5",
                          fontWeight: 500,
                          margin: 0,
                        }}
                      >
                        {apiError}
                      </p>
                    </motion.div>
                  )}

                  <FormField label="Full Name" error={errors.fullName}>
                    <input
                      type="text"
                      placeholder="e.g. Chukwuemeka Obi"
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      style={inputStyle(errors.fullName)}
                      onFocus={(e) => {
                        if (!errors.fullName)
                          e.target.style.borderColor = "rgba(112,12,235,0.6)";
                      }}
                      onBlur={(e) => {
                        if (!errors.fullName)
                          e.target.style.borderColor = "rgba(255,255,255,0.12)";
                      }}
                    />
                  </FormField>

                  <FormField label="Email Address" error={errors.email}>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      style={inputStyle(errors.email)}
                      onFocus={(e) => {
                        if (!errors.email)
                          e.target.style.borderColor = "rgba(112,12,235,0.6)";
                      }}
                      onBlur={(e) => {
                        if (!errors.email)
                          e.target.style.borderColor = "rgba(255,255,255,0.12)";
                      }}
                    />
                  </FormField>

                  <FormField label="Mobile Number" error={errors.phone}>
                    <input
                      type="tel"
                      placeholder="08012345678"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      style={inputStyle(errors.phone)}
                      onFocus={(e) => {
                        if (!errors.phone)
                          e.target.style.borderColor = "rgba(112,12,235,0.6)";
                      }}
                      onBlur={(e) => {
                        if (!errors.phone)
                          e.target.style.borderColor = "rgba(255,255,255,0.12)";
                      }}
                    />
                  </FormField>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{
                      boxShadow: "0 16px 48px rgba(112,12,235,0.55)",
                    }}
                    className="w-full flex items-center justify-center gap-2 font-bold text-white"
                    style={{
                      padding: "15px 24px",
                      borderRadius: 14,
                      fontSize: 15,
                      letterSpacing: "-0.01em",
                      background: loading
                        ? "rgba(112,12,235,0.4)"
                        : `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE}, ${PURPLE_MID})`,
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      boxShadow: loading
                        ? "none"
                        : "0 8px 28px rgba(112,12,235,0.4)",
                      transition: "box-shadow 0.3s",
                      marginTop: 8,
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />{" "}
                        Submitting…
                      </>
                    ) : (
                      <>
                        Start Investing Now <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>

                  <p
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.3)",
                      textAlign: "center",
                      margin: "4px 0 0",
                    }}
                  >
                    Our team responds within 24 hours · No commitment required
                  </p>
                </motion.form>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ────────────────────────────────────────────────────────────────
              RIGHT — Image + description + features
          ──────────────────────────────────────────────────────────────── */}
          <motion.div
            className="right w-full"
            variants={fadeUp(0.25)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {/* Image with floating badges */}
            <div style={{ position: "relative", marginBottom: 32 }}>
              {/* Floating badges */}
              <FloatBadge
                top={-16}
                right={-12}
                label="Avg. Return"
                value="65% ROI"
                delay={0.6}
              />
              <FloatBadge
                bottom={-16}
                left={-12}
                label="Min. Entry"
                value="₦500K"
                delay={0.75}
              />

              {/* Glow behind image */}
              <div
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: 28,
                  background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
                  opacity: 0.25,
                  filter: "blur(24px)",
                  zIndex: 0,
                }}
              />

              <div
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
                }}
              >
                <img
                  src="./assets/Buy2Sell.jpg"
                  alt="Buy2Sell Land Bank Scheme"
                  className="w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  style={{ display: "block", aspectRatio: "4/3" }}
                />
                {/* Image overlay for depth */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(13,1,32,0.6) 0%, transparent 50%)",
                    pointerEvents: "none",
                  }}
                />
                {/* Bottom label on image */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    right: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 8,
                      padding: "6px 12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: "#fff",
                        fontWeight: 700,
                        margin: 0,
                        letterSpacing: "0.05em",
                      }}
                    >
                      KEMCHUTA LAND BANK
                    </p>
                  </div>
                  <div
                    style={{
                      background: "rgba(112,12,235,0.8)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 8,
                      padding: "6px 12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: "#fff",
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      ✓ Govt. Approved
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <motion.div
              variants={fadeUp(0.35)}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 16,
                  lineHeight: 1.8,
                  marginBottom: 28,
                }}
              >
                The Buy2Sell land bank scheme is the most convenient way to park
                capital in a tangible asset while watching your equity grow. Buy
                at today's price, hold for your chosen duration, then receive
                your capital plus guaranteed ROI — no need to inspect or develop
                the land.
              </p>
            </motion.div>

            {/* Feature list */}
            <motion.div
              className="space-y-4"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  variants={fadeUp(0.4 + i * 0.08)}
                  className="flex items-center gap-4"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    padding: "14px 18px",
                  }}
                >
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: `rgba(112,12,235,0.25)`,
                      border: "1px solid rgba(112,12,235,0.35)",
                    }}
                  >
                    <Icon size={16} style={{ color: "#c084fc" }} />
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.8)",
                      fontWeight: 500,
                    }}
                  >
                    {text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Process steps */}
            <motion.div
              className="mt-8 pt-8"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              variants={fadeUp(0.7)}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                How it works
              </p>
              <div className="flex items-center gap-0">
                {[
                  "Choose Duration",
                  "Pay & Register",
                  "Hold & Earn",
                  "Receive Payout",
                ].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="text-center" style={{ flex: 1 }}>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mx-auto mb-2"
                        style={{
                          background:
                            i === 0
                              ? `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`
                              : "rgba(255,255,255,0.08)",
                          color: i === 0 ? "#fff" : "rgba(255,255,255,0.4)",
                          border: `1px solid ${i === 0 ? PURPLE : "rgba(255,255,255,0.1)"}`,
                        }}
                      >
                        {i + 1}
                      </div>
                      <p
                        style={{
                          fontSize: 9,
                          color: "rgba(255,255,255,0.4)",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          lineHeight: 1.3,
                        }}
                      >
                        {step}
                      </p>
                    </div>
                    {i < 3 && (
                      <div
                        style={{
                          flex: "0 0 auto",
                          width: 20,
                          height: 1,
                          background: "rgba(255,255,255,0.1)",
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Earnhome;
