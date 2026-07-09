import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";

const stats = [
  { value: "500+", label: "Active Realtors" },
  { value: "₦2B+", label: "Deals Closed" },
  { value: "15+", label: "Estates Available" },
  { value: "5,000+", label: "Families Housed" },
];

function Homeintro() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.15 });

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
    },
  });

  return (
    <section className="homeIntro__section w-full relative overflow-hidden">
      {/* Subtle background blobs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(112,12,235,0.04)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-5%",
          left: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(112,12,235,0.03)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={ref}
        className="homeIntro__wrapper py-20 md:py-32 w-11/12 md:w-10/12 mx-auto"
      >
        {/* ── Eyebrow badge ───────────────────────────────────────── */}
        <motion.div
          className="flex justify-center mb-6"
          variants={fadeUp(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{
              background: "rgba(112,12,235,0.07)",
              border: "1px solid rgba(112,12,235,0.18)",
              color: PURPLE,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: PURPLE }}
            />
            Nigeria's Leading Real Estate Company
          </div>
        </motion.div>

        {/* ── Headline ─────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-8"
          variants={fadeUp(0.1)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <h1
            className="font-black uppercase leading-none tracking-tight"
            style={{
              fontSize: "clamp(2rem, 7vw, 6rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            Building Futures,
          </h1>
          <h1
            className="font-black uppercase leading-none tracking-tight"
            style={{
              fontSize: "clamp(2rem, 7vw, 6rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            One{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Estate
            </span>{" "}
            at a Time
          </h1>
        </motion.div>

        {/* ── Description ──────────────────────────────────────────── */}
        <motion.p
          className="text-center text-gray-500 mx-auto leading-relaxed"
          style={{ maxWidth: 640, fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
          variants={fadeUp(0.2)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          At Kemchuta Homes Limited, we specialise in providing prime estate
          lands perfect for building your future. Whether you're an investor or
          an individual ready to create a home — your journey to land ownership
          starts here.
        </motion.p>

        {/* ── CTA buttons ──────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          variants={fadeUp(0.3)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <a
            href="/developments"
            className="px-8 py-4 rounded-full font-bold text-white text-sm uppercase tracking-widest transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
              boxShadow: "0 8px 28px rgba(112,12,235,0.35)",
            }}
          >
            Explore Estates
          </a>
          <a
            href="/contact"
            className="px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:bg-customPurple-50"
            style={{
              border: `2px solid rgba(112,12,235,0.3)`,
              color: PURPLE,
            }}
          >
            Talk to an Expert
          </a>
        </motion.div>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <motion.div
          className="flex items-center gap-4 my-16 md:my-20"
          variants={fadeUp(0.35)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200" />
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
            }}
          />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200" />
        </motion.div>

        {/* ── Stats strip ──────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp(0.4 + i * 0.08)}
              className="text-center relative"
            >
              {i > 0 && (
                <div
                  className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-12"
                  style={{ background: "rgba(112,12,235,0.12)" }}
                />
              )}
              <p
                className="font-black leading-none mb-1"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  letterSpacing: "-0.04em",
                  background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Homeintro;
