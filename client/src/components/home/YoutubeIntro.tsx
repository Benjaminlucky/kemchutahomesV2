"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import ReactDOM from "react-dom";
import { motion, useInView } from "framer-motion";
import { Play } from "lucide-react";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const VIDEO_ID = "KUeJusSc-8I";

// Preconnecting to these two origins costs a DNS/TCP/TLS handshake, not
// real bandwidth — safe to fire eagerly on hover/focus intent, well before
// the click that actually loads the (~800KB of JS) embed itself.
function preconnectYoutube() {
  ReactDOM.preconnect("https://www.youtube.com");
  ReactDOM.preconnect("https://www.google.com");
}

export default function YoutubeIntro() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  // The real <iframe> only mounts after a click. Lighthouse's trace on
  // production showed this section's raw embed loading its full player
  // bundle (~800KB of JS across three chunks, plus YouTube's own CSS/ad-
  // tech requests) during the initial page load — `loading="lazy"` alone
  // didn't stop it, since this section sits close enough to the top of the
  // page to fall inside the browser's lazy-load trigger distance even on a
  // cold, unscrolled load. A click-to-load facade (Google's own recommended
  // pattern for exactly this) means the only YouTube-hosted request before
  // an actual click is a single small thumbnail image.
  const [isPlaying, setIsPlaying] = useState(false);

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
            {isPlaying ? (
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
                src={`https://www.youtube.com/embed/${VIDEO_ID}?si=WER0lrTN-VQtEA2Z&controls=1&rel=0&showinfo=0&autoplay=1`}
                title="Kemchuta Homes — Building Futures"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                onPointerEnter={preconnectYoutube}
                onFocus={preconnectYoutube}
                aria-label="Play video: Kemchuta Homes — Building Futures"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                  background: "none",
                }}
              >
                <Image
                  src={`https://i.ytimg.com/vi/${VIDEO_ID}/sddefault.jpg`}
                  alt="Kemchuta Homes — Building Futures video thumbnail"
                  fill
                  sizes="(max-width: 768px) 100vw, 900px"
                  style={{ objectFit: "cover" }}
                />
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(5,0,15,0.35)",
                  }}
                >
                  <span
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
                      boxShadow: "0 8px 32px rgba(112,12,235,0.5)",
                    }}
                  >
                    <Play size={30} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
                  </span>
                </span>
              </button>
            )}
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
