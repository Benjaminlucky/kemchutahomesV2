"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MapPin, Maximize2, Building2, ArrowRight } from "lucide-react";
import BookInspectionModal from "@/components/inspection/BookInspectionModal";
import type { Estate } from "@/lib/api";

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";

const PURPOSE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Residential: { bg: "rgba(112,12,235,0.18)", color: "#c084fc", border: "rgba(112,12,235,0.3)" },
  Commercial: { bg: "rgba(234,88,12,0.15)", color: "#fb923c", border: "rgba(234,88,12,0.28)" },
  Investment: { bg: "rgba(5,150,105,0.15)", color: "#34d399", border: "rgba(5,150,105,0.28)" },
};

function EstateCard({
  estate,
  index,
  isInView,
  onBook,
}: {
  estate: Estate;
  index: number;
  isInView: boolean;
  onBook: (estate: Estate) => void;
}) {
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
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const, delay: index * 0.12 },
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
      <div style={{ position: "relative", height: 240, overflow: "hidden", flexShrink: 0 }}>
        {!imgLoaded && <div className="absolute inset-0 animate-pulse" style={{ background: "rgba(255,255,255,0.06)", zIndex: 2 }} />}

        <SafeImage
          src={estate.img}
          alt={estate.estate}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          priority={index === 0}
          onLoad={() => setImgLoaded(true)}
          // A failed image never fires onLoad, so without this the pulse
          // skeleton above would shimmer forever over the placeholder.
          onError={() => setImgLoaded(true)}
          style={{
            objectFit: "cover",
            transition: "transform 0.65s cubic-bezier(0.22,1,0.36,1)",
            opacity: imgLoaded ? 1 : 0,
          }}
          className="group-hover:scale-110"
          fallbackIconSize={40}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(10,1,21,0.92) 0%, rgba(10,1,21,0.15) 55%, transparent 100%)",
          }}
        />

        <div style={{ position: "absolute", top: 14, left: 14, padding: "4px 11px", borderRadius: 20, background: ps.bg, border: `1px solid ${ps.border}`, backdropFilter: "blur(8px)" }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: ps.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{estate.purpose}</span>
        </div>

        <div style={{ position: "absolute", top: 14, right: 14, padding: "4px 11px", borderRadius: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.05em" }}>{estate.title}</span>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 16px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 1px" }}>
                Starting from
              </p>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", margin: 0, lineHeight: 1 }}>₦{estate.price}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: "0 0 1px" }}>30% Initial Deposit</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#c084fc", margin: 0 }}>{estate.sqm}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h4 style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.2, margin: "0 0 7px" }}>{estate.estate}</h4>

        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
          <MapPin size={11} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
            {estate.address ? `${estate.address}, ` : ""}
            {estate.location}
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingBottom: 14 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Building2 size={9} style={{ color: "rgba(255,255,255,0.35)" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{estate.category}</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Maximize2 size={9} style={{ color: "rgba(255,255,255,0.35)" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{estate.sqm}</span>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 0 14px" }} />

        <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
          <Link
            href={`/estate/${estate.slug}`}
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
            }}
          >
            View Details
          </Link>

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
            }}
          >
            Book Inspection
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function DevelopingEstate({ estates }: { estates: Estate[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.08 });

  const [modalOpen, setModal] = useState(false);
  const [selected, setSelected] = useState<{ name: string; id: string | null }>({ name: "", id: null });

  const openBooking = (estate: Estate) => {
    setSelected({ name: estate.estate, id: estate._id });
    setModal(true);
  };

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay } },
  });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0115 0%, #0d0120 100%)", paddingTop: "5rem", paddingBottom: "6rem" }}
    >
      <div style={{ position: "absolute", top: "5%", right: "-8%", width: 500, height: 500, borderRadius: "50%", background: "rgba(112,12,235,0.08)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "0%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "rgba(63,12,145,0.07)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.3,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto w-11/12 md:w-10/12">
        <motion.div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end" variants={fadeUp(0)} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase" style={{ background: "rgba(112,12,235,0.2)", border: "1px solid rgba(112,12,235,0.35)", color: "#c084fc" }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
              Live Developments
            </div>

            <h2 className="font-black text-white uppercase" style={{ fontSize: "clamp(2rem,5.5vw,4rem)", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
              Fast{" "}
              <span style={{ background: `linear-gradient(135deg,#c084fc,${PURPLE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Developing
              </span>{" "}
              Estates
            </h2>
          </div>

          <div style={{ maxWidth: 320 }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
              Active estates with verified titles, flexible payment plans, and
              proven appreciation.
            </p>
            <Link href="/developments" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#c084fc", textDecoration: "none" }}>
              View all estates <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {estates.map((estate, index) => (
            <EstateCard key={estate._id} estate={estate} index={index} isInView={isInView} onBook={openBooking} />
          ))}
        </div>

        <AnimatePresence>
          {estates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              style={{ marginTop: 48, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "10px 28px" }}
            >
              {["Government Approved Titles", "Flexible Payment Plans", "Instant Allocation on Full Payment", "CAC Registered"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(112,12,235,0.18)", border: "1px solid rgba(112,12,235,0.3)" }}>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5 3.5-4" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: "0.04em" }}>{t}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BookInspectionModal isOpen={modalOpen} onClose={() => setModal(false)} estateName={selected.name} estateId={selected.id} />
    </section>
  );
}
