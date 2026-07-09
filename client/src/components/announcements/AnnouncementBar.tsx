"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone } from "lucide-react";

const SESSION_KEY = "khl_announcement_dismissed";
const SPEED_PX_PER_S = 35;

type Notice = { text: string; active?: boolean };

export default function AnnouncementBar() {
  const [notices, setNotices] = useState<Notice[]>([]);
  // Lazy initializer reads sessionStorage on first client render — avoids a
  // setState-in-effect render pass just to reflect state we already know.
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && !!sessionStorage.getItem(SESSION_KEY),
  );
  const [shimmer, setShimmer] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dismissed) return;
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/knowledge-base`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const active = (data.notices || []).filter(
          (n: Notice) => n.active !== false && n.text?.trim(),
        );
        setNotices(active);
      })
      .catch(() => null);
  }, [dismissed]);

  useEffect(() => {
    if (notices.length === 0) return;
    const t = setInterval(() => {
      setShimmer(true);
      setTimeout(() => setShimmer(false), 900);
    }, 3000);
    return () => clearInterval(t);
  }, [notices.length]);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  if (dismissed || notices.length === 0) return null;

  const scrollText = notices.map((n) => n.text).join("   ⚡   ");
  const doubledText = `${scrollText}   ⚡   ${scrollText}`;

  return (
    <div
      role="marquee"
      aria-live="polite"
      style={{
        width: "100%",
        position: "relative",
        zIndex: 1001,
        overflow: "hidden",
        background:
          "linear-gradient(90deg, #92400e 0%, #b45309 30%, #d97706 60%, #b45309 85%, #92400e 100%)",
        borderBottom: "2px solid rgba(251,191,36,0.6)",
      }}
    >
      <AnimatePresence>
        {shimmer && (
          <motion.div
            key="shimmer"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: "#fbbf24",
          zIndex: 4,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 38,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 12px 0 14px",
            flexShrink: 0,
            height: "100%",
            borderRight: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <Megaphone size={13} color="#fde68a" strokeWidth={2.5} />
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#ef4444",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: "#fde68a",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              LIVE
            </span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "hidden",
            position: "relative",
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 40,
              background:
                "linear-gradient(to right, rgba(180,83,9,0.9), transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 40,
              background:
                "linear-gradient(to left, rgba(146,64,14,0.9), transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          <div
            ref={trackRef}
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              whiteSpace: "nowrap",
              animation: `khl-marquee ${doubledText.length / SPEED_PX_PER_S}s linear infinite`,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.01em",
                textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                paddingLeft: 16,
              }}
            >
              {doubledText}
            </span>
          </div>
        </div>

        <button
          onClick={dismiss}
          aria-label="Dismiss announcement"
          style={{
            flexShrink: 0,
            width: 32,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.15)",
            border: "none",
            borderLeft: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            color: "rgba(255,255,255,0.7)",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          <X size={13} />
        </button>
      </div>

      <style>{`
        @keyframes khl-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
