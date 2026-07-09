import React, { useRef } from "react";
import { whychooseus } from "../../../data";
import { motion, useInView } from "framer-motion";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const PURPLE_MID = "#8A2FF0";

function Whychoose() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
    },
  });

  const slideLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
    },
  };
  const slideRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
    },
  };

  return (
    <section
      ref={ref}
      className="whychoose__section w-full relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 50%, ${PURPLE_MID} 100%)`,
      }}
    >
      {/* Architectural texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('./assets/achitectutural-line-draft.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
          pointerEvents: "none",
        }}
      />

      {/* Top + bottom edge blobs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "30%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "20%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div className="whychoose__wrapper w-11/12 md:w-10/12 mx-auto py-20 md:py-32 relative z-10">
        {/* ── Section header ──────────────────────────────────────── */}
        <motion.div
          className="text-center mb-14 md:mb-20"
          variants={fadeUp(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Our Advantage
          </div>
          <h2
            className="font-black uppercase text-white"
            style={{
              fontSize: "clamp(2rem, 5.5vw, 4.5rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Why Choose{" "}
            <span style={{ color: "rgba(255,255,255,0.65)" }}>Kemchuta</span>{" "}
            Homes
          </h2>
        </motion.div>

        {/* ── Two-column layout ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — image */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Floating badge */}
              <div
                className="absolute -top-5 -right-5 z-20 px-4 py-3 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  boxShadow: "0 12px 40px rgba(112,12,235,0.25)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#9ca3af",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Trusted Since
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: PURPLE,
                    letterSpacing: "-0.04em",
                  }}
                >
                  2018
                </p>
              </div>

              <div
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 40px 80px rgba(0,0,0,0.3)",
                }}
              >
                <img
                  src="./assets/businessWoman.webp"
                  alt="Kemchuta Homes Professional"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </motion.div>

          {/* Right — perks card */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.97)",
                borderRadius: 24,
                padding: "40px 36px",
                boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
              }}
            >
              <p
                className="text-gray-500 text-sm leading-relaxed mb-8"
                style={{ maxWidth: 420 }}
              >
                Experience unparalleled expertise, dedication, and innovative
                solutions in real estate. Kemchuta Homes is your trusted partner
                for securing profitable investments across Nigeria.
              </p>

              <div className="space-y-5">
                {whychooseus.map((perk, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.6,
                      delay: 0.3 + i * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {/* Icon pill */}
                    <div
                      className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: `rgba(112,12,235,0.08)`,
                        border: "1px solid rgba(112,12,235,0.12)",
                      }}
                    >
                      {React.createElement(perk.icon, {
                        size: 18,
                        style: { color: PURPLE },
                      })}
                    </div>
                    <div>
                      <h4
                        className="font-black text-gray-900 mb-0.5"
                        style={{
                          fontSize: "clamp(0.85rem, 1.5vw, 1.05rem)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {perk.why}
                      </h4>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {perk.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA inside card */}
              <div className="mt-10 pt-6 border-t border-gray-100">
                <a
                  href="/developments"
                  className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider transition-all hover:gap-3"
                  style={{ color: PURPLE }}
                >
                  Explore Our Estates
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7h10M7 2l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Whychoose;
