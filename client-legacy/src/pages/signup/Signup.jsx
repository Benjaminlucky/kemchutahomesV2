"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Brand constants ───────────────────────────────────────────────────────────
const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const PURPLE_MID = "#8A2FF0";

// ── Data ──────────────────────────────────────────────────────────────────────
const states = [
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
  "FCT - Abuja",
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

const banks = [
  "Access Bank",
  "Citibank",
  "Ecobank",
  "Fidelity Bank",
  "First Bank",
  "FCMB",
  "GTBank",
  "Heritage Bank",
  "Keystone Bank",
  "MoniePoint",
  "Opay Digital",
  "Polaris Bank",
  "Stanbic IBTC",
  "Sterling Bank",
  "Union Bank",
  "UBA",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 0,
    label: "Personal",
    fields: ["firstName", "lastName", "email", "phone", "birthDate"],
  },
  {
    id: 1,
    label: "Location",
    fields: ["state", "bank", "accountName", "accountNumber"],
  },
  {
    id: 2,
    label: "Security",
    fields: ["password", "confirmPassword", "terms"],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Sub-components ────────────────────────────────────────────────────────────
function Blob({ style }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ filter: "blur(90px)", ...style }}
      animate={{
        x: [0, 25, -18, 0],
        y: [0, -20, 12, 0],
        scale: [1, 1.07, 0.97, 1],
      }}
      transition={{
        duration: 14,
        repeat: Infinity,
        ease: "easeInOut",
        ...style.anim,
      }}
    />
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <motion.div
      className="flex items-center gap-3"
      style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div
        className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.15)" }}
      >
        <Icon size={12} color="white" />
      </div>
      {text}
    </motion.div>
  );
}

// Input style helper
const inputSt = (hasErr) => ({
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
  appearance: "none",
});

const selectSt = (hasErr) => ({
  ...inputSt(hasErr),
  cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 36,
});

function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.07em",
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
            exit={{ opacity: 0, height: 0 }}
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

function focusIn(e, hasErr) {
  if (!hasErr) e.target.style.borderColor = "rgba(112,12,235,0.5)";
  e.target.style.boxShadow = "0 0 0 3px rgba(112,12,235,0.08)";
}
function focusOut(e, hasErr) {
  if (!hasErr) e.target.style.borderColor = "rgba(112,12,235,0.15)";
  e.target.style.boxShadow = "none";
}

// ── Step dot ──────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  return (
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
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                  i < step ? PURPLE : i === step ? "#fff" : "transparent",
                border: `2px solid ${i <= step ? PURPLE : "rgba(112,12,235,0.2)"}`,
                color: i < step ? "#fff" : i === step ? PURPLE : "#9ca3af",
                flexShrink: 0,
              }}
            >
              {i < step ? <Check size={11} /> : i + 1}
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: i === step ? "#0f0a1e" : i < step ? PURPLE : "#9ca3af",
              }}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                margin: "0 10px",
                background: step > i ? PURPLE : "rgba(112,12,235,0.15)",
                borderRadius: 1,
                transition: "background 0.4s",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── CTA Button ────────────────────────────────────────────────────────────────
function CTAButton({
  onClick,
  disabled,
  loading,
  label,
  icon: Icon = ArrowRight,
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.98 }}
      style={{
        flex: 1,
        padding: "14px 0",
        borderRadius: 12,
        background: disabled
          ? "rgba(112,12,235,0.5)"
          : `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE}, ${PURPLE_MID})`,
        color: "#fff",
        fontWeight: 800,
        fontSize: 15,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        letterSpacing: "-0.01em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: disabled ? "none" : "0 6px 20px rgba(112,12,235,0.4)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          e.currentTarget.style.boxShadow = "0 10px 28px rgba(112,12,235,0.55)";
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(112,12,235,0.4)";
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
          Processing…
        </>
      ) : (
        <>
          {label} <Icon size={16} />
        </>
      )}
    </motion.button>
  );
}

function BackButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
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
  );
}

