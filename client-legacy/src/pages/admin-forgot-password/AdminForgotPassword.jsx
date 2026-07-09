import React, { useState } from "react";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSent(true);
      setMessage(data.message);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-customPurple-500/50 via-transparent to-transparent z-0"
        initial={{ x: "-100%" }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      />

      <motion.div
        className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md relative z-10"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Forgot Password
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          Enter your admin email and we'll send you a reset link.
        </p>

        {message && (
          <p
            className={`p-3 rounded mb-4 text-sm ${
              sent ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-customPurple-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-customPurple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">
              Check your inbox at{" "}
              <span className="font-semibold text-customPurple-600">
                {email}
              </span>
              . The link expires in 1 hour.
            </p>

            <a
              href="/admin/login"
              className="inline-block text-sm text-customPurple-600 hover:underline font-medium"
            >
              ← Back to login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-400 rounded-sm p-3 outline-none focus:ring-2 focus:ring-customPurple-500"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white transition ${
                loading
                  ? "bg-customPurple-400 cursor-not-allowed"
                  : "bg-customPurple-500 hover:bg-customPurple-800"
              }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center">
              <a
                href="/admin/login"
                className="text-sm text-customPurple-600 hover:underline"
              >
                ← Back to login
              </a>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
