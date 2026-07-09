import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ToastContainer, toast } from "react-toastify";
import { Mail } from "lucide-react";

const panelVariant = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.2 },
  },
};

const fieldVariant = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  React.useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/realtors/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSent(true);
      toast.success(data.message);
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
      {/* Animated background blobs — identical to Login */}
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
        variants={panelVariant}
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
            Forgot <br /> Your <br /> Password?
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
            No worries — it happens to the best of us. Enter your email and
            we'll send you a secure reset link within seconds.
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
            autoClose={4000}
            hideProgressBar
            newestOnTop
            closeOnClick
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
            <h2 className="text-3xl xl:text-4xl font-bold text-gray-900">
              Reset Password
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Enter the email linked to your account and we'll send you a reset
              link.
            </p>
          </motion.div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-customPurple-50 border border-customPurple-200 rounded-xl p-6 text-center"
            >
              <div className="w-14 h-14 bg-customPurple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-white" size={26} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Check your inbox
              </h3>
              <p className="text-gray-500 text-sm">
                If{" "}
                <span className="font-medium text-customPurple-600">
                  {email}
                </span>{" "}
                is registered, you'll receive a reset link shortly. Check your
                spam folder too.
              </p>

              <a
                href="/login"
                className="mt-5 inline-block text-sm text-customPurple-600 font-medium hover:underline"
              >
                ← Back to login
              </a>
            </motion.div>
          ) : (
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
              <motion.div variants={fieldVariant}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-customPurple-600 focus:outline-none"
                />
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
                  "Send Reset Link"
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
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;
