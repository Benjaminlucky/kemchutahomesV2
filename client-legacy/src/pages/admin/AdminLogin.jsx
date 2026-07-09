"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Animated grid pattern (pure CSS, no images needed) ───────────────────────
const GridPattern = () => (
  <svg
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: 0.07,
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path
          d="M 40 0 L 0 0 0 40"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

// ── Eye icons ─────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOff = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        background: "#0c0618",
      }}
    >
      {/* ── LEFT PANEL — brand / atmosphere ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          flex: "0 0 45%",
          background:
            "linear-gradient(160deg, #0d0720 0%, #1a0742 40%, #3F0C91 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
        }}
        className="hidden lg:flex"
      >
        {/* Grid overlay */}
        <GridPattern />

        {/* Glowing orb — top right */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(112,12,235,0.55) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Glowing orb — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(63,12,145,0.6) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Diagonal accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 80,
            width: 1,
            height: "100%",
            background:
              "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)",
            pointerEvents: "none",
          }}
        />

        {/* Top: Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              {/* Logo mark */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.05em",
                }}
              >
                K
              </div>
              <div>
                <p
                  style={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 15,
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Kemchuta Homes
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 10,
                    margin: 0,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Admin Portal
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle: hero text */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            {/* Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
                padding: "5px 14px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#a78bfa",
                  display: "block",
                }}
              />
              <span
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                }}
              >
                MANAGEMENT DASHBOARD
              </span>
            </div>

            <h1
              style={{
                color: "#fff",
                fontSize: "clamp(32px, 3.5vw, 46px)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.04em",
                margin: "0 0 18px",
              }}
            >
              Built for
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #818cf8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                excellence.
              </span>
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: 320,
                margin: 0,
              }}
            >
              Manage subscriptions, realtors, estates and clients from one
              powerful platform.
            </p>
          </motion.div>
        </div>

        {/* Bottom: stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            gap: 24,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {[
            { label: "Active Estates", value: "12+" },
            { label: "Realtors", value: "500+" },
            { label: "Subscriptions", value: "1K+" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 900,
                  margin: "0 0 2px",
                  letterSpacing: "-0.04em",
                }}
              >
                {value}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.38)",
                  fontSize: 10,
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── RIGHT PANEL — login form ─────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          padding: "40px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 70% 10%, rgba(112,12,235,0.04) 0%, transparent 60%), radial-gradient(ellipse at 20% 90%, rgba(63,12,145,0.03) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%",
            maxWidth: 400,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Mobile logo (hidden on desktop) */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#3F0C91",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
              }}
            >
              K
            </div>
            <div>
              <p
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#0f0a1e",
                  margin: 0,
                }}
              >
                Kemchuta Homes
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  margin: 0,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Admin Portal
              </p>
            </div>
          </div>

          {/* Form heading */}
          <div style={{ marginBottom: 36 }}>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#0f0a1e",
                margin: "0 0 6px",
                letterSpacing: "-0.04em",
              }}
            >
              Welcome back
            </h2>
            <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
              Sign in to your admin account
            </p>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                style={{
                  marginBottom: 20,
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#ef4444",
                    flexShrink: 0,
                  }}
                />
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: 13,
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Email field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 7,
                }}
              >
                Email Address
              </label>
              <div
                style={{
                  position: "relative",
                  borderRadius: 12,
                  border: `1.5px solid ${focused === "email" ? "#700CEB" : "rgba(0,0,0,0.1)"}`,
                  boxShadow:
                    focused === "email"
                      ? "0 0 0 3px rgba(112,12,235,0.1)"
                      : "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  background: focused === "email" ? "#fdfbff" : "#fafafa",
                }}
              >
                <input
                  name="email"
                  type="email"
                  placeholder="admin@kemchutahomesltd.com"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  required
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: 14,
                    color: "#0f0a1e",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 7,
                }}
              >
                Password
              </label>
              <div
                style={{
                  position: "relative",
                  borderRadius: 12,
                  border: `1.5px solid ${focused === "password" ? "#700CEB" : "rgba(0,0,0,0.1)"}`,
                  boxShadow:
                    focused === "password"
                      ? "0 0 0 3px rgba(112,12,235,0.1)"
                      : "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  background: focused === "password" ? "#fdfbff" : "#fafafa",
                }}
              >
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                  style={{
                    width: "100%",
                    padding: "13px 48px 13px 16px",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: 14,
                    color: "#0f0a1e",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    display: "flex",
                    padding: 0,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#700CEB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#9ca3af")
                  }
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: "right", marginTop: -6 }}>
              <a
                href="/admin/forgot-password"
                style={{
                  fontSize: 12,
                  color: "#700CEB",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                Forgot password?
              </a>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={!loading && !success ? { scale: 1.01, y: -1 } : {}}
              whileTap={!loading && !success ? { scale: 0.99 } : {}}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "14px 0",
                borderRadius: 12,
                border: "none",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading || success ? "not-allowed" : "pointer",
                color: "#fff",
                background: success
                  ? "linear-gradient(135deg,#059669,#34d399)"
                  : loading
                    ? "rgba(112,12,235,0.55)"
                    : "linear-gradient(135deg, #3F0C91 0%, #700CEB 100%)",
                boxShadow:
                  loading || success
                    ? "none"
                    : "0 4px 16px rgba(112,12,235,0.35)",
                transition: "background 0.3s, box-shadow 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "inherit",
              }}
            >
              {success ? (
                <>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ display: "flex" }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </motion.span>
                  Redirecting…
                </>
              ) : loading ? (
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
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p
            style={{
              marginTop: 36,
              textAlign: "center",
              fontSize: 12,
              color: "#d1d5db",
            }}
          >
            © {new Date().getFullYear()} Kemchuta Homes Limited. All rights
            reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
