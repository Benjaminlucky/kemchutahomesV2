import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ToastContainer, toast } from "react-toastify";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

const fieldVariant = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  React.useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  // Pull token from ?token=xxx in the URL
  const token = new URLSearchParams(window.location.search).get("token");

  const strength = (() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1)
      return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
    if (score === 2)
      return { label: "Fair", color: "bg-yellow-400", width: "w-2/4" };
    if (score === 3)
      return { label: "Good", color: "bg-blue-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("No reset token found. Please request a new reset link.");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/realtors/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
      toast.success(data.message);
      // Redirect to login after 2.5 s
      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
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
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,0,0,0.08),_transparent_70%)] pointer-events-none"
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

      {/* Left Panel */}
      <motion.div
        className="md:w-2/3 bg-customPurple-500 text-white flex flex-col justify-center px-10 py-16 relative overflow-hidden"
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
        <div className="relative z-10 lg:ml-36 mt-auto mb-10">
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
            Create <br /> A New <br /> Password
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
            Choose something strong and memorable. Your account security
            matters.
          </motion.p>
        </div>
      </motion.div>

      {/* Right Form */}
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
            theme="colored"
          />

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Password Updated!
              </h3>
              <p className="text-gray-500 text-sm">Redirecting you to login…</p>
            </motion.div>
          ) : (
            <>
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
                <h2 className="text-3xl xl:text-4xl font-bold text-gray-900">
                  New Password
                </h2>
                <p className="text-gray-500 text-sm mt-2">
                  Must be at least 8 characters. Mix letters, numbers & symbols
                  for best security.
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
                {/* New Password */}
                <motion.div variants={fieldVariant}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm focus:ring-2 focus:ring-customPurple-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-customPurple-600 transition-colors"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${strength.color} ${strength.width}`}
                          initial={{ width: 0 }}
                          animate={{ width: strength.width }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {strength.label}
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={fieldVariant}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      className={`w-full border rounded-lg px-4 py-3 pr-10 text-sm focus:ring-2 focus:ring-customPurple-600 focus:outline-none ${
                        confirm && confirm !== password
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-customPurple-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords don't match
                    </p>
                  )}
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-customPurple-500 text-white py-3 rounded-lg font-semibold text-base hover:bg-customPurple-700 transition flex items-center justify-center shadow-lg hover:shadow-[0_0_25px_rgba(112,12,235,0.4)]"
                  variants={fieldVariant}
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
                    "Reset Password"
                  )}
                </motion.button>

                <motion.div className="text-center" variants={fieldVariant}>
                  <a
                    href="/login"
                    className="text-customPurple-600 text-sm font-medium hover:underline"
                  >
                    ← Back to login
                  </a>
                </motion.div>
              </motion.form>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResetPassword;
