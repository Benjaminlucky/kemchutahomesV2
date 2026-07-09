"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight, Eye, Bookmark, TrendingUp, Building2, Home, BarChart3, SearchX } from "lucide-react";
import BookInspectionModal from "@/components/inspection/BookInspectionModal";
import type { Estate } from "@/lib/api";

const purposeIcon: Record<string, ComponentType<{ size?: number }>> = {
  residential: Home,
  commercial: Building2,
  investment: TrendingUp,
};
const purposeColor: Record<string, { bg: string; color: string }> = {
  residential: { bg: "rgba(112,12,235,0.08)", color: "#700CEB" },
  commercial: { bg: "rgba(234,88,12,0.08)", color: "#ea580c" },
  investment: { bg: "rgba(5,150,105,0.08)", color: "#059669" },
};

function EstateCard({ estate, index }: { estate: Estate; index: number }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const purposeKey = estate.purpose?.toLowerCase() || "investment";
  const PurposeIcon = purposeIcon[purposeKey] || BarChart3;
  const pColor = purposeColor[purposeKey] || purposeColor.investment;

  return (
    <>
      <BookInspectionModal isOpen={showModal} onClose={() => setShowModal(false)} estateName={estate.estate} estateId={estate._id} />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: Math.min(index * 0.08, 0.4) }}
        viewport={{ once: true, amount: 0.1 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="group relative overflow-hidden rounded-2xl"
        style={{
          background: "#fff",
          boxShadow: hovered ? "0 32px 80px rgba(112,12,235,0.14), 0 8px 24px rgba(0,0,0,0.08)" : "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.4s ease, transform 0.4s ease",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="relative overflow-hidden" style={{ height: 260 }}>
          <motion.div className="h-full w-full" animate={{ scale: hovered ? 1.06 : 1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ position: "relative", height: "100%" }}>
            <Image src={estate.img} alt={estate.estate} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" style={{ objectFit: "cover" }} priority={index < 3} />
          </motion.div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,10,40,0.78) 0%, rgba(20,10,40,0.18) 50%, transparent 100%)" }} />

          <div className="absolute top-4 right-4">
            <motion.button
              onClick={() => setBookmarked(!bookmarked)}
              whileTap={{ scale: 0.88 }}
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: bookmarked ? "#700CEB" : "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <Bookmark size={15} fill={bookmarked ? "#fff" : "none"} color="#fff" />
            </motion.button>
          </div>

          <div className="absolute top-4 left-4">
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", letterSpacing: "0.04em" }}
            >
              <PurposeIcon size={11} />
              {estate.purpose}
            </div>
          </div>

          <div className="absolute top-12 left-4 mt-2">
            <div className="mt-1 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.85)" }}>
              <MapPin size={10} />
              {estate.location}
            </div>
          </div>

          <div className="absolute right-0 bottom-0 left-0 px-5 py-4">
            <div className="flex items-end justify-between">
              <div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>
                  Starting from
                </p>
                <p style={{ color: "#fff", fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>₦{estate.price}</p>
              </div>
              <Link
                href={`/estate/${estate.slug}`}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110"
                style={{ background: "#700CEB", boxShadow: "0 4px 14px rgba(112,12,235,0.5)" }}
              >
                <ArrowUpRight size={18} color="#fff" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f0a1e", letterSpacing: "-0.03em", lineHeight: 1.25 }} className="truncate">
                {estate.estate}
              </h3>
              <div className="mt-1.5 flex items-center gap-1">
                <MapPin size={11} style={{ color: "#700CEB", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }} className="truncate">
                  {estate.address}
                </span>
              </div>
            </div>
            <div className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold" style={{ background: pColor.bg, color: pColor.color, whiteSpace: "nowrap" }}>
              {estate.title}
            </div>
          </div>

          <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.75, marginBottom: 16 }} className="line-clamp-2">
            {estate.desc}
          </p>

          <div style={{ height: 1, background: "linear-gradient(to right, rgba(112,12,235,0.12), transparent)", marginBottom: 16 }} />

          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #700CEB, #8A2FF0)", color: "#fff", boxShadow: "0 4px 14px rgba(112,12,235,0.3)" }}
            >
              <Eye size={14} />
              Book Inspection
            </button>
            <Link
              href={`/estate/${estate.slug}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200"
              style={{ border: "1.5px solid #700CEB", color: "#700CEB", background: "transparent" }}
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

export default function Development({ estates }: { estates: Estate[] }) {
  return (
    <div className="mt-8 w-full md:mt-16">
      {estates.length === 0 ? (
        <motion.div
          className="flex flex-col items-center py-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "rgba(112,12,235,0.08)" }}>
            <SearchX size={28} style={{ color: "#700CEB" }} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#0f0a1e" }}>No properties found</p>
          <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 6 }}>Try a different name, location, or purpose.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {estates.map((estate, index) => (
            <EstateCard key={estate._id} estate={estate} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
