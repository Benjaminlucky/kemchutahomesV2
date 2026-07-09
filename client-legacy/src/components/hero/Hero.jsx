import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchEstates } from "../../services/estateServices.js";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "./hero.css";

// ── Brand ──────────────────────────────────────────────────────────────────────
const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const PURPLE_MID = "#8A2FF0";

// Purpose colour map — matches estate.purpose enum
const PURPOSE_COLORS = {
  Residential: { color: "#c084fc", border: "rgba(192,132,252,0.35)" },
  Commercial: { color: "#fb923c", border: "rgba(251,146,60,0.35)" },
  Investment: { color: "#34d399", border: "rgba(52,211,153,0.35)" },
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        height: "100svh",
        minHeight: 600,
        maxHeight: 900,
        background: "#0a0115",
      }}
    >
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, #0a0115 25%, #1a0430 50%, #0a0115 75%)",
          backgroundSize: "200% 100%",
          animation: "heroShimmer 1.6s ease-in-out infinite",
        }}
      />
      {/* Bottom panel skeleton */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          padding: "32px 5%",
          background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
        }}
      >
        <div className="animate-pulse space-y-3" style={{ maxWidth: 560 }}>
          <div
            style={{
              height: 12,
              width: 120,
              borderRadius: 6,
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            style={{
              height: 44,
              width: "80%",
              borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
            }}
          />
          <div
            style={{
              height: 16,
              width: "55%",
              borderRadius: 6,
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div
            style={{
              height: 48,
              width: 180,
              borderRadius: 10,
              background: "rgba(112,12,235,0.2)",
              marginTop: 16,
            }}
          />
        </div>
      </div>
      <style>{`@keyframes heroShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

// ── Slide content overlay ──────────────────────────────────────────────────────
function SlideOverlay({ estate, active }) {
  const ps = PURPOSE_COLORS[estate.purpose] || PURPOSE_COLORS.Residential;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={estate._id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "clamp(24px, 5vw, 56px)",
            zIndex: 10,
          }}
        >
          {/* Desktop layout */}
          <div className="hidden md:flex items-end justify-between gap-8">
            {/* Left — estate info */}
            <div style={{ maxWidth: 540 }}>
              {/* Purpose + location chips */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
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
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: ps.color, flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: ps.color,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
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
                    <MapPin
                      size={10}
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.65)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {estate.location}
                    </span>
                  </div>
                )}

                {estate.title && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.5)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {estate.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Estate name */}
              <h1
                className="text-white font-black"
                style={{
                  fontSize: "clamp(2rem, 4.5vw, 3.8rem)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.05,
                  margin: "0 0 10px",
                  textShadow: "0 2px 24px rgba(0,0,0,0.5)",
                }}
              >
                {estate.estate}
              </h1>

              {/* Size */}
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.55)",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {estate.sqm} ·{" "}
                {estate.depositPercentage || "30% Initial Deposit"}
              </p>
            </div>

            {/* Right — price + CTA */}
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  margin: "0 0 4px",
                }}
              >
                Starting from
              </p>
              <p
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.5rem)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  margin: "0 0 4px",
                  textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                ₦{estate.price}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  margin: "0 0 20px",
                }}
              >
                {estate.purpose} · {estate.category || "Land"}
              </p>
              <Link
                to={`/estate/${estate.slug}`}
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
                  transition: "box-shadow 0.3s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 14px 40px rgba(112,12,235,0.65)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 28px rgba(112,12,235,0.45)";
                }}
              >
                Subscribe Now <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="flex md:hidden flex-col gap-3">
            {/* Chips row */}
            <div className="flex items-center gap-2 flex-wrap">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${ps.border}`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: ps.color }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: ps.color,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {estate.purpose}
                </span>
              </div>
              {estate.location && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <MapPin
                    size={9}
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {estate.location}
                  </span>
                </div>
              )}
            </div>

            {/* Name */}
            <h1
              className="text-white font-black"
              style={{
                fontSize: "clamp(1.6rem, 7vw, 2.5rem)",
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {estate.estate}
            </h1>

            {/* Price + CTA row */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    margin: "0 0 1px",
                  }}
                >
                  From
                </p>
                <p
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  ₦{estate.price}
                </p>
              </div>
              <Link
                to={`/estate/${estate.slug}`}
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

// ── Main Component ─────────────────────────────────────────────────────────────
function Hero() {
  // ── All original state — unchanged ────────────────────────────────────────
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Active slide tracking for overlay animation ───────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);
  const [realIndex, setRealIndex] = useState(0);

  // Custom nav refs
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // ── Original fetch — unchanged (GET /api/estates?limit=5&active=true) ─────
  useEffect(() => {
    fetchEstates({ limit: 5, active: "true" })
      .then((data) => {
        const list = data?.estates || [];
        setEstates(list);
      })
      .catch((err) => {
        console.error("Hero fetch failed:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <HeroSkeleton />;
  if (error || estates.length === 0) return null;

  return (
    <motion.div
      className="hero__wrapper w-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: "hidden" }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        pagination={{
          clickable: true,
          el: ".hero-pagination",
          bulletClass: "hero-bullet",
          bulletActiveClass: "hero-bullet-active",
        }}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        effect="fade"
        loop
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
          setRealIndex(swiper.realIndex);
        }}
        className="hero__content"
        style={{ height: "100svh", minHeight: 600, maxHeight: 900 }}
      >
        {estates.map((estate, index) => (
          <SwiperSlide key={estate._id || index}>
            <div className="heroDataWrapper relative w-full h-full">
              {/* ── Full-height estate image ──────────────────────── */}
              <img
                src={estate.img}
                alt={estate.estate}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />

              {/* ── Multi-layer gradient overlay ─────────────────── */}
              {/* Bottom — info panel */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(5,0,15,0.92) 0%, rgba(5,0,15,0.45) 35%, rgba(5,0,15,0.1) 60%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />
              {/* Left edge vignette */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to right, rgba(5,0,15,0.35) 0%, transparent 40%)",
                  pointerEvents: "none",
                }}
              />

              {/* ── Animated slide content overlay ───────────────── */}
              <SlideOverlay estate={estate} active={realIndex === index} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ── Custom nav arrows ─────────────────────────────────────── */}
      <button
        ref={prevRef}
        aria-label="Previous slide"
        style={{
          position: "absolute",
          left: "clamp(12px, 3vw, 32px)",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          color: "#fff",
          cursor: "pointer",
          transition: "background 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `rgba(112,12,235,0.45)`;
          e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
        }}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        ref={nextRef}
        aria-label="Next slide"
        style={{
          position: "absolute",
          right: "clamp(12px, 3vw, 32px)",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          color: "#fff",
          cursor: "pointer",
          transition: "background 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `rgba(112,12,235,0.45)`;
          e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
        }}
      >
        <ChevronRight size={20} />
      </button>

      {/* ── Slide counter — top right ─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "clamp(16px, 3vw, 28px)",
          right: "clamp(16px, 3vw, 80px)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 20,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(10px)",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          {String(realIndex + 1).padStart(2, "0")}
        </span>
        <span
          style={{
            width: 1,
            height: 12,
            background: "rgba(255,255,255,0.25)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {String(estates.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Logo watermark — top left ─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "clamp(16px, 3vw, 28px)",
          left: "clamp(16px, 3vw, 32px)",
          zIndex: 20,
        }}
      >
        <img
          src="/assets/logoWhite.png"
          alt="Kemchuta Homes"
          style={{ height: 36, objectFit: "contain" }}
          loading="eager"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>

      {/* ── Pill pagination ───────────────────────────────────────── */}
      <div
        className="hero-pagination"
        style={{
          position: "absolute",
          bottom: "clamp(18px, 3vw, 28px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      />

      {/* Pagination + nav CSS */}
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

export default Hero;
