"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";

export default function YoutubeIntro() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ background: "#0a0412" }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "rgba(112,12,235,0.12)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(63,12,145,0.1)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10 mx-auto w-11/12 py-16 md:w-10/12 md:py-24">
        <motion.div
          className="mb-10 text-center md:mb-14"
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
            Watch Our Story
          </div>
          <h2
            className="font-black text-white uppercase"
            style={{
              fontSize: "clamp(1.8rem, 5vw, 4rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            See Why Thousands Trust{" "}
            <span
              style={{
                background: `linear-gradient(135deg, #c084fc, ${PURPLE})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Kemchuta Homes
            </span>
          </h2>
          <p className="mx-auto mt-4 text-base text-gray-400 md:text-lg" style={{ maxWidth: 500 }}>
            Discover our estate developments, client stories, and investment
            opportunities
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(112,12,235,0.35), 0 0 0 1px rgba(112,12,235,0.2)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
              opacity: 0.15,
              borderRadius: 20,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
            <iframe
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
              }}
              src="https://www.youtube.com/embed/KUeJusSc-8I?si=WER0lrTN-VQtEA2Z&controls=1&rel=0&showinfo=0"
              title="Kemchuta Homes — Building Futures"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-12"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {["CAC Registered", "FG Approved Lands", "Bank-Backed Transactions", "Verified Titles"].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full"
                style={{ background: "rgba(112,12,235,0.2)" }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="#c084fc"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">{t}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
