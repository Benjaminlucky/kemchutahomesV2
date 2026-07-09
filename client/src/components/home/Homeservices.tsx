"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { services } from "@/lib/homeData";

const PURPLE = "#700CEB";
const PURPLE_MID = "#8A2FF0";

const CARD_STYLES = [
  { from: "#1a0440", to: "#3F0C91", accent: "#7c3aed" },
  { from: "#2d0670", to: PURPLE, accent: "#9333ea" },
  { from: "#3b0894", to: PURPLE_MID, accent: "#a855f7" },
];

export default function Homeservices() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ background: "#060111" }}
    >
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

      <div className="relative z-10 mx-auto w-11/12 py-20 md:w-10/12 md:py-32">
        <motion.div
          className="mb-16 text-center md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
            style={{
              background: "rgba(112,12,235,0.2)",
              border: "1px solid rgba(112,12,235,0.35)",
              color: "#c084fc",
            }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
            What We Offer
          </div>
          <h2
            className="font-black text-white uppercase"
            style={{ fontSize: "clamp(2rem, 6vw, 5rem)", letterSpacing: "-0.04em", lineHeight: 1.05 }}
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
          <p className="mx-auto mt-4 text-base text-gray-500 md:text-lg" style={{ maxWidth: 480 }}>
            Comprehensive real estate solutions tailored to investors and home
            seekers across Nigeria
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {services.map((service, index) => {
            const cs = CARD_STYLES[index] || CARD_STYLES[0];
            return (
              <motion.div
                key={service.service}
                initial={{ opacity: 0, y: 50, scale: 0.96 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.15 }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                style={{
                  background: `linear-gradient(145deg, ${cs.from} 0%, ${cs.to} 100%)`,
                  borderRadius: 20,
                  padding: "36px 32px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 20px 60px rgba(112,12,235,0.25)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
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

                <div
                  className="relative z-10 mb-6 flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  0{index + 1}
                </div>

                <h4
                  className="relative z-10 mb-4 font-black text-white uppercase"
                  style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)", letterSpacing: "-0.02em", lineHeight: 1.2 }}
                >
                  {service.service}
                </h4>

                <div
                  className="relative z-10 mb-4 h-0.5 w-10 rounded-full"
                  style={{ background: `linear-gradient(to right, ${cs.accent}, transparent)` }}
                />

                <p className="relative z-10 text-sm leading-relaxed text-gray-400" style={{ lineHeight: 1.75 }}>
                  {service.description}
                </p>

                <div className="relative z-10 mt-8">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase transition-colors hover:text-white"
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
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
