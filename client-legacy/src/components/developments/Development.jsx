import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin,
  ArrowUpRight,
  Eye,
  Bookmark,
  TrendingUp,
  Building2,
  Home,
  BarChart3,
  SearchX,
  Loader2,
  AlertCircle,
} from "lucide-react";
import BookInspectionModal from "../inspection/BookInspectionModal";

const generateSlug = (name) =>
  name
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "") || "";

const purposeIcon = {
  residential: Home,
  commercial: Building2,
  investment: TrendingUp,
};
const purposeColor = {
  residential: { bg: "rgba(112,12,235,0.08)", color: "#700CEB" },
  commercial: { bg: "rgba(234,88,12,0.08)", color: "#ea580c" },
  investment: { bg: "rgba(5,150,105,0.08)", color: "#059669" },
};

function EstateCard({ estate, index }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const slug = estate.slug || generateSlug(estate.estate);
  const purposeKey = estate.purpose?.toLowerCase() || "investment";
  const PurposeIcon = purposeIcon[purposeKey] || BarChart3;
  const pColor = purposeColor[purposeKey] || purposeColor["investment"];

  return (
    <>
      <BookInspectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        estateName={estate.estate}
        estateId={estate._id || null}
      />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
          delay: Math.min(index * 0.08, 0.4),
        }}
        viewport={{ once: true, amount: 0.1 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="estate__card group relative rounded-2xl overflow-hidden"
        style={{
          background: "#fff",
          boxShadow: hovered
            ? "0 32px 80px rgba(112,12,235,0.14), 0 8px 24px rgba(0,0,0,0.08)"
            : "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.4s ease, transform 0.4s ease",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: 260 }}>
          <motion.img
            src={estate.img}
            alt={estate.estate}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(20,10,40,0.78) 0%, rgba(20,10,40,0.18) 50%, transparent 100%)",
            }}
          />

          <div className="absolute top-4 right-4">
            <motion.button
              onClick={() => setBookmarked(!bookmarked)}
              whileTap={{ scale: 0.88 }}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: bookmarked ? "#700CEB" : "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)",
                transition: "background 0.2s",
              }}
            >
              <Bookmark
                size={15}
                fill={bookmarked ? "#fff" : "none"}
                color="#fff"
              />
            </motion.button>
          </div>

          <div className="absolute top-4 left-4">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                letterSpacing: "0.04em",
              }}
            >
              <PurposeIcon size={11} />
              {estate.purpose}
            </div>
          </div>

          <div className="absolute top-12 left-4 mt-2">
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold mt-1"
              style={{
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <MapPin size={10} />
              {estate.location}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-5 py-4">
            <div className="flex items-end justify-between">
              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}
                >
                  Starting from
                </p>
                <p
                  style={{
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  ₦{estate.price}
                </p>
              </div>
              <Link
                to={`/estate/${slug}`}
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{
                  background: "#700CEB",
                  boxShadow: "0 4px 14px rgba(112,12,235,0.5)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.12)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <ArrowUpRight size={18} color="#fff" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#0f0a1e",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.25,
                }}
                className="truncate"
              >
                {estate.estate}
              </h3>
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin size={11} style={{ color: "#700CEB", flexShrink: 0 }} />
                <span
                  style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}
                  className="truncate"
                >
                  {estate.address}
                </span>
              </div>
            </div>
            <div
              className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{
                background: pColor.bg,
                color: pColor.color,
                whiteSpace: "nowrap",
              }}
            >
              {estate.title}
            </div>
          </div>

          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              lineHeight: 1.75,
              marginBottom: 16,
            }}
            className="line-clamp-2"
          >
            {estate.desc}
          </p>

          <div
            style={{
              height: 1,
              background:
                "linear-gradient(to right, rgba(112,12,235,0.12), transparent)",
              marginBottom: 16,
            }}
          />

          <div className="flex gap-3">
            {/* ← Book Inspection now opens the modal */}
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #700CEB, #8A2FF0)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(112,12,235,0.3)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(112,12,235,0.45)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(112,12,235,0.3)")
              }
            >
              <Eye size={14} />
              Book Inspection
            </button>
            <Link
              to={`/estate/${slug}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                border: "1.5px solid #700CEB",
                color: "#700CEB",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(112,12,235,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <ArrowUpRight size={14} />
              View Details
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function Development({ estates = [], loading = false, error = null }) {
  return (
    <div className="estate__wrapper w-full mt-8 md:mt-16">
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            className="flex flex-col items-center justify-center py-24 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2
              size={36}
              style={{ color: "#700CEB" }}
              className="animate-spin"
            />
            <p style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600 }}>
              Loading properties...
            </p>
          </motion.div>
        )}
        {!loading && error && (
          <motion.div
            key="error"
            className="flex flex-col items-center justify-center py-24 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-2"
              style={{ background: "rgba(220,38,38,0.08)" }}
            >
              <AlertCircle size={28} style={{ color: "#dc2626" }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#0f0a1e" }}>
              Something went wrong
            </p>
            <p style={{ fontSize: 14, color: "#9ca3af" }}>{error}</p>
          </motion.div>
        )}
        {!loading && !error && estates.length === 0 && (
          <motion.div
            key="empty"
            className="text-center py-24 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: "rgba(112,12,235,0.08)" }}
            >
              <SearchX size={28} style={{ color: "#700CEB" }} />
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#0f0a1e" }}>
              No properties found
            </p>
            <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 6 }}>
              Try a different name, location, or purpose.
            </p>
          </motion.div>
        )}
        {!loading && !error && estates.length > 0 && (
          <motion.div
            key="grid"
            className="estates grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {estates.map((estate, index) => (
              <EstateCard
                key={estate._id || estate.id || index}
                estate={estate}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Development;
