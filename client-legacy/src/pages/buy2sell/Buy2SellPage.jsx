import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.VITE_API_BASE_URL;
const PURPLE = "#700CEB";
const DARK = "#3F0C91";

const fmtNGN = (n = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";
const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const PRESET_AMOUNTS = [
  1_000_000, 2_000_000, 5_000_000, 10_000_000, 20_000_000, 30_000_000,
  50_000_000,
];
const DURATIONS = [
  {
    key: "6 Months",
    label: "6 Months",
    days: 180,
    roiKey: "roiPercent6Months",
  },
  {
    key: "12 Months",
    label: "12 Months",
    days: 360,
    roiKey: "roiPercent12Months",
  },
  {
    key: "18 Months",
    label: "18 Months",
    days: 540,
    roiKey: "roiPercent18Months",
  },
];
const ID_TYPES = [
  "NIN",
  "BVN",
  "International Passport",
  "Driver's Licence",
  "Voter's Card",
];
const GENDERS = ["Male", "Female", "Prefer not to say"];
const STATES = [
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

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ["Investment", "Your Details", "Done"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background:
                  i <= current
                    ? `linear-gradient(135deg,${DARK},${PURPLE})`
                    : "#f0eeff",
                color: i <= current ? "#fff" : "#c084fc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 14,
                boxShadow: i === current ? `0 0 0 5px ${PURPLE}20` : "none",
                transition: "all 0.35s",
              }}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: i === current ? 800 : 500,
                color: i === current ? DARK : "#b0a0d0",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                margin: "0 10px",
                marginBottom: 22,
                background: i < current ? PURPLE : "#ede9f8",
                transition: "background 0.35s",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, required, error, children, hint }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontSize: 11, color: "#b0a0d0", margin: "4px 0 0" }}>
          {hint}
        </p>
      )}
      {error && (
        <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0" }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

const inpBase = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  fontSize: 14,
  border: "1.5px solid #e5e0ff",
  outline: "none",
  background: "#fdfcff",
  color: "#0f0a1e",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "all 0.2s",
};
const focusStyle = (e) => {
  e.target.style.borderColor = PURPLE;
  e.target.style.boxShadow = `0 0 0 3px ${PURPLE}15`;
  e.target.style.background = "#fff";
};
const blurStyle = (e) => {
  e.target.style.borderColor = "#e5e0ff";
  e.target.style.boxShadow = "none";
  e.target.style.background = "#fdfcff";
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Buy2SellPage() {
  // Read any pre-filled params from Earnhome homepage component
  const _p = new URLSearchParams(window.location.search);

  const [step, setStep] = useState(0);
  const [roi, setRoi] = useState(null);
  const [amount, setAmount] = useState(5_000_000);
  const [custom, setCustom] = useState("");
  const [duration, setDuration] = useState(_p.get("duration") || "12 Months");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [clientExists, setClientExists] = useState(false);

  const [kyc, setKyc] = useState({
    fullName: _p.get("fullName") || "",
    email: _p.get("email") || "",
    phone: _p.get("phone") || "",
    dateOfBirth: "",
    gender: "",
    nationality: "Nigerian",
    address: "",
    city: "",
    state: "",
    idType: "",
    idNumber: "",
  });

  useEffect(() => {
    fetch(`${BASE}/api/buy2sell/roi`)
      .then((r) => r.json())
      .then((d) => setRoi(d))
      .catch(() =>
        setRoi({
          roiPercent6Months: 22,
          roiPercent12Months: 48,
          roiPercent18Months: 75,
        }),
      );
  }, []);

  const durConfig = DURATIONS.find((d) => d.key === duration) || DURATIONS[1];
  const roiPct = roi ? (roi[durConfig.roiKey] ?? 0) : 0;
  const roiAmt = Math.round((amount * roiPct) / 100);
  const totalRet = amount + roiAmt;
  const maturity = addDays(durConfig.days);

  const setK = (k, v) => {
    setKyc((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!kyc.fullName.trim()) e.fullName = "Required";
    if (!kyc.email.trim() || !/\S+@\S+\.\S+/.test(kyc.email))
      e.email = "Valid email required";
    if (!kyc.phone.trim() || kyc.phone.replace(/\D/g, "").length < 10)
      e.phone = "Valid phone required";
    if (!kyc.dateOfBirth) e.dateOfBirth = "Required";
    if (!kyc.address.trim()) e.address = "Required";
    if (!kyc.state) e.state = "Required";
    if (!kyc.idType) e.idType = "Required";
    if (!kyc.idNumber.trim()) e.idNumber = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/buy2sell/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...kyc, duration, principalAmount: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data.lead);
      setClientExists(!!data.clientExists);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErrors({ submit: e.message });
    } finally {
      setLoading(false);
    }
  };

  const inpStyle = (field) => ({
    ...inpBase,
    borderColor: errors[field] ? "#ef4444" : "#e5e0ff",
  });

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    // paddingTop: 72px fixes header z-index overlap (sticky nav height)
    <div
      style={{
        background: "linear-gradient(180deg,#f5f0ff 0%,#faf8ff 60%,#fff 100%)",
        minHeight: "100vh",
        paddingTop: "72px",
      }}
    >
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(150deg,${DARK} 0%,#5a0bb5 50%,${PURPLE} 100%)`,
          padding: "72px 24px 100px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated grid */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.06,
            pointerEvents: "none",
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="b2sgrid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="white"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#b2sgrid)" />
        </svg>

        {/* Glowing orbs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(180,140,255,0.35) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(100,60,200,0.4) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 18px",
              borderRadius: 24,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#c084fc",
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              KEMCHUTA HOMES · BUY2SELL SCHEME
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            style={{
              color: "#fff",
              fontSize: "clamp(30px,5.5vw,54px)",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              margin: "0 0 18px",
              lineHeight: 1.05,
            }}
          >
            Earn Up To{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#c084fc,#a5f3fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              75% ROI
            </span>{" "}
            on Your Investment
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 17,
              margin: "0 0 36px",
              lineHeight: 1.7,
              maxWidth: 560,
              margin: "0 auto 36px",
            }}
          >
            Invest in Kemchuta Homes Buy2Sell scheme and grow your wealth with
            fixed returns over 6, 12 or 18 months. Capital guaranteed. Returns
            paid at maturity.
          </motion.p>

          {/* ROI pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {roi &&
              DURATIONS.map((d) => (
                <div
                  key={d.key}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {d.label} —{" "}
                  <span style={{ color: "#c084fc", fontWeight: 900 }}>
                    {roi[d.roiKey]}% ROI
                  </span>
                </div>
              ))}
          </motion.div>
        </div>

        {/* Wave bottom */}
        <div
          style={{
            position: "absolute",
            bottom: -2,
            left: 0,
            right: 0,
            height: 60,
            pointerEvents: "none",
          }}
        >
          <svg
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%" }}
          >
            <path
              d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z"
              fill="linear-gradient(180deg,#f5f0ff,#faf8ff)"
            />
            <path
              d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z"
              fill="#f5f0ff"
            />
          </svg>
        </div>
      </div>

      {/* ── Form card — negative margin to overlap wave ───────────────────── */}
      <div
        style={{
          maxWidth: 800,
          margin: "-48px auto 80px",
          padding: "0 16px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          style={{
            background: "#fff",
            borderRadius: 28,
            boxShadow: "0 16px 64px rgba(112,12,235,0.14)",
            padding: "44px 40px",
          }}
        >
          <Steps current={step} />

          <AnimatePresence mode="wait">
            {/* ── STEP 0: Calculator ─────────────────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="s0"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
              >
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#0f0a1e",
                    margin: "0 0 6px",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Select Your Investment
                </h2>
                <p
                  style={{ color: "#9ca3af", fontSize: 14, margin: "0 0 32px" }}
                >
                  Choose an amount and duration to see your guaranteed returns.
                </p>

                {/* Amount presets */}
                <div style={{ marginBottom: 28 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 12,
                    }}
                  >
                    Investment Amount
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    {PRESET_AMOUNTS.map((a) => {
                      const sel = amount === a && !custom;
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => {
                            setAmount(a);
                            setCustom("");
                          }}
                          style={{
                            padding: "10px 18px",
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            border: `1.5px solid ${sel ? PURPLE : "#e5e0ff"}`,
                            background: sel
                              ? `linear-gradient(135deg,${DARK},${PURPLE})`
                              : "#f9f6ff",
                            color: sel ? "#fff" : PURPLE,
                            boxShadow: sel ? `0 4px 12px ${PURPLE}30` : "none",
                          }}
                        >
                          {fmtNGN(a)}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9ca3af",
                        fontSize: 15,
                        fontWeight: 700,
                      }}
                    >
                      ₦
                    </span>
                    <input
                      type="number"
                      placeholder="Or enter custom amount…"
                      value={custom}
                      min={1000000}
                      max={50000000}
                      onChange={(e) => {
                        setCustom(e.target.value);
                        if (e.target.value) setAmount(Number(e.target.value));
                      }}
                      style={{ ...inpBase, paddingLeft: 36 }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#b0a0d0",
                      margin: "6px 0 0",
                    }}
                  >
                    Min: ₦1,000,000 · Max: ₦50,000,000
                  </p>
                </div>

                {/* Duration cards */}
                <div style={{ marginBottom: 32 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 14,
                    }}
                  >
                    Duration & Return
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 14,
                    }}
                  >
                    {roi &&
                      DURATIONS.map((d) => {
                        const sel = duration === d.key;
                        const pct = roi[d.roiKey];
                        const ret = Math.round((amount * pct) / 100);
                        return (
                          <button
                            key={d.key}
                            type="button"
                            onClick={() => setDuration(d.key)}
                            style={{
                              padding: "20px 14px",
                              borderRadius: 18,
                              cursor: "pointer",
                              textAlign: "center",
                              transition: "all 0.2s",
                              background: sel
                                ? `linear-gradient(150deg,${DARK},${PURPLE})`
                                : "#f9f6ff",
                              border: `2px solid ${sel ? PURPLE : "#ede9f8"}`,
                              boxShadow: sel
                                ? `0 8px 24px ${PURPLE}30`
                                : "none",
                              transform: sel ? "translateY(-2px)" : "none",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: sel
                                  ? "rgba(255,255,255,0.8)"
                                  : "#6b7280",
                                margin: "0 0 6px",
                              }}
                            >
                              {d.label}
                            </p>
                            <p
                              style={{
                                fontSize: 28,
                                fontWeight: 900,
                                color: sel ? "#e0c8ff" : PURPLE,
                                margin: "0 0 6px",
                                letterSpacing: "-0.04em",
                              }}
                            >
                              {pct}%
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: sel
                                  ? "rgba(255,255,255,0.65)"
                                  : "#9ca3af",
                                margin: "0 0 8px",
                              }}
                            >
                              ROI
                            </p>
                            <div
                              style={{
                                height: 1,
                                background: sel
                                  ? "rgba(255,255,255,0.15)"
                                  : "#ede9f8",
                                margin: "0 0 8px",
                              }}
                            />
                            <p
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: sel ? "#c8f0c0" : "#059669",
                                margin: 0,
                              }}
                            >
                              +{fmtNGN(ret)}
                            </p>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Summary box */}
                <div
                  style={{
                    background: `linear-gradient(135deg,${DARK}08,${PURPLE}06)`,
                    border: `1.5px solid ${PURPLE}18`,
                    borderRadius: 20,
                    padding: "24px 28px",
                    marginBottom: 32,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: PURPLE,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      margin: "0 0 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: PURPLE,
                      }}
                    />
                    Your Investment Projection
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2,1fr)",
                      gap: 12,
                    }}
                  >
                    {[
                      ["Principal", fmtNGN(amount), "#0f0a1e"],
                      ["ROI Rate (locked)", `${roiPct}%`, PURPLE],
                      ["Return on Investment", fmtNGN(roiAmt), "#059669"],
                      ["Total at Maturity", fmtNGN(totalRet), DARK],
                      ["Duration", duration, "#374151"],
                      ["Maturity Date", fmtDate(maturity), "#374151"],
                    ].map(([l, v, c]) => (
                      <div
                        key={l}
                        style={{
                          background: "rgba(255,255,255,0.8)",
                          borderRadius: 12,
                          padding: "12px 16px",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            margin: "0 0 4px",
                          }}
                        >
                          {l}
                        </p>
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 900,
                            color: c,
                            margin: 0,
                            letterSpacing: "-0.03em",
                          }}
                        >
                          {v}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      margin: "16px 0 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>★</span> Your ROI rate is locked in at {roiPct}% today
                    — it will not change even if rates are updated later.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    width: "100%",
                    padding: "16px 0",
                    borderRadius: 14,
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                    boxShadow: `0 6px 20px ${PURPLE}40`,
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = `0 8px 28px ${PURPLE}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 6px 20px ${PURPLE}40`;
                  }}
                >
                  Continue to Your Details →
                </button>
              </motion.div>
            )}

            {/* ── STEP 1: KYC ───────────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
              >
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#0f0a1e",
                    margin: "0 0 6px",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Your Details
                </h2>
                <p
                  style={{ color: "#9ca3af", fontSize: 14, margin: "0 0 28px" }}
                >
                  Complete your KYC information to submit your investment
                  application.
                </p>

                {/* Mini summary bar */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    background: `${PURPLE}06`,
                    border: `1px solid ${PURPLE}18`,
                    borderRadius: 14,
                    padding: "14px 20px",
                    marginBottom: 28,
                  }}
                >
                  {[
                    ["Amount", fmtNGN(amount)],
                    ["Duration", duration],
                    ["ROI", `${roiPct}%`],
                    ["Payout", fmtNGN(totalRet)],
                  ].map(([l, v]) => (
                    <div key={l} style={{ flex: 1, minWidth: 100 }}>
                      <p
                        style={{
                          fontSize: 10,
                          color: "#9ca3af",
                          margin: "0 0 2px",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontWeight: 700,
                        }}
                      >
                        {l}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 900,
                          color: DARK,
                          margin: 0,
                        }}
                      >
                        {v}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Section: Personal */}
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: PURPLE,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "0 0 16px",
                    paddingBottom: 8,
                    borderBottom: `1px solid ${PURPLE}18`,
                  }}
                >
                  Personal Information
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <div style={{ gridColumn: "1/-1" }}>
                    <Field label="Full Name" required error={errors.fullName}>
                      <input
                        value={kyc.fullName}
                        onChange={(e) => setK("fullName", e.target.value)}
                        placeholder="As it appears on your ID"
                        style={inpStyle("fullName")}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                  </div>
                  <Field label="Email Address" required error={errors.email}>
                    <input
                      type="email"
                      value={kyc.email}
                      onChange={(e) => setK("email", e.target.value)}
                      placeholder="your@email.com"
                      style={inpStyle("email")}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </Field>
                  <Field label="Phone Number" required error={errors.phone}>
                    <input
                      type="tel"
                      value={kyc.phone}
                      onChange={(e) => setK("phone", e.target.value)}
                      placeholder="+234 800 000 0000"
                      style={inpStyle("phone")}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </Field>
                  <Field
                    label="Date of Birth"
                    required
                    error={errors.dateOfBirth}
                  >
                    <input
                      type="date"
                      value={kyc.dateOfBirth}
                      onChange={(e) => setK("dateOfBirth", e.target.value)}
                      style={inpStyle("dateOfBirth")}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </Field>
                  <Field label="Gender">
                    <select
                      value={kyc.gender}
                      onChange={(e) => setK("gender", e.target.value)}
                      style={{ ...inpBase, cursor: "pointer" }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    >
                      <option value="">Select gender</option>
                      {GENDERS.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Section: Address */}
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: PURPLE,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "0 0 16px",
                    paddingBottom: 8,
                    borderBottom: `1px solid ${PURPLE}18`,
                  }}
                >
                  Residential Address
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <div style={{ gridColumn: "1/-1" }}>
                    <Field
                      label="Street Address"
                      required
                      error={errors.address}
                    >
                      <input
                        value={kyc.address}
                        onChange={(e) => setK("address", e.target.value)}
                        placeholder="House number, street name"
                        style={inpStyle("address")}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                  </div>
                  <Field label="City">
                    <input
                      value={kyc.city}
                      onChange={(e) => setK("city", e.target.value)}
                      placeholder="City"
                      style={inpBase}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </Field>
                  <Field label="State" required error={errors.state}>
                    <select
                      value={kyc.state}
                      onChange={(e) => setK("state", e.target.value)}
                      style={{ ...inpStyle("state"), cursor: "pointer" }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    >
                      <option value="">Select state</option>
                      {STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Section: ID */}
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: PURPLE,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "0 0 16px",
                    paddingBottom: 8,
                    borderBottom: `1px solid ${PURPLE}18`,
                  }}
                >
                  Means of Identification
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <Field label="ID Type" required error={errors.idType}>
                    <select
                      value={kyc.idType}
                      onChange={(e) => setK("idType", e.target.value)}
                      style={{ ...inpStyle("idType"), cursor: "pointer" }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    >
                      <option value="">Select ID type</option>
                      {ID_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="ID Number"
                    required
                    error={errors.idNumber}
                    hint={
                      kyc.idType === "NIN"
                        ? "11-digit NIN"
                        : kyc.idType === "BVN"
                          ? "11-digit BVN"
                          : ""
                    }
                  >
                    <input
                      value={kyc.idNumber}
                      onChange={(e) => setK("idNumber", e.target.value)}
                      placeholder="Enter ID number"
                      style={inpStyle("idNumber")}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </Field>
                  <div style={{ gridColumn: "1/-1" }}></div>
                </div>

                {errors.submit && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "rgba(239,68,68,0.07)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      marginBottom: 16,
                    }}
                  >
                    <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>
                      ⚠ {errors.submit}
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    style={{
                      flex: "0 0 130px",
                      padding: "14px 0",
                      borderRadius: 14,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#6b7280",
                      border: "1.5px solid #e5e0ff",
                      background: "#faf8ff",
                      cursor: "pointer",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "14px 0",
                      borderRadius: 14,
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#fff",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      background: loading
                        ? "rgba(112,12,235,0.4)"
                        : `linear-gradient(135deg,${DARK},${PURPLE})`,
                      boxShadow: loading ? "none" : `0 6px 20px ${PURPLE}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{ display: "flex" }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                        </motion.span>
                        Submitting…
                      </>
                    ) : (
                      "Submit Investment Application →"
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Success ───────────────────────────────────────── */}
            {step === 2 && result && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "8px 0" }}
              >
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#059669,#34d399)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: 34,
                    boxShadow: "0 8px 24px rgba(5,150,105,0.3)",
                  }}
                >
                  🎉
                </motion.div>
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#0f0a1e",
                    margin: "0 0 8px",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Application Submitted!
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 14,
                    margin: "0 auto 24px",
                    lineHeight: 1.7,
                    maxWidth: 420,
                  }}
                >
                  Your investment has been received. Check your email for your
                  Investment Agreement PDF.
                </p>

                {/* Investment summary */}
                <div
                  style={{
                    background: `${PURPLE}05`,
                    border: `1.5px solid ${PURPLE}15`,
                    borderRadius: 16,
                    padding: "20px 22px",
                    marginBottom: 24,
                    textAlign: "left",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: PURPLE,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      margin: "0 0 14px",
                    }}
                  >
                    Investment Summary
                  </p>
                  {[
                    ["Reference", result.referenceNumber],
                    [
                      "Principal Amount",
                      new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        minimumFractionDigits: 0,
                      }).format(result.principalAmount),
                    ],
                    ["Duration", result.duration],
                    ["ROI Rate (locked)", `${result.roiPercent}%`],
                    [
                      "Total at Maturity",
                      new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        minimumFractionDigits: 0,
                      }).format(result.expectedPayout),
                    ],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "7px 0",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        {l}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#0f0a1e",
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Smart account prompt — the core feature */}
                {clientExists ? (
                  /* ── Existing account: prompt to log in ── */
                  <div
                    style={{
                      background: "#fff",
                      border: `1.5px solid ${PURPLE}25`,
                      borderRadius: 18,
                      padding: "22px 24px",
                      marginBottom: 16,
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>👤</span>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: "#0f0a1e",
                          margin: 0,
                        }}
                      >
                        You already have an account
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        margin: "0 0 16px",
                        lineHeight: 1.6,
                      }}
                    >
                      Your investment has been linked to your existing account.
                      Log in to track it in your dashboard.
                    </p>
                    <a
                      href={`/client/login?redirect=/client/portal/investments&email=${encodeURIComponent(result.email)}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        width: "100%",
                        padding: "13px 0",
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#fff",
                        background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                        textDecoration: "none",
                        boxShadow: `0 4px 14px ${PURPLE}35`,
                      }}
                    >
                      Log In to View Investment →
                    </a>
                  </div>
                ) : (
                  /* ── New user: prompt to create account ── */
                  <div
                    style={{
                      background: "#fff",
                      border: `1.5px solid ${PURPLE}25`,
                      borderRadius: 18,
                      padding: "22px 24px",
                      marginBottom: 16,
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>🚀</span>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: "#0f0a1e",
                          margin: 0,
                        }}
                      >
                        Create an account to track your investment
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        margin: "0 0 16px",
                        lineHeight: 1.6,
                      }}
                    >
                      Set up your client portal to monitor your investment
                      progress, download documents, and get notified at
                      maturity.
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <a
                        href={`/client/register?email=${encodeURIComponent(result.email)}&firstName=${encodeURIComponent(kyc.fullName.split(" ")[0])}&lastName=${encodeURIComponent(kyc.fullName.split(" ").slice(1).join(" "))}&phone=${encodeURIComponent(kyc.phone)}&redirect=/client/portal/investments`}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 7,
                          padding: "13px 0",
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#fff",
                          background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                          textDecoration: "none",
                          boxShadow: `0 4px 14px ${PURPLE}35`,
                        }}
                      >
                        Create Account →
                      </a>
                      <a
                        href={`/client/login?redirect=/client/portal/investments&email=${encodeURIComponent(result.email)}`}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 7,
                          padding: "13px 0",
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 700,
                          color: PURPLE,
                          background: `${PURPLE}08`,
                          border: `1.5px solid ${PURPLE}25`,
                          textDecoration: "none",
                        }}
                      >
                        Already have account? Log In
                      </a>
                    </div>
                  </div>
                )}

                <a
                  href="/"
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    textDecoration: "underline",
                  }}
                >
                  Back to home
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── How it works (step 0 only) ─────────────────────────────────── */}
      {step === 0 && (
        <div
          style={{
            background: "#fff",
            padding: "64px 24px",
            borderTop: "1px solid #f0eeff",
          }}
        >
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: PURPLE,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                textAlign: "center",
                margin: "0 0 8px",
              }}
            >
              Simple Process
            </p>
            <p
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#0f0a1e",
                letterSpacing: "-0.04em",
                textAlign: "center",
                margin: "0 0 40px",
              }}
            >
              How Buy2Sell Works
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                gap: 24,
              }}
            >
              {[
                { n: "01", t: "Choose Amount", d: "₦1M to ₦50M", icon: "💰" },
                {
                  n: "02",
                  t: "Pick Duration",
                  d: "6, 12 or 18 months",
                  icon: "📅",
                },
                {
                  n: "03",
                  t: "Complete KYC",
                  d: "Submit your details & ID",
                  icon: "📋",
                },
                {
                  n: "04",
                  t: "Make Payment",
                  d: "Transfer to our account",
                  icon: "🏦",
                },
                {
                  n: "05",
                  t: "Investment Live",
                  d: "Countdown starts on approval",
                  icon: "🚀",
                },
                {
                  n: "06",
                  t: "Get Paid",
                  d: "Principal + ROI at maturity",
                  icon: "🎉",
                },
              ].map(({ n, t, d, icon }) => (
                <div key={n} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: `${PURPLE}10`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                      fontSize: 22,
                    }}
                  >
                    {icon}
                  </div>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: PURPLE,
                      margin: "0 0 4px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {n}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#0f0a1e",
                      margin: "0 0 4px",
                    }}
                  >
                    {t}
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                    {d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
