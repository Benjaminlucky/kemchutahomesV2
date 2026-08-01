"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Estate } from "@/lib/api";
import "./hero.css";

// Swiper (the `swiper` package, `swiper/react`, `swiper/modules` and its CSS)
// lives entirely in HeroCarousel. Dynamically importing it from inside this
// Client Component boundary code-splits Swiper's JS into its own chunk instead
// of the homepage's initial/shared bundle (PRD FR-2 "dynamic-import heavy
// client islands"). We keep the default `ssr: true` — Hero is the LCP element
// and its first-slide estate content + priority image are SEO-critical, so the
// carousel must still server-render into the initial HTML; only the JS payload
// is split out.
const HeroCarousel = dynamic(() => import("./HeroCarousel"));

export default function Hero({ estates }: { estates: Estate[] }) {
  const [realIndex, setRealIndex] = useState(0);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  if (estates.length === 0) return null;

  return (
    <motion.div
      className="hero__wrapper relative w-full"
      // The LCP element lives inside this wrapper — animating it in from
      // opacity:0 gates the browser's first paint of that content behind
      // JS hydration, which is exactly what tanked LCP (measured 14.3s
      // "Render Delay" in Lighthouse). initial={false} skips the entrance
      // transition on mount so it renders visible immediately; nothing else
      // ever remounts this wrapper, so there's no repeat-visit case where a
      // reveal animation would have been wanted anyway.
      initial={false}
      animate={{ opacity: 1 }}
      style={{ overflow: "hidden" }}
    >
      <HeroCarousel estates={estates} realIndex={realIndex} setRealIndex={setRealIndex} prevRef={prevRef} nextRef={nextRef} />

      <button
        ref={prevRef}
        aria-label="Previous slide"
        className="absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition-all duration-200"
        style={{
          left: "clamp(12px, 3vw, 32px)",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
        }}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        ref={nextRef}
        aria-label="Next slide"
        className="absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition-all duration-200"
        style={{
          right: "clamp(12px, 3vw, 32px)",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
        }}
      >
        <ChevronRight size={20} />
      </button>

      <div
        className="absolute z-20 flex items-center gap-1.5 rounded-full"
        style={{
          top: "clamp(16px, 3vw, 28px)",
          right: "clamp(16px, 3vw, 80px)",
          padding: "6px 14px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(10px)",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
          {String(realIndex + 1).padStart(2, "0")}
        </span>
        <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.25)", display: "inline-block" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>{String(estates.length).padStart(2, "0")}</span>
      </div>

      <div className="absolute z-20" style={{ top: "clamp(16px, 3vw, 28px)", left: "clamp(16px, 3vw, 32px)" }}>
        <Image src="/assets/logoWhite.png" alt="Kemchuta Homes" width={140} height={36} style={{ height: 36, width: "auto" }} priority />
      </div>

      <div
        className="hero-pagination absolute z-20 flex items-center gap-1.5"
        style={{ bottom: "clamp(18px, 3vw, 28px)", left: "50%", transform: "translateX(-50%)" }}
      />

      <style>{`
        .hero-bullet {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          cursor: pointer; display: inline-block;
          transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .hero-bullet-active {
          width: 28px; border-radius: 4px;
          background: #700CEB;
          box-shadow: 0 0 12px rgba(112,12,235,0.7);
        }
        .hero__content { width: 100%; }
        .swiper-slide { height: 100% !important; }
      `}</style>
    </motion.div>
  );
}