// ── Left brand panel ──────────────────────────────────────────────────────────
function BrandPanel({ step, isMobile }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          top: -100,
          right: -100,
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
          bottom: 80,
          left: -70,
          pointerEvents: "none",
        }}
      />

      {/* Back link */}
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

      {/* Logo */}
      <div style={{ marginBottom: isMobile ? 16 : 32 }}>
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

      {/* Main content */}
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
          Realtor Network
        </div>

        <h2
          style={{
            color: "#fff",
            fontSize: isMobile ? 22 : 30,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.04em",
            margin: "0 0 10px",
          }}
        >
          Build Your Real Estate
          <br />
          <span style={{ color: "rgba(255,255,255,0.65)" }}>
            Empire With Us
          </span>
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 13,
            lineHeight: 1.6,
            margin: isMobile ? "0 0 14px" : "0 0 24px",
            maxWidth: 290,
          }}
        >
          Guided by High Chief Dr. Ikem O. Nwabueze, we stand for innovation,
          integrity, and growth — empowering every realtor to earn more.
        </p>

        <motion.div
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.5 },
            },
          }}
        >
          {[
            [TrendingUp, "Competitive commission structure"],
            [Users, "Multi-level realtor network"],
            [Shield, "Reliable payment system"],
          ].map(([Icon, text]) => (
            <Feature key={text} icon={Icon} text={text} />
          ))}
        </motion.div>

        {/* Stats strip — desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 16, marginTop: 28 }}>
            {[
              ["500+", "Active Realtors"],
              ["₦2B+", "Sales Closed"],
              ["15+", "Estates"],
            ].map(([val, lbl]) => (
              <div
                key={lbl}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "14px 12px",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: 18,
                    letterSpacing: "-0.03em",
                    margin: "0 0 2px",
                  }}
                >
                  {val}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  {lbl}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step dots at bottom — desktop only */}
      {!isMobile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            marginTop: 24,
            padding: "16px 0 4px",
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
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
                        ? "white"
                        : "rgba(255,255,255,0.15)",
                  border: `2px solid ${i === step ? PURPLE : "transparent"}`,
                  color:
                    i < step
                      ? "#fff"
                      : i === step
                        ? PURPLE
                        : "rgba(255,255,255,0.5)",
                }}
              >
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color:
                    i === step
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.4)",
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Signup() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    state: "",
    bank: "",
    accountName: "",
    accountNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

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

  const handleChange = (e) => set(e.target.name, e.target.value);
  const strength = getStrength(formData.password);

  // ── Validation per step ────────────────────────────────────────────────────
  const validate0 = () => {
    const e = {};
    const phoneRx = /^(\+234|0)[789][01]\d{8}$/;
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.firstName.trim()) e.firstName = "Required";
    if (!formData.lastName.trim()) e.lastName = "Required";
    if (!emailRx.test(formData.email)) e.email = "Enter a valid email";
    if (!phoneRx.test(formData.phone))
      e.phone = "Enter a valid Nigerian phone number";
    if (!formData.birthDate) e.birthDate = "Date of birth is required";
    return e;
  };

  const validate1 = () => {
    const e = {};
    if (!formData.state) e.state = "Select your state";
    if (!formData.bank) e.bank = "Select your bank";
    if (!formData.accountName.trim())
      e.accountName = "Account name is required";
    if (!/^\d{10}$/.test(formData.accountNumber))
      e.accountNumber = "Must be 10 digits";
    return e;
  };

  const validate2 = () => {
    const e = {};
    if (formData.password.length < 8) e.password = "Minimum 8 characters";
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords don't match";
    if (!termsAccepted) e.terms = "You must accept the terms";
    return e;
  };

  const goNext = (validateFn) => {
    const errs = validateFn();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const errs = validate2();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData };
      const refCode = new URLSearchParams(window.location.search).get("ref");
      if (refCode) payload.ref = refCode;

      const res = await fetch(`${BASE_URL}/api/realtors/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setSuccess("Account created successfully! Redirecting to login…");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setTimeout(() => {
        window.location.href = "/login";
      }, 3500);
    } catch (err) {
      setErrors({
        general: err.message || "An error occurred. Please try again.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (d) => ({ x: d * 40, opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.32, ease: "easeOut" },
    },
    exit: (d) => ({ x: d * -40, opacity: 0, transition: { duration: 0.22 } }),
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
      {/* Blobs */}
      <Blob
        style={{
          width: 640,
          height: 640,
          background: "rgba(112,12,235,0.07)",
          top: "-20%",
          left: "-15%",
          anim: {},
        }}
      />
      <Blob
        style={{
          width: 420,
          height: 420,
          background: "rgba(138,47,240,0.05)",
          bottom: "-12%",
          right: "-10%",
          anim: { delay: 3 },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.9, ease: "easeOut" },
            },
          }}
          initial="hidden"
          animate={controls}
          style={{
            background: `linear-gradient(145deg, ${PURPLE_DARK} 0%, ${PURPLE} 55%, ${PURPLE_MID} 100%)`,
            padding: isMobile ? "32px 24px" : "48px 44px",
            position: "relative",
            overflow: "hidden",
            flex: isMobile ? "0 0 auto" : "0 0 42%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <BrandPanel step={step} isMobile={isMobile} />
        </motion.div>

        {/* ── RIGHT FORM ─────────────────────────────────────────────────── */}
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
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(112,12,235,0.06)",
                border: "1px solid rgba(112,12,235,0.12)",
                borderRadius: 20,
                padding: "4px 12px",
                marginBottom: 14,
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
                Join as Realtor
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
              {showSuccess ? "You're in!" : "Create Your Realtor Account"}
            </h2>
            <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
              Already a member?{" "}
              <Link
                to="/login"
                style={{
                  color: PURPLE,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.textDecoration = "underline")
                }
                onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Step bar */}
          {!showSuccess && <StepBar step={step} />}

          {/* Success */}
          <AnimatePresence mode="wait">
            {showSuccess && (
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
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Welcome to Kemchuta Homes Realtors.
                  <br />
                  Check your email — redirecting to login.
                </p>
              </motion.div>
            )}

            {/* ── Step 0 ─────────────────────────────────────────────────── */}
            {!showSuccess && step === 0 && (
              <motion.div
                key="s0"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <Field label="First name" error={errors.firstName}>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        style={inputSt(errors.firstName)}
                        onFocus={(e) => focusIn(e, errors.firstName)}
                        onBlur={(e) => focusOut(e, errors.firstName)}
                      />
                    </Field>
                    <Field label="Last name" error={errors.lastName}>
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        style={inputSt(errors.lastName)}
                        onFocus={(e) => focusIn(e, errors.lastName)}
                        onBlur={(e) => focusOut(e, errors.lastName)}
                      />
                    </Field>
                  </div>

                  <Field label="Email address" error={errors.email}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      style={inputSt(errors.email)}
                      onFocus={(e) => focusIn(e, errors.email)}
                      onBlur={(e) => focusOut(e, errors.email)}
                    />
                  </Field>

                  <Field label="Phone number" error={errors.phone}>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="08012345678"
                      style={inputSt(errors.phone)}
                      onFocus={(e) => focusIn(e, errors.phone)}
                      onBlur={(e) => focusOut(e, errors.phone)}
                    />
                  </Field>

                  <Field label="Date of birth" error={errors.birthDate}>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      max="2026-12-31"
                      style={inputSt(errors.birthDate)}
                      onFocus={(e) => focusIn(e, errors.birthDate)}
                      onBlur={(e) => focusOut(e, errors.birthDate)}
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

                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <CTAButton
                      onClick={() => goNext(validate0)}
                      loading={false}
                      disabled={false}
                      label="Continue"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 1 ─────────────────────────────────────────────────── */}
            {!showSuccess && step === 1 && (
              <motion.div
                key="s1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <Field label="State" error={errors.state}>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        style={selectSt(errors.state)}
                        onFocus={(e) => focusIn(e, errors.state)}
                        onBlur={(e) => focusOut(e, errors.state)}
                      >
                        <option value="">Select State</option>
                        {states.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Bank" error={errors.bank}>
                      <select
                        name="bank"
                        value={formData.bank}
                        onChange={handleChange}
                        style={selectSt(errors.bank)}
                        onFocus={(e) => focusIn(e, errors.bank)}
                        onBlur={(e) => focusOut(e, errors.bank)}
                      >
                        <option value="">Select Bank</option>
                        {banks.map((bk) => (
                          <option key={bk} value={bk}>
                            {bk}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Account name" error={errors.accountName}>
                    <input
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleChange}
                      placeholder="As it appears on your bank account"
                      style={inputSt(errors.accountName)}
                      onFocus={(e) => focusIn(e, errors.accountName)}
                      onBlur={(e) => focusOut(e, errors.accountName)}
                    />
                  </Field>

                  <Field label="Account number" error={errors.accountNumber}>
                    <input
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="10-digit account number"
                      style={inputSt(errors.accountNumber)}
                      onFocus={(e) => focusIn(e, errors.accountNumber)}
                      onBlur={(e) => focusOut(e, errors.accountNumber)}
                    />
                  </Field>

                  {/* Info notice */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "12px 14px",
                      background: "rgba(112,12,235,0.04)",
                      border: "1px solid rgba(112,12,235,0.1)",
                      borderRadius: 10,
                    }}
                  >
                    <Shield
                      size={14}
                      color={PURPLE}
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      Your bank details are used only for commission payouts and
                      are stored securely.
                    </p>
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
                    <BackButton
                      onClick={() => {
                        setStep(0);
                        setErrors({});
                      }}
                    />
                    <CTAButton
                      onClick={() => goNext(validate1)}
                      loading={false}
                      disabled={false}
                      label="Continue"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 2 ─────────────────────────────────────────────────── */}
            {!showSuccess && step === 2 && (
              <motion.div
                key="s2"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Password */}
                  <Field label="Create password" error={errors.password}>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 8 characters"
                        style={{
                          ...inputSt(errors.password),
                          paddingRight: 42,
                        }}
                        onFocus={(e) => focusIn(e, errors.password)}
                        onBlur={(e) => focusOut(e, errors.password)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
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
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat your password"
                        style={{
                          ...inputSt(
                            errors.confirmPassword ||
                              (formData.confirmPassword &&
                                formData.confirmPassword !== formData.password),
                          ),
                          paddingRight: 42,
                        }}
                        onFocus={(e) => focusIn(e, errors.confirmPassword)}
                        onBlur={(e) => focusOut(e, errors.confirmPassword)}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
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

                  {/* Terms */}
                  <div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        onClick={() => {
                          setTermsAccepted(!termsAccepted);
                          setErrors((e) => ({ ...e, terms: "" }));
                        }}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          flexShrink: 0,
                          marginTop: 1,
                          background: termsAccepted ? PURPLE : "transparent",
                          border: `2px solid ${errors.terms ? "#ef4444" : termsAccepted ? PURPLE : "rgba(112,12,235,0.3)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {termsAccepted && (
                          <Check size={11} color="#fff" strokeWidth={3} />
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          lineHeight: 1.5,
                        }}
                      >
                        I agree to Kemchuta Homes'{" "}
                        <a
                          href="#"
                          style={{
                            color: PURPLE,
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          style={{
                            color: PURPLE,
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    <AnimatePresence>
                      {errors.terms && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{
                            color: "#ef4444",
                            fontSize: 11,
                            fontWeight: 500,
                            margin: "4px 0 0",
                          }}
                        >
                          {errors.terms}
                        </motion.p>
                      )}
                    </AnimatePresence>
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
                    <BackButton
                      onClick={() => {
                        setStep(1);
                        setErrors({});
                      }}
                    />
                    <CTAButton
                      onClick={handleSubmit}
                      loading={loading}
                      disabled={loading}
                      label="Create Account"
                    />
                  </div>

                  <p
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      color: "#9ca3af",
                      margin: 0,
                    }}
                  >
                    Referral code will be applied automatically if present in
                    the URL.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { color: #0f0a1e; background: #fff; }
      `}</style>
    </div>
  );
}
