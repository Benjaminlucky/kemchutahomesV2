import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ToastContainer, toast } from "react-toastify";
import { Eye, EyeOff, Home } from "lucide-react";
import { Link } from "react-router-dom";

const ClientLogin = () => {
  const _p = new URLSearchParams(window.location.search);
  const _redirect = _p.get("redirect") || "/client/portal/investments";
  const [formData, setFormData] = useState({
    email: _p.get("email") || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  React.useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${BASE_URL}/api/clients/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      if (!data.token || !data.user)
        throw new Error("Invalid response from server");

      localStorage.setItem("clientToken", data.token);
      localStorage.setItem("clientUser", JSON.stringify(data.user));

      toast.success("Welcome back!");

      setTimeout(() => {
        window.location.href = _redirect;
      }, 500);
    } catch (error) {
      toast.error(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      className="flex flex-col md:flex-row min-h-screen bg-[#e9f6f6] font-poppins overflow-hidden relative"
      variants={{
        hidden: { opacity: 0, filter: "blur(15px)" },
        visible: {
          opacity: 1,
          filter: "blur(0px)",
          transition: { duration: 1.2, ease: "easeOut" },
        },
      }}
      initial="hidden"
      animate={controls}
    >
      {/* Animated background blobs — identical to Login.jsx */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(112,12,235,0.08),_transparent_70%)] pointer-events-none"
        animate={{
          scale: [1, 1.05, 1],
          x: [0, 10, -10, 0],
          y: [0, -10, 10, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-customPurple-500/30 via-transparent to-customPurple-700/30 pointer-events-none"
        initial={{ x: "-100%" }}
        animate={inView ? { x: ["-100%", "100%"] } : {}}
        transition={{ duration: 2.8, ease: "easeInOut" }}
      />

      {/* ── Left Panel ────────────────────────────────────────────────────── */}
      <motion.div
        className="md:w-2/3 bg-customPurple-500 text-white flex flex-col justify-between px-10 py-16 relative overflow-hidden"
        variants={{
          hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
          visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 1.2 },
          },
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-10 w-32 h-32 bg-white/5 rounded-full" />

        {/* Logo / back link */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold transition-colors"
          >
            <Home size={16} />
            Back to Homepage
          </Link>
        </div>

        {/* Hero text */}
        <div className="relative z-10 lg:ml-36 mt-auto mb-10">
          <motion.div
            className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delay: 0.2 } },
            }}
          >
            Client Portal
          </motion.div>
          <motion.h1
            className="text-5xl font-semibold leading-tight mb-4"
            variants={{
              hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.8, delay: 0.3 },
              },
            }}
          >
            Your Land <br /> Journey, <br /> At a Glance
          </motion.h1>
          <motion.p
            className="text-sm md:text-base text-gray-200 max-w-md"
            variants={{
              hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.9, delay: 0.5 },
              },
            }}
          >
            Track your subscription status, view documents, and monitor your
            inspection schedule — all from one secure portal.
          </motion.p>
        </div>
      </motion.div>

      {/* ── Right Form ────────────────────────────────────────────────────── */}
      <motion.div
        className="md:w-1/2 flex items-center justify-center px-8 py-12 relative"
        variants={{
          hidden: { opacity: 0, x: 60, filter: "blur(10px)" },
          visible: {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            transition: { duration: 1.2, delay: 0.4 },
          },
        }}
      >
        <div className="w-full max-w-md">
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
          />

          <motion.div
            className="text-center mb-8"
            variants={{
              hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 1, delay: 0.6 },
              },
            }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">
              Welcome Back!
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Sign in to access your Kemchuta Homes client portal.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15, delayChildren: 0.7 },
              },
            }}
          >
            {/* Email */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-customPurple-600 focus:outline-none"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm focus:ring-2 focus:ring-customPurple-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-customPurple-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <div className="flex justify-end">
              <Link
                to="/client/forgot-password"
                className="text-customPurple-600 text-sm font-medium hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-customPurple-500 text-white py-3 rounded-lg font-semibold text-base hover:bg-customPurple-700 transition flex items-center justify-center shadow-lg hover:shadow-[0_0_25px_rgba(112,12,235,0.4)]"
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : (
                "Access My Portal"
              )}
            </motion.button>

            <motion.p
              className="text-center text-sm text-gray-500"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { delay: 1 } },
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/client/register"
                className="text-customPurple-600 font-semibold hover:underline"
              >
                Create one here
              </Link>
            </motion.p>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClientLogin;
