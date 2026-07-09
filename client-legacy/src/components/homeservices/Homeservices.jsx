import React, { useRef } from "react";
import { services } from "../../../data";
import { motion, useInView } from "framer-motion";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const PURPLE_MID = "#8A2FF0";

// Gradient shades per card index — deep to bright
const CARD_STYLES = [
  { from: "#1a0440", to: "#3F0C91", accent: "#7c3aed" },
  { from: "#2d0670", to: PURPLE, accent: "#9333ea" },
  { from: "#3b0894", to: PURPLE_MID, accent: "#a855f7" },
];

function Homeservices() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="service__section w-full relative overflow-hidden"
      style={{ background: "#060111" }}
    >
      {/* Background texture blobs */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          right: "-8%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "rgba(112,12,235,0.08)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(63,12,145,0.06)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <div className="service__wrapper w-11/12 md:w-10/12 mx-auto py-20 md:py-32 relative z-10">
        {/* ── Section header ─────────────────────────────────────── */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{
              background: "rgba(112,12,235,0.2)",
              border: "1px solid rgba(112,12,235,0.35)",
              color: "#c084fc",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            What We Offer
          </div>
          <h2
            className="font-black uppercase text-white"
            style={{
              fontSize: "clamp(2rem, 6vw, 5rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            Our{" "}
            <span
              style={{
                background: `linear-gradient(135deg, #c084fc, ${PURPLE})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Services
            </span>
          </h2>
          <p
            className="text-gray-500 mt-4 text-base md:text-lg mx-auto"
            style={{ maxWidth: 480 }}
          >
            Comprehensive real estate solutions tailored to investors and home
            seekers across Nigeria
          </p>
        </motion.div>

        {/* ── Service cards ──────────────────────────────────────── */}
        <div className="service__detail grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => {
            const cs = CARD_STYLES[index] || CARD_STYLES[0];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.96 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                  delay: index * 0.15,
                }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                style={{
                  background: `linear-gradient(145deg, ${cs.from} 0%, ${cs.to} 100%)`,
                  borderRadius: 20,
                  padding: "36px 32px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: `0 20px 60px rgba(112,12,235,0.25)`,
                  position: "relative",
                  overflow: "hidden",
                  cursor: "default",
                }}
              >
                {/* Card shimmer blob */}
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    background: `${cs.accent}22`,
                    filter: "blur(40px)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: -30,
                    left: -20,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.03)",
                    pointerEvents: "none",
                  }}
                />

                {/* Card number */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black mb-6 relative z-10"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  0{index + 1}
                </div>

                {/* Title */}
                <h4
                  className="font-black uppercase text-white mb-4 relative z-10"
                  style={{
                    fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {service.service}
                </h4>

                {/* Divider */}
                <div
                  className="w-10 h-0.5 mb-4 rounded-full relative z-10"
                  style={{
                    background: `linear-gradient(to right, ${cs.accent}, transparent)`,
                  }}
                />

                {/* Description */}
                <p
                  className="text-gray-400 text-sm leading-relaxed relative z-10"
                  style={{ lineHeight: 1.75 }}
                >
                  {service.description}
                </p>

                {/* Bottom tag */}
                <div className="mt-8 relative z-10">
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors hover:text-white"
                    style={{ color: cs.accent }}
                  >
                    Learn more
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6h8M6 2l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Homeservices;
