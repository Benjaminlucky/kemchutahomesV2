import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Shield,
  Lock,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Brand constants ───────────────────────────────────────────────────────────
const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const PURPLE_MID = "#8A2FF0";

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return [
    null,
    { label: "Weak", pct: 25, color: "#ef4444" },
    { label: "Fair", pct: 50, color: "#f59e0b" },
    { label: "Good", pct: 75, color: "#3b82f6" },
    { label: "Strong", pct: 100, color: "#22c55e" },
  ][s];
}

// ── Animated floating background blobs ───────────────────────────────────────
function Blob({ style }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ filter: "blur(80px)", ...style }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -25, 15, 0],
        scale: [1, 1.08, 0.96, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        ...style.transition,
      }}
    />
  );
}

// ── Feature pill ──────────────────────────────────────────────────────────────
function Feature({ icon: Icon, text }) {
  return (
    <motion.div
      className="flex items-center gap-2.5 text-sm"
      style={{ color: "rgba(255,255,255,0.75)" }}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.15)" }}
      >
        <Icon size={11} color="white" />
      </div>
      {text}
    </motion.div>
  );
}

// ── Floating property card (decorative) ───────────────────────────────────────
function FloatingCard({ style, delay, estateName, price, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      style={{
        position: "absolute",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 16,
        padding: "12px 16px",
        minWidth: 160,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {badge}
          </p>
          <p
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              margin: "3px 0 0",
              letterSpacing: "-0.02em",
            }}
          >
            {estateName}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, margin: 0 }}>
            from
          </p>
          <p
            style={{ color: "#fff", fontWeight: 800, fontSize: 12, margin: 0 }}
          >
            {price}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Input field ───────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#6b7280",
        }}
      >
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            style={{
              color: "#ef4444",
              fontSize: 11,
              fontWeight: 500,
              margin: 0,
            }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputStyle = (hasErr) => ({
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
  color: "#0f0a1e",
  background: hasErr ? "rgba(239,68,68,0.04)" : "#f9f9fb",
  border: `1.5px solid ${hasErr ? "#fca5a5" : "rgba(112,12,235,0.15)"}`,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
});

// ── Step tracker ──────────────────────────────────────────────────────────────
const STEPS = ["Personal", "Security", "Done"];

function StepDot({ idx, current }) {
  const done = idx < current;
  const active = idx === current;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 12,
          transition: "all 0.3s",
          background: done
            ? PURPLE
            : active
              ? "white"
              : "rgba(255,255,255,0.15)",
          border: active ? `2px solid ${PURPLE}` : "2px solid transparent",
          color: done ? "#fff" : active ? PURPLE : "rgba(255,255,255,0.5)",
        }}
      >
        {done ? <Check size={13} /> : idx + 1}
      </div>
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
        }}
      >
        {STEPS[idx]}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ClientSignup() {
  const [step, setStep] = useState(0); // 0 = personal info, 1 = password
  // Pre-fill from URL params (passed from Buy2SellPage after submission)
  const _params = new URLSearchParams(window.location.search);
  const _redirect = _params.get("redirect") || "/client/portal/investments";

  const [formData, setFormData] = useState({
    firstName: _params.get("firstName") || "",
    lastName: _params.get("lastName") || "",
    email: _params.get("email") || "",
    phone: _params.get("phone") || "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState(null);

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const passwordRef = useRef(null);

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const set = (field, value) => {
    setFormData((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const strength = getStrength(formData.password);

  // Step 0 validation
  const validateStep0 = () => {
    const e = {};
    const phoneRx = /^(\+234|0)[789][01]\d{8}$/;
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.firstName.trim()) e.firstName = "Required";
    if (!formData.lastName.trim()) e.lastName = "Required";
    if (!emailRx.test(formData.email)) e.email = "Enter a valid email";
    if (!phoneRx.test(formData.phone))
      e.phone = "Enter a valid Nigerian phone number";
    return e;
  };

  // Step 1 validation
  const validateStep1 = () => {
    const e = {};
    if (formData.password.length < 8)
      e.password = "Must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords don't match";
    return e;
  };

  const handleNext = () => {
    const errs = validateStep0();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStep(1);
    // Small delay so step transition finishes before scrolling
    setTimeout(() => passwordRef.current?.focus(), 350);
  };

  const handleSubmit = async () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/clients/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      if (data.token && data.user) {
        localStorage.setItem("clientToken", data.token);
        localStorage.setItem("clientUser", JSON.stringify(data.user));
      }

      setStep(2);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = _redirect;
      }, 1500);
    } catch (err) {
      setErrors({
        general: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.9, ease: "easeOut" },
    },
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir * 40, opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: (dir) => ({
      x: dir * -40,
      opacity: 0,
      transition: { duration: 0.25 },
    }),
  };

  return (
    <div
      ref={ref}
      style={{
        minHeight: "100vh",
        background: "#f4f2fa",
        fontFamily: "'Poppins', sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Page-level background blobs */}
      <Blob
        style={{
          width: 600,
          height: 600,
          background: "rgba(112,12,235,0.08)",
          top: "-20%",
          left: "-15%",
          transition: {},
        }}
      />
      <Blob
        style={{
          width: 400,
          height: 400,
          background: "rgba(138,47,240,0.06)",
          bottom: "-10%",
          right: "-10%",
          transition: { delay: 3 },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        {/* Single flex row — column on mobile, row on desktop */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            flex: 1,
            minHeight: "100vh",
          }}
        >
          {/* Left — hidden on mobile, visible md+ */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate={controls}
            style={{
              background: `linear-gradient(145deg, ${PURPLE_DARK} 0%, ${PURPLE} 55%, ${PURPLE_MID} 100%)`,
              padding: isMobile ? "32px 24px" : "48px 44px",
              position: "relative",
              overflow: "hidden",
              flex: isMobile ? "0 0 auto" : "0 0 45%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <BrandPanel step={step} isMobile={isMobile} />
          </motion.div>

          {/* Right — form */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: 40, filter: "blur(8px)" },
              visible: {
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
                transition: { duration: 0.9, delay: 0.25, ease: "easeOut" },
              },
            }}
            initial="hidden"
            animate={controls}
            style={{
              flex: 1,
              background: "#ffffff",
              padding: isMobile ? "24px 20px" : "40px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: isMobile ? "flex-start" : "center",
              overflowY: "auto",
              minHeight: isMobile ? "auto" : "100vh",
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: isMobile ? 16 : 32 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(112,12,235,0.06)",
                  border: "1px solid rgba(112,12,235,0.12)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: PURPLE,
                    boxShadow: `0 0 6px ${PURPLE}`,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: PURPLE,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Create Account
                </span>
              </div>

              <h2
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#0f0a1e",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.2,
                  margin: "0 0 8px",
                }}
              >
                {step === 2 ? "You're all set!" : "Join Kemchuta Homes"}
              </h2>
              <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
                {step === 2 ? (
                  "Redirecting you to your portal…"
                ) : (
                  <>
                    Already have an account?{" "}
                    <Link
                      to="/client/login"
                      style={{
                        color: PURPLE,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.textDecoration = "underline")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.textDecoration = "none")
                      }
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </p>
            </div>

            {/* Step progress — desktop only */}
            {step < 2 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                  marginBottom: 28,
                  padding: "12px 16px",
                  background:
                    "linear-gradient(135deg, rgba(112,12,235,0.06), rgba(138,47,240,0.04))",
                  borderRadius: 12,
                  border: "1px solid rgba(112,12,235,0.1)",
                }}
              >
                {[0, 1].map((i) => (
                  <React.Fragment key={i}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 800,
                          transition: "all 0.3s",
                          background:
                            i < step
                              ? PURPLE
                              : i === step
                                ? "#fff"
                                : "transparent",
                          border: `2px solid ${i <= step ? PURPLE : "rgba(112,12,235,0.2)"}`,
                          color:
                            i < step ? "#fff" : i === step ? PURPLE : "#9ca3af",
                          flexShrink: 0,
                        }}
                      >
                        {i < step ? <Check size={11} /> : i + 1}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color:
                            i === step
                              ? "#0f0a1e"
                              : i < step
                                ? PURPLE
                                : "#9ca3af",
                        }}
                      >
                        {["Your details", "Set password"][i]}
                      </span>
                    </div>
                    {i < 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: 2,
                          margin: "0 12px",
                          background:
                            step > 0 ? PURPLE : "rgba(112,12,235,0.15)",
                          borderRadius: 1,
                          transition: "background 0.4s",
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* ── Step 2: Success ───────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {step === 2 && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: "center", padding: "24px 0" }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.1,
                    }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #059669, #34d399)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 24px",
                      boxShadow: "0 12px 32px rgba(5,150,105,0.35)",
                    }}
                  >
                    <Check size={36} color="#fff" strokeWidth={3} />
                  </motion.div>

                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#0f0a1e",
                      margin: "0 0 8px",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Account Created!
                  </h3>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: 14,
                      margin: "0 0 24px",
                      lineHeight: 1.6,
                    }}
                  >
                    Welcome to Kemchuta Homes. Your client portal is ready —
                    <br />
                    redirecting you in a moment.
                  </p>

                  {/* Summary card */}
                  <div
                    style={{
                      background: "rgba(112,12,235,0.04)",
                      border: "1px solid rgba(112,12,235,0.12)",
                      borderRadius: 14,
                      padding: "16px 20px",
                      textAlign: "left",
                    }}
                  >
                    {[
                      ["Name", `${formData.firstName} ${formData.lastName}`],
                      ["Email", formData.email],
                      ["Phone", formData.phone],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: "1px solid rgba(112,12,235,0.06)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "#9ca3af",
                            fontWeight: 600,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "#0f0a1e",
                            fontWeight: 700,
                          }}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Step 0: Personal info ──────────────────────────────────── */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* Name row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <Field label="First name" error={errors.firstName}>
                        <input
                          value={formData.firstName}
                          onChange={(e) => set("firstName", e.target.value)}
                          placeholder="John"
                          style={inputStyle(errors.firstName)}
                          onFocus={(e) => {
                            setFocused("firstName");
                            if (!errors.firstName)
                              e.target.style.borderColor =
                                "rgba(112,12,235,0.5)";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(112,12,235,0.08)";
                          }}
                          onBlur={(e) => {
                            setFocused(null);
                            if (!errors.firstName)
                              e.target.style.borderColor =
                                "rgba(112,12,235,0.15)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </Field>
                      <Field label="Last name" error={errors.lastName}>
                        <input
                          value={formData.lastName}
                          onChange={(e) => set("lastName", e.target.value)}
                          placeholder="Doe"
                          style={inputStyle(errors.lastName)}
                          onFocus={(e) => {
                            if (!errors.lastName)
                              e.target.style.borderColor =
                                "rgba(112,12,235,0.5)";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(112,12,235,0.08)";
                          }}
                          onBlur={(e) => {
                            if (!errors.lastName)
                              e.target.style.borderColor =
                                "rgba(112,12,235,0.15)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </Field>
                    </div>

                    <Field label="Email address" error={errors.email}>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="john@example.com"
                        style={inputStyle(errors.email)}
                        onFocus={(e) => {
                          if (!errors.email)
                            e.target.style.borderColor = "rgba(112,12,235,0.5)";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(112,12,235,0.08)";
                        }}
                        onBlur={(e) => {
                          if (!errors.email)
                            e.target.style.borderColor =
                              "rgba(112,12,235,0.15)";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </Field>

                    <Field label="Phone number" error={errors.phone}>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="08012345678"
                        style={inputStyle(errors.phone)}
                        onFocus={(e) => {
                          if (!errors.phone)
                            e.target.style.borderColor = "rgba(112,12,235,0.5)";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(112,12,235,0.08)";
                        }}
                        onBlur={(e) => {
                          if (!errors.phone)
                            e.target.style.borderColor =
                              "rgba(112,12,235,0.15)";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </Field>

                    {errors.general && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: "rgba(239,68,68,0.07)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: "#dc2626",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {errors.general}
                      </motion.div>
                    )}

                    <motion.button
                      onClick={handleNext}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: "100%",
                        padding: "14px 0",
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE}, ${PURPLE_MID})`,
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 15,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        letterSpacing: "-0.01em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow: "0 6px 20px rgba(112,12,235,0.4)",
                        transition: "box-shadow 0.2s, transform 0.2s",
                        marginTop: 4,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 10px 28px rgba(112,12,235,0.55)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 6px 20px rgba(112,12,235,0.4)";
                      }}
                    >
                      Continue
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Password ───────────────────────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* Password */}
                    <Field label="Create password" error={errors.password}>
                      <div style={{ position: "relative" }}>
                        <input
                          ref={passwordRef}
                          type={showPass ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => set("password", e.target.value)}
                          placeholder="Min. 8 characters"
                          style={{
                            ...inputStyle(errors.password),
                            paddingRight: 42,
                          }}
                          onFocus={(e) => {
                            if (!errors.password)
                              e.target.style.borderColor =
                                "rgba(112,12,235,0.5)";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(112,12,235,0.08)";
                          }}
                          onBlur={(e) => {
                            if (!errors.password)
                              e.target.style.borderColor =
                                "rgba(112,12,235,0.15)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#9ca3af",
                            display: "flex",
                            padding: 0,
                          }}
                        >
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Strength bar */}
                      {strength && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[25, 50, 75, 100].map((t) => (
                              <div
                                key={t}
                                style={{
                                  flex: 1,
                                  height: 3,
                                  borderRadius: 2,
                                  background:
                                    strength.pct >= t
                                      ? strength.color
                                      : "rgba(0,0,0,0.08)",
                                  transition: "background 0.3s",
                                }}
                              />
                            ))}
                          </div>
                          <p
                            style={{
                              fontSize: 11,
                              color: strength.color,
                              fontWeight: 700,
                              marginTop: 4,
                            }}
                          >
                            {strength.label}
                          </p>
                        </div>
                      )}
                    </Field>

                    {/* Confirm password */}
                    <Field
                      label="Confirm password"
                      error={errors.confirmPassword}
                    >
                      <div style={{ position: "relative" }}>
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            set("confirmPassword", e.target.value)
                          }
                          placeholder="Repeat your password"
                          style={{
                            ...inputStyle(
                              errors.confirmPassword ||
                                (formData.confirmPassword &&
                                  formData.confirmPassword !==
                                    formData.password),
                            ),
                            paddingRight: 42,
                          }}
                          onFocus={(e) => {
                            if (!errors.confirmPassword)
                              e.target.style.borderColor =
                                "rgba(112,12,235,0.5)";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(112,12,235,0.08)";
                          }}
                          onBlur={(e) => {
                            if (!errors.confirmPassword)
                              e.target.style.borderColor =
                                "rgba(112,12,235,0.15)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#9ca3af",
                            display: "flex",
                            padding: 0,
                          }}
                        >
                          {showConfirm ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                        {/* Live match indicator */}
                        {formData.confirmPassword &&
                          formData.confirmPassword === formData.password && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              style={{
                                position: "absolute",
                                right: 38,
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                background: "#22c55e",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Check size={9} color="#fff" strokeWidth={3} />
                            </motion.div>
                          )}
                      </div>
                    </Field>

                    {/* Trust badges */}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        padding: "12px 14px",
                        background: "rgba(112,12,235,0.03)",
                        border: "1px solid rgba(112,12,235,0.08)",
                        borderRadius: 10,
                      }}
                    >
                      {[
                        [Shield, "256-bit encrypted"],
                        [Lock, "Data protected"],
                        [Zap, "Instant access"],
                      ].map(([Icon, label]) => (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#6b7280",
                          }}
                        >
                          <Icon size={11} color={PURPLE} />
                          {label}
                        </div>
                      ))}
                    </div>

                    {errors.general && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: "rgba(239,68,68,0.07)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 10,
                          padding: "10px 14px",
                          color: "#dc2626",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {errors.general}
                      </motion.div>
                    )}

                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      {/* Back */}
                      <motion.button
                        onClick={() => {
                          setStep(0);
                          setErrors({});
                        }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          padding: "14px 20px",
                          borderRadius: 12,
                          background: "transparent",
                          color: "#6b7280",
                          fontWeight: 700,
                          fontSize: 14,
                          border: "1.5px solid rgba(0,0,0,0.1)",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          flexShrink: 0,
                          transition: "border-color 0.2s, color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = PURPLE;
                          e.currentTarget.style.color = PURPLE;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)";
                          e.currentTarget.style.color = "#6b7280";
                        }}
                      >
                        ← Back
                      </motion.button>

                      {/* Submit */}
                      <motion.button
                        onClick={handleSubmit}
                        disabled={loading}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          flex: 1,
                          padding: "14px 0",
                          borderRadius: 12,
                          background: loading
                            ? "rgba(112,12,235,0.5)"
                            : `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE}, ${PURPLE_MID})`,
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 15,
                          border: "none",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                          letterSpacing: "-0.01em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          boxShadow: loading
                            ? "none"
                            : "0 6px 20px rgba(112,12,235,0.4)",
                          transition: "box-shadow 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (!loading)
                            e.currentTarget.style.boxShadow =
                              "0 10px 28px rgba(112,12,235,0.55)";
                        }}
                        onMouseLeave={(e) => {
                          if (!loading)
                            e.currentTarget.style.boxShadow =
                              "0 6px 20px rgba(112,12,235,0.4)";
                        }}
                      >
                        {loading ? (
                          <>
                            <span
                              style={{
                                width: 16,
                                height: 16,
                                border: "2px solid rgba(255,255,255,0.4)",
                                borderTopColor: "#fff",
                                borderRadius: "50%",
                                animation: "spin 0.7s linear infinite",
                                display: "inline-block",
                              }}
                            />
                            Creating account…
                          </>
                        ) : (
                          <>
                            Create My Portal <ArrowRight size={16} />
                          </>
                        )}
                      </motion.button>
                    </div>

                    <p
                      style={{
                        textAlign: "center",
                        fontSize: 11,
                        color: "#9ca3af",
                        margin: 0,
                      }}
                    >
                      By creating an account you agree to our{" "}
                      <a
                        href="#"
                        style={{
                          color: PURPLE,
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        Terms
                      </a>{" "}
                      &amp;{" "}
                      <a
                        href="#"
                        style={{
                          color: PURPLE,
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Brand panel content (shared for mobile/desktop left panels) ───────────────
function BrandPanel({ step, isMobile }) {
  const PURPLE = "#700CEB";
  const PURPLE_DARK = "#3F0C91";
  const PURPLE_MID = "#8A2FF0";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 0,
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* Decorative blobs inside panel */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          top: -80,
          right: -80,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          bottom: 60,
          left: -60,
          pointerEvents: "none",
        }}
      />

      {/* Back to homepage */}
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "rgba(255,255,255,0.6)",
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
          marginBottom: isMobile ? 20 : 40,
          width: "fit-content",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.6)")
        }
      >
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 12H5M12 5l-7 7 7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to site
      </Link>

      {/* Logo / wordmark */}
      <div style={{ marginBottom: 32 }}>
        <img
          src="/assets/logoWhite.png"
          alt="Kemchuta Homes"
          style={{ height: 36, objectFit: "contain", objectPosition: "left" }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
          }}
        />
        <p
          style={{
            display: "none",
            color: "#fff",
            fontWeight: 900,
            fontSize: 20,
            letterSpacing: "-0.04em",
            margin: 0,
          }}
        >
          Kemchuta Homes
        </p>
      </div>

      {/* Headline */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: "4px 12px",
            marginBottom: 16,
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Client Portal
        </div>

        <h2
          style={{
            color: "#fff",
            fontSize: isMobile ? 22 : 32,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.04em",
            margin: "0 0 12px",
          }}
        >
          Your Property Journey,
          <br />
          <span style={{ color: "rgba(255,255,255,0.65)" }}>
            All in One Place
          </span>
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 14,
            lineHeight: 1.7,
            margin: isMobile ? "0 0 16px" : "0 0 32px",
            maxWidth: 280,
          }}
        >
          Track subscriptions, download documents, and monitor your inspections
          — from a secure personal dashboard.
        </p>

        {/* Feature list */}
        <motion.div
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.6 },
            },
          }}
        >
          {[
            [Shield, "Bank-grade security for your data"],
            [Zap, "Real-time subscription tracking"],
            [Check, "Instant document access"],
          ].map(([Icon, text]) => (
            <Feature key={text} icon={Icon} text={text} />
          ))}
        </motion.div>
      </div>

      {/* Floating estate cards — decorative, desktop only */}
      {!isMobile && (
        <div style={{ position: "relative", height: 120, marginTop: 32 }}>
          <FloatingCard
            style={{ bottom: 12, left: 0 }}
            delay={0.9}
            estateName="Greenfield Estate"
            price="₦5.2M"
            badge="Available"
          />
          <FloatingCard
            style={{ top: 0, right: 0 }}
            delay={1.1}
            estateName="Royal Gardens"
            price="₦8.7M"
            badge="Hot Deal"
          />
        </div>
      )}

      {/* Step indicator dots — desktop only */}
      {!isMobile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            marginTop: 24,
            padding: "16px 0 4px",
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {[0, 1, 2].map((i) => (
            <StepDot key={i} idx={i} current={step} />
          ))}
        </div>
      )}
    </div>
  );
}
