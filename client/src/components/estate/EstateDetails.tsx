"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ArrowLeft,
  ArrowUpRight,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Calendar,
  ZoomIn,
  LayoutGrid,
} from "lucide-react";
// lucide-react 1.x dropped this trademarked brand icon too.
import { FaYoutube } from "react-icons/fa6";
import BookInspectionModal from "@/components/inspection/BookInspectionModal";
import SubscribeModal from "@/components/subscription/SubscribeModal";
import type { Estate } from "@/lib/api";

const purposeColor: Record<string, { bg: string }> = {
  residential: { bg: "#700CEB" },
  commercial: { bg: "#ea580c" },
  investment: { bg: "#059669" },
};

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [images.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999, background: "rgba(8,4,20,0.96)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}
      >
        <X size={18} />
      </button>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
        {current + 1} / {images.length}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((c) => (c - 1 + images.length) % images.length);
        }}
        className="absolute left-6 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
      >
        <ChevronLeft size={22} />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.25 }}
          style={{ position: "relative", width: "85vw", height: "80vh", maxWidth: 1200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <SafeImage
            src={images[current]}
            alt={`Gallery ${current + 1}`}
            fill
            sizes="85vw"
            style={{ objectFit: "contain", borderRadius: 12 }}
            fallbackIconSize={64}
            fallbackClassName="rounded-xl"
          />
        </motion.div>
      </AnimatePresence>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((c) => (c + 1) % images.length);
        }}
        className="absolute right-6 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
      >
        <ChevronRight size={22} />
      </button>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((img, i) => (
          <button
            // Index-suffixed: an estate whose featured image also appears in
            // its gallery yields the same URL twice, and a bare `key={img}`
            // then collides — React warns and may drop one of the thumbs.
            key={`${img}-${i}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrent(i);
            }}
            className="relative overflow-hidden rounded-md transition-all duration-200"
            style={{
              width: 52,
              height: 36,
              border: i === current ? "2px solid #700CEB" : "2px solid rgba(255,255,255,0.15)",
              opacity: i === current ? 1 : 0.55,
            }}
          >
            <SafeImage src={img} alt="" fill sizes="52px" style={{ objectFit: "cover" }} fallbackIconSize={16} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

type Tab = "overview" | "amenities" | "neighborhood" | "payment" | "videos";

export default function EstateDetails({ estate }: { estate: Estate }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const purposeKey = estate.purpose?.toLowerCase() || "investment";
  const pColor = purposeColor[purposeKey] || purposeColor.investment;

  const galleryImages = [estate.img, ...(estate.gallery || []).map((g) => g.url)].filter(Boolean);

  const hasVideos = estate.videos?.length > 0;
  const tabs: Tab[] = ["overview", "amenities", "neighborhood", "payment", ...(hasVideos ? (["videos"] as Tab[]) : [])];

  return (
    <main className="min-h-screen w-full bg-white">
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox images={galleryImages} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
      </AnimatePresence>
      <BookInspectionModal
        isOpen={showInspectionModal}
        onClose={() => setShowInspectionModal(false)}
        estateName={estate.estate}
        estateId={estate._id}
      />
      <SubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        estateName={estate.estate}
        estateId={estate._id}
        estatePrice={estate.price}
      />

      <div className="relative w-full" style={{ height: "70vh", minHeight: 480 }}>
        <SafeImage src={estate.img} alt={estate.estate} fill sizes="100vw" priority style={{ objectFit: "cover" }} fallbackIconSize={64} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(8,4,20,0.92) 0%, rgba(8,4,20,0.4) 50%, rgba(8,4,20,0.15) 100%)",
          }}
        />

        <div className="absolute top-8 left-8">
          <Link
            href="/developments"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}
          >
            <ArrowLeft size={15} /> Back
          </Link>
        </div>

        <div className="absolute top-8 right-8">
          <div className="rounded-full px-3 py-1.5 text-xs font-bold text-white capitalize" style={{ background: pColor.bg, letterSpacing: "0.06em" }}>
            {estate.purpose}
          </div>
        </div>

        <motion.div
          className="absolute right-0 bottom-0 left-0 px-6 pb-10 md:px-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mb-3 flex items-center gap-2">
            <MapPin size={14} style={{ color: "#A35FF4" }} />
            <span style={{ color: "#A35FF4", fontSize: 13, fontWeight: 600 }}>{estate.address}</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{estate.location}</span>
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              textShadow: "0 4px 30px rgba(0,0,0,0.4)",
            }}
          >
            {estate.estate}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Starting from</p>
              <p style={{ color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em" }}>₦{estate.price}</p>
            </div>
            <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }} />
            <div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Title</p>
              <p style={{ color: "#A35FF4", fontSize: 16, fontWeight: 700 }}>{estate.title}</p>
            </div>
            <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }} />
            <div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Size</p>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{estate.sqm}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {galleryImages.length > 1 && (
        <div className="w-full px-6 py-6 md:px-16" style={{ background: "#0f0a1e" }}>
          <div className="mb-4 flex items-center gap-3">
            <LayoutGrid size={14} style={{ color: "#A35FF4" }} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Photo Gallery · {galleryImages.length} photos
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {galleryImages.map((img, i) => (
              <motion.button
                // Same duplicate-URL guard as the lightbox strip above.
                key={`${img}-${i}`}
                onClick={() => setLightboxIndex(i)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative flex-shrink-0 overflow-hidden rounded-xl"
                style={{ width: i === 0 ? 260 : 180, height: 120, border: "2px solid rgba(255,255,255,0.06)" }}
              >
                {/* sizes must track the width set on the button above: the
                    featured tile is 260px wide, every other thumb 180px.
                    A flat "260px" made the browser pick an oversized
                    candidate from the srcset for all but the first. */}
                <SafeImage
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  fill
                  sizes={i === 0 ? "260px" : "180px"}
                  style={{ objectFit: "cover" }}
                  fallbackIconSize={28}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ background: "rgba(112,12,235,0.5)" }}
                >
                  <ZoomIn size={22} color="#fff" />
                </div>
                {i === 0 && (
                  <div className="absolute top-2 left-2 rounded px-2 py-0.5 text-xs font-bold" style={{ background: "#700CEB", color: "#fff" }}>
                    Featured
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-6 py-10 md:px-16">
        {/* overflow-x-auto + flex-shrink-0 on the buttons, same pattern as the
            photo gallery strip above: five tabs at their natural padded width
            don't fit a 375px screen, and with nothing to contain them the row
            was dragging the whole page into horizontal scroll instead of
            scrolling on its own. */}
        <div
          className="mb-10 flex gap-1 overflow-x-auto border-b"
          style={{ borderColor: "rgba(0,0,0,0.08)", scrollbarWidth: "none" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative shrink-0 px-5 py-3 text-sm font-bold whitespace-nowrap capitalize transition-all duration-200"
              style={{ color: activeTab === tab ? "#700CEB" : "#6b7280" }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-indicator" className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full" style={{ background: "#700CEB" }} />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="mb-6 flex items-center gap-2">
                  <Sparkles size={16} style={{ color: "#700CEB" }} />
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f0a1e", letterSpacing: "-0.03em" }}>About This Estate</h2>
                </div>
                <p style={{ fontSize: 16, color: "#4b5563", lineHeight: 1.9, marginBottom: 32 }}>{estate.desc}</p>
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {(
                    [
                      ["Plot Size", estate.sqm],
                      ["Title", estate.title],
                      ["Deposit", estate.depositPercentage || "30%"],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} className="rounded-2xl p-5 text-center" style={{ background: "rgba(112,12,235,0.04)", border: "1px solid rgba(112,12,235,0.08)" }}>
                      <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: "#0f0a1e" }}>{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "amenities" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="mb-8 flex items-center gap-2">
                  <Sparkles size={16} style={{ color: "#700CEB" }} />
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f0a1e", letterSpacing: "-0.03em" }}>Proposed Amenities</h2>
                </div>
                {estate.amenities?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {estate.amenities.map((amenity, i) => (
                      <motion.div
                        key={amenity.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex cursor-default flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center"
                        style={{ background: "#0f0a1e", border: "1px solid rgba(112,12,235,0.15)" }}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(163,95,244,0.15)" }}>
                          <Sparkles size={18} style={{ color: "#A35FF4" }} />
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }}>{amenity.name}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#9ca3af" }}>No amenities listed.</p>
                )}
              </motion.div>
            )}

            {activeTab === "neighborhood" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="mb-8 flex items-center gap-2">
                  <MapPin size={16} style={{ color: "#700CEB" }} />
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f0a1e", letterSpacing: "-0.03em" }}>Neighborhood</h2>
                </div>
                {estate.neighborhood?.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {estate.neighborhood.map((item, i) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-4 rounded-xl p-4"
                        style={{ background: "rgba(112,12,235,0.04)", border: "1px solid rgba(112,12,235,0.07)" }}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(112,12,235,0.1)" }}>
                          <CheckCircle2 size={16} style={{ color: "#700CEB" }} />
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>{item.name}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#9ca3af" }}>No neighborhood information available.</p>
                )}

                {estate.sytemap && (
                  <div className="mt-10">
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f0a1e", marginBottom: 16, letterSpacing: "-0.02em" }}>
                      {estate.estate} Layout
                    </h3>
                    <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(112,12,235,0.12)", boxShadow: "0 8px 40px rgba(112,12,235,0.08)" }}>
                      <iframe src={estate.sytemap} title="Estate Map" className="h-[260px] w-full sm:h-[400px]" allowFullScreen />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "payment" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="mb-8 flex items-center gap-2">
                  <TrendingUp size={16} style={{ color: "#700CEB" }} />
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f0a1e", letterSpacing: "-0.03em" }}>Payment Plan</h2>
                </div>
                {estate.paymentPlan?.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {estate.paymentPlan.map((plan, i) => (
                      <motion.div
                        key={`${plan.plot}-${i}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-2xl p-6"
                        style={{ background: "linear-gradient(135deg, #0f0a1e, #1a0f35)", border: "1px solid rgba(112,12,235,0.2)" }}
                      >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                          {(
                            [
                              ["Plot Size", plan.plot],
                              ["Outright Price", plan.outright],
                              ["Initial Deposit", plan.initialDeposit],
                            ] as const
                          ).map(([label, value]) => (
                            <div key={label}>
                              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                                {label}
                              </p>
                              <p style={{ color: "#fff", fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em" }}>{value}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#9ca3af" }}>No payment plans available.</p>
                )}
              </motion.div>
            )}

            {activeTab === "videos" && hasVideos && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="mb-8 flex items-center gap-2">
                  <FaYoutube size={16} style={{ color: "#dc2626" }} />
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f0a1e", letterSpacing: "-0.03em" }}>Video Tour</h2>
                </div>
                <div className="flex flex-col gap-6">
                  {estate.videos.map((video, i) => (
                    <motion.div
                      key={video.videoId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="overflow-hidden rounded-2xl"
                      style={{ border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
                    >
                      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`}
                          title={video.title || `Video ${i + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                        />
                      </div>
                      {video.title && (
                        <div className="px-5 py-3" style={{ background: "#fafafa", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0f0a1e" }}>{video.title}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6 overflow-hidden rounded-2xl"
                style={{ background: "linear-gradient(145deg, #3F0C91, #700CEB)", boxShadow: "0 20px 60px rgba(112,12,235,0.3)" }}
              >
                <div className="p-6">
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                    Starting from
                  </p>
                  <p style={{ color: "#fff", fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 20 }}>₦{estate.price}</p>

                  <button
                    onClick={() => setShowInspectionModal(true)}
                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold"
                    style={{ background: "#fff", color: "#700CEB", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
                  >
                    <Calendar size={15} />
                    Book Inspection
                  </button>

                  <button
                    onClick={() => setShowSubscribeModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold"
                    style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    <ArrowUpRight size={15} />
                    Subscribe Now
                  </button>
                </div>

                <div className="px-6 py-4" style={{ background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center" }}>
                    Only{" "}
                    <span style={{ color: "#EFC2FF", fontWeight: 800 }}>{estate.depositPercentage || "30% Initial Deposit"}</span> to
                    get started
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="rounded-2xl p-5"
                style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
              >
                <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0f0a1e", letterSpacing: "-0.02em", marginBottom: 14 }}>Property Details</h4>
                {(
                  [
                    ["Location", estate.location || estate.address],
                    ["Purpose", estate.purpose],
                    ["Plot Size", estate.sqm],
                    ["Title", estate.title],
                    ["Category", estate.category],
                  ] as const
                ).map(
                  ([label, value]) =>
                    value && (
                      <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f0a1e", textTransform: "capitalize" }}>{value}</span>
                      </div>
                    ),
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
