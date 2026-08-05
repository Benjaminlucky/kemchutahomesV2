"use client";

import { useSyncExternalStore, type RefObject } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { MapPin, ArrowRight } from "lucide-react";
import type { Estate } from "@/lib/api";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const PURPLE_MID = "#8A2FF0";

const PURPOSE_COLORS: Record<string, { color: string; border: string }> = {
  Residential: { color: "#c084fc", border: "rgba(192,132,252,0.35)" },
  Commercial: { color: "#fb923c", border: "rgba(251,146,60,0.35)" },
  Investment: { color: "#34d399", border: "rgba(52,211,153,0.35)" },
};

// useSyncExternalStore, not useState+useEffect — there's nothing to
// subscribe to, this just needs the server/client snapshots to differ so
// React re-renders once hydration commits, without the setState-in-effect
// render cascade ESLint (react-hooks/set-state-in-effect) flags.
const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function SlideOverlay({
  estate,
  active,
  skipEntranceAnimation,
}: {
  estate: Estate;
  active: boolean;
  // True only until the carousel's first client-side render has committed —
  // this slide's overlay (including the LCP <h1>) must be visible in the
  // very first paint, not faded in after hydration. Every later activation
  // (slide change, or looping back to this same slide) still animates in
  // normally.
  skipEntranceAnimation: boolean;
}) {
  const ps = PURPOSE_COLORS[estate.purpose] || PURPOSE_COLORS.Residential;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={estate._id}
          initial={skipEntranceAnimation ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(24px, 5vw, 56px)", zIndex: 10 }}
        >
          <div className="hidden items-end justify-between gap-8 md:flex">
            <div style={{ maxWidth: 540 }}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 12px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid ${ps.border}`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: ps.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: ps.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {estate.purpose}
                  </span>
                </div>

                {estate.location && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <MapPin size={10} style={{ color: "rgba(255,255,255,0.5)" }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em" }}>{estate.location}</span>
                  </div>
                )}

                {estate.title && (
                  <div style={{ display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>{estate.title}</span>
                  </div>
                )}
              </div>

              <h1
                className="font-black text-white"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)", letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 0 10px", textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
              >
                {estate.estate}
              </h1>

              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", fontWeight: 600, margin: 0 }}>
                {estate.sqm} · 30% Initial Deposit
              </p>
            </div>

            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>
                Starting from
              </p>
              <p style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.05em", lineHeight: 1, margin: "0 0 4px", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                ₦{estate.price}
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>
                {estate.purpose} · {estate.category || "Land"}
              </p>
              <Link
                href={`/estate/${estate.slug}`}
                className="inline-flex items-center gap-2 font-black text-white uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  fontSize: 13,
                  padding: "14px 28px",
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE}, ${PURPLE_MID})`,
                  boxShadow: "0 8px 28px rgba(112,12,235,0.45)",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  display: "inline-flex",
                }}
              >
                Subscribe Now <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex flex-wrap items-center gap-2">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.08)", border: `1px solid ${ps.border}` }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: ps.color }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: ps.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{estate.purpose}</span>
              </div>
              {estate.location && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <MapPin size={9} style={{ color: "rgba(255,255,255,0.45)" }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{estate.location}</span>
                </div>
              )}
            </div>

            <h1 className="font-black text-white" style={{ fontSize: "clamp(1.6rem, 7vw, 2.5rem)", letterSpacing: "-0.04em", lineHeight: 1.1, margin: 0 }}>
              {estate.estate}
            </h1>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 1px" }}>
                  From
                </p>
                <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, margin: 0 }}>₦{estate.price}</p>
              </div>
              <Link
                href={`/estate/${estate.slug}`}
                className="flex items-center gap-1.5 font-black text-white"
                style={{
                  fontSize: 12,
                  padding: "12px 20px",
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
                  boxShadow: "0 6px 20px rgba(112,12,235,0.45)",
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                Subscribe <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type HeroCarouselProps = {
  estates: Estate[];
  realIndex: number;
  setRealIndex: (index: number) => void;
  prevRef: RefObject<HTMLButtonElement | null>;
  nextRef: RefObject<HTMLButtonElement | null>;
};

export default function HeroCarousel({ estates, realIndex, setRealIndex, prevRef, nextRef }: HeroCarouselProps) {
  // False on the server and on the first client render (matching, so no
  // hydration mismatch), true from the next render onward — see
  // SlideOverlay's skipEntranceAnimation prop.
  const hasMounted = useSyncExternalStore(noopSubscribe, getClientSnapshot, getServerSnapshot);

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay, EffectFade]}
      navigation={{}}
      onBeforeInit={(swiper) => {
        // Wire up the external prev/next buttons here rather than reading
        // ref.current in the navigation prop above — refs aren't safe to
        // read during render (they're null on first render anyway; Swiper
        // calls onBeforeInit after mount, once the refs are populated).
        if (typeof swiper.params.navigation === "object" && swiper.params.navigation) {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }
      }}
      pagination={{ clickable: true, el: ".hero-pagination", bulletClass: "hero-bullet", bulletActiveClass: "hero-bullet-active" }}
      autoplay={{ delay: 4500, disableOnInteraction: false }}
      effect="fade"
      loop
      onSlideChange={(swiper) => {
        setRealIndex(swiper.realIndex);
      }}
      className="hero__content"
      style={{ height: "100svh", minHeight: 600, maxHeight: 900 }}
    >
      {estates.map((estate, index) => (
        <SwiperSlide key={estate._id}>
          <div className="relative h-full w-full">
            <SafeImage
              src={estate.img}
              alt={estate.estate}
              fill
              sizes="100vw"
              priority={index === 0}
              style={{ objectFit: "cover" }}
              // Full-bleed slide, so the placeholder gets a proportionally
              // larger glyph. The gradient scrims below still sit on top of
              // it, keeping the headline and CTA legible either way.
              fallbackIconSize={64}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(5,0,15,0.92) 0%, rgba(5,0,15,0.45) 35%, rgba(5,0,15,0.1) 60%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to right, rgba(5,0,15,0.35) 0%, transparent 40%)",
                pointerEvents: "none",
              }}
            />

            <SlideOverlay estate={estate} active={realIndex === index} skipEntranceAnimation={!hasMounted} />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
