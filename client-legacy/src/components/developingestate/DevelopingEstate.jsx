import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Maximize2, Building2, ArrowRight } from "lucide-react";
import { fetchEstates } from "../../services/estateServices.js";
import BookInspectionModal from "../inspection/BookInspectionModal.jsx";

// ── Brand ──────────────────────────────────────────────────────────────────────
const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";

// Purpose badge colours — map to estate.purpose enum values
const PURPOSE_COLORS = {
  Residential: {
    bg: "rgba(112,12,235,0.18)",
    color: "#c084fc",
    border: "rgba(112,12,235,0.3)",
  },
  Commercial: {
    bg: "rgba(234,88,12,0.15)",
    color: "#fb923c",
    border: "rgba(234,88,12,0.28)",
  },
  Investment: {
    bg: "rgba(5,150,105,0.15)",
    color: "#34d399",
    border: "rgba(5,150,105,0.28)",
  },
};

// ── Skeleton card ──────────────────────────────────────────────────────────────
function EstateSkeleton() {
  return (
    <div
      style={{
        borderRadius: 20,
        overflow: "hidden",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="animate-pulse"
        style={{ height: 240, background: "rgba(255,255,255,0.06)" }}
      />
      <div style={{ padding: "18px 20px 22px" }} className="space-y-3">
        <div
          className="animate-pulse rounded-lg"
          style={{
            height: 11,
            width: "38%",
            background: "rgba(255,255,255,0.07)",
          }}
        />
        <div
          className="animate-pulse rounded-lg"
          style={{
            height: 20,
            width: "72%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <div
          className="animate-pulse rounded-lg"
          style={{
            height: 13,
            width: "52%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div className="flex gap-2 pt-2">
          <div
            className="animate-pulse rounded-lg"
            style={{
              height: 28,
              width: 70,
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div
            className="animate-pulse rounded-lg"
            style={{
              height: 28,
              width: 64,
              background: "rgba(255,255,255,0.04)",
            }}
          />
        </div>
        <div
          className="animate-pulse rounded-xl"
          style={{
            height: 44,
            marginTop: 8,
            background: "rgba(112,12,235,0.12)",
          }}
        />
      </div>
    </div>
  );
}

// ── Individual estate card ─────────────────────────────────────────────────────
function EstateCard({ estate, index, isInView, onBook }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const ps = PURPOSE_COLORS[estate.purpose] || PURPOSE_COLORS.Residential;

  const slideIn = {
    hidden: {
      opacity: 0,
      x: index % 3 === 0 ? -60 : index % 3 === 1 ? 60 : 0,
      y: index % 3 === 2 ? 60 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.12,
      },
    },
  };

  return (
    <motion.article
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={slideIn}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className="group"
      style={{
        borderRadius: 20,
        overflow: "hidden",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Image block ──────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          height: 240,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Shimmer while loading */}
        {!imgLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: "rgba(255,255,255,0.06)", zIndex: 2 }}
          />
        )}

        <img
          src={estate.img}
          alt={estate.estate}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.65s cubic-bezier(0.22,1,0.36,1)",
            opacity: imgLoaded ? 1 : 0,
          }}
          className="group-hover:scale-110"
        />

        {/* Dark gradient overlay — bottom-weighted */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,1,21,0.92) 0%, rgba(10,1,21,0.15) 55%, transparent 100%)",
          }}
        />

        {/* Purpose pill — top left */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            padding: "4px 11px",
            borderRadius: 20,
            background: ps.bg,
            border: `1px solid ${ps.border}`,
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: ps.color,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {estate.purpose}
          </span>
        </div>

        {/* Title type — top right */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            padding: "4px 11px",
            borderRadius: 20,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.05em",
            }}
          >
            {estate.title}
          </span>
        </div>

        {/* Price overlay — bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "10px 16px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: "0 0 1px",
                }}
              >
                Starting from
              </p>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                ₦{estate.price}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.5)",
                  margin: "0 0 1px",
                }}
              >
                {estate.depositPercentage || "30% Initial Deposit"}
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#c084fc",
                  margin: 0,
                }}
              >
                {estate.sqm}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card body ────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "18px 20px 22px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Name */}
        <h4
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            margin: "0 0 7px",
          }}
        >
          {estate.estate}
        </h4>

        {/* Location */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 12,
          }}
        >
          <MapPin
            size={11}
            style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.45)",
              fontWeight: 600,
            }}
          >
            {estate.address ? `${estate.address}, ` : ""}
            {estate.location}
          </span>
        </div>

        {/* Category + sqm chips */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            paddingBottom: 14,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 10px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Building2 size={9} style={{ color: "rgba(255,255,255,0.35)" }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {estate.category}
            </span>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 10px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Maximize2 size={9} style={{ color: "rgba(255,255,255,0.35)" }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {estate.sqm}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            margin: "0 0 14px",
          }}
        />

        {/* Action row */}
        <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
          {/* View details — uses GET /api/estates/slug/:slug route */}
          <Link
            to={`/estate/${estate.slug}`}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "11px 0",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.65)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.65)";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
          >
            View Details
          </Link>

          {/* Book Inspection — original handler unchanged */}
          <button
            onClick={() => onBook(estate)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "11px 0",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 800,
              color: "#fff",
              background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(112,12,235,0.35)",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 8px 28px rgba(112,12,235,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(112,12,235,0.35)";
            }}
          >
            Book Inspection
          </button>
        </div>
      </div>
    </motion.article>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function DevelopingEstate() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.08 });

  // ── All original state — unchanged ────────────────────────────────────────
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModal] = useState(false);
  const [selected, setSelected] = useState({ name: "", id: null });

  // ── Original fetch — unchanged
  // Calls GET /api/estates?limit=3&active=true
  // Returns { estates: [...], total, page, pages }
  useEffect(() => {
    fetchEstates({ limit: 3, active: "true" })
      .then((d) => setEstates(d?.estates || []))
      .catch(() => setEstates([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Original booking handler — unchanged ──────────────────────────────────
  const openBooking = (estate) => {
    setSelected({ name: estate.estate, id: estate._id });
    setModal(true);
  };

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
    },
  });

  return (
    <section
      ref={ref}
      className="developing__container w-full relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0a0115 0%, #0d0120 100%)",
        paddingTop: "5rem",
        paddingBottom: "6rem",
      }}
    >
      {/* ── Background blobs ────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "-8%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(112,12,235,0.08)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "0%",
          left: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(63,12,145,0.07)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      {/* Grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.3,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="developing__wrapper w-11/12 md:w-10/12 mx-auto relative z-10">
        {/* ── Section header ───────────────────────────────────────── */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6"
          variants={fadeUp(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{
                background: "rgba(112,12,235,0.2)",
                border: "1px solid rgba(112,12,235,0.35)",
                color: "#c084fc",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Live Developments
            </div>

            <h2
              className="font-black uppercase text-white"
              style={{
                fontSize: "clamp(2rem,5.5vw,4rem)",
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
              }}
            >
              Fast{" "}
              <span
                style={{
                  background: `linear-gradient(135deg,#c084fc,${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Developing
              </span>{" "}
              Estates
            </h2>
          </div>

          <div style={{ maxWidth: 320 }}>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 13,
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              Active estates with verified titles, flexible payment plans, and
              proven appreciation.
            </p>
            <Link
              to="/developments"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 800,
                color: "#c084fc",
                textDecoration: "none",
                transition: "gap 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.gap = "10px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.gap = "6px";
              }}
            >
              View all estates <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* ── Cards grid ──────────────────────────────────────────────── */}
        <div className="estates__contents grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? [0, 1, 2].map((i) => <EstateSkeleton key={i} />)
            : estates.map((estate, index) => (
                <EstateCard
                  key={estate._id || index}
                  estate={estate}
                  index={index}
                  isInView={isInView}
                  onBook={openBooking}
                />
              ))}
        </div>

        {/* ── Trust strip ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {!loading && estates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              style={{
                marginTop: 48,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px 28px",
              }}
            >
              {[
                "Government Approved Titles",
                "Flexible Payment Plans",
                "Instant Allocation on Full Payment",
                "CAC Registered",
              ].map((t) => (
                <div
                  key={t}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(112,12,235,0.18)",
                      border: "1px solid rgba(112,12,235,0.3)",
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2.5 2.5 3.5-4"
                        stroke="#c084fc"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.38)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {t}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BookInspectionModal — props identical to original */}
      <BookInspectionModal
        isOpen={modalOpen}
        onClose={() => setModal(false)}
        estateName={selected.name}
        estateId={selected.id}
      />
    </section>
  );
}

export default DevelopingEstate;
