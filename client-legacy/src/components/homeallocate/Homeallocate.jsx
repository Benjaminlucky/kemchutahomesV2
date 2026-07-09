import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { allocate } from "../../../data";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";

function Homeallocate() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.08 });

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
    },
  });

  return (
    <section
      ref={ref}
      className="allocate__section w-full relative overflow-hidden"
      style={{
        background: "#f8f5ff",
        paddingTop: "5rem",
        paddingBottom: "7rem",
      }}
    >
      {/* Subtle background blob */}
      <div
        style={{
          position: "absolute",
          top: "-5%",
          right: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(112,12,235,0.05)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div className="allocate__wrapper w-11/12 md:w-10/12 mx-auto relative z-10">
        {/* ── Section header ────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4"
          variants={fadeUp(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{
                background: "rgba(112,12,235,0.07)",
                border: "1px solid rgba(112,12,235,0.15)",
                color: PURPLE,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: PURPLE }}
              />
              On the Ground
            </div>
            <h2
              className="font-black uppercase"
              style={{
                fontSize: "clamp(2rem, 5.5vw, 4rem)",
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                color: "#0a0412",
              }}
            >
              Updates &{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Activities
              </span>
            </h2>
          </div>
          <p
            className="text-gray-500 text-sm md:text-base md:text-right"
            style={{ maxWidth: 300 }}
          >
            Real developments, real progress — see what's happening across our
            estates right now
          </p>
        </motion.div>

        {/* ── Photo grid ────────────────────────────────────────────── */}
        <div className="updates grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {allocate.map((update, index) => {
            // Make first and fourth items tall (masonry feel)
            const isTall = index === 0 || index === 3;
            return (
              <motion.div
                className={`update relative overflow-hidden rounded-2xl group ${isTall ? "row-span-2" : ""}`}
                key={index}
                style={{ gridRow: isTall ? "span 2" : "span 1" }}
                variants={fadeUp(0.1 + index * 0.06)}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
              >
                <div
                  className="update__content w-full h-full"
                  style={{
                    minHeight: isTall ? 420 : 200,
                    position: "relative",
                  }}
                >
                  <img
                    src={update.img}
                    alt={`Activity ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    style={{ display: "block", minHeight: "inherit" }}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                  />

                  {/* Gradient overlay on hover */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(to top, rgba(112,12,235,0.6) 0%, rgba(112,12,235,0.1) 60%, transparent 100%)`,
                    }}
                  />

                  {/* Activity badge */}
                  <div
                    className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "rgba(112,12,235,0.85)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    Live Update
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom CTA ────────────────────────────────────────────── */}
        <motion.div
          className="flex justify-center mt-12"
          variants={fadeUp(0.6)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <a
            href="/developments"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-sm uppercase tracking-widest transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
              boxShadow: "0 8px 28px rgba(112,12,235,0.35)",
            }}
          >
            View All Developments
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7h10M7 2l5 5-5 5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default Homeallocate;
