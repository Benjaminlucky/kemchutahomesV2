/**
 * ChatWidget.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Floating AI chat widget for kemchutahomesltd.com
 * Features:
 *   • Bounce-in entry animation after 3 seconds
 *   • Continuous ring-pulse glow on the button
 *   • Attention shake + tooltip pop after 8 seconds
 *   • Auto greeting message with typing simulation after 10 seconds
 *   • Soft chime sound on greeting (Web Audio API — no audio file needed)
 *   • Full conversation with Groq AI via /api/chat
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PURPLE = "#700CEB";
const DARK = "#3F0C91";
const WA_NUM = "2348000000001"; // replace with real WhatsApp number

const STARTERS = [
  "How does the Buy2Sell investment work?",
  "How do I subscribe for a plot of land?",
  "What documents will I receive?",
  "How do I book a site inspection?",
  "What are your ROI rates?",
  "How do I reach your team?",
];

// ── Greeting message the AI sends automatically on first open ────────────────
const AUTO_GREETING =
  "Hi there! 👋 Welcome to Kemchuta Homes. I'm your personal assistant — I can help you with land subscriptions, Buy2Sell investments, site inspections, estate prices, and more. What would you like to know?";

// ── Soft chime using Web Audio API — no external audio file needed ────────────
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // Two-note pleasant chime: C5 then E5
    [
      [523.25, 0],
      [659.25, 0.18],
    ].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.7);
      osc.start(now + delay);
      osc.stop(now + delay + 0.8);
    });
  } catch {
    /* AudioContext blocked — silent fallback */
  }
}

// ── Format message text — handles **bold**, bullet lists, and newlines ────────
function MessageText({ text }) {
  // Split into lines first
  const lines = text.split("\n");

  return (
    <span style={{ display: "block" }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Bullet line: starts with * or -
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const content = trimmed.slice(2);
          return (
            <span
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                margin: "4px 0",
              }}
            >
              <span
                style={{
                  color: "#700CEB",
                  fontWeight: 900,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                •
              </span>
              <span>
                <InlineBold text={content} />
              </span>
            </span>
          );
        }

        // Empty line — small gap
        if (trimmed === "") {
          return <span key={i} style={{ display: "block", height: 6 }} />;
        }

        // Normal line
        return (
          <span key={i} style={{ display: "block", marginBottom: 2 }}>
            <InlineBold text={trimmed} />
          </span>
        );
      })}
    </span>
  );
}

// Handles **bold** markers within a line
function InlineBold({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} style={{ fontWeight: 800, color: "inherit" }}>
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

// ── Typing dots ───────────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "10px 14px",
        background: "#f3f0ff",
        borderRadius: "18px 18px 18px 4px",
        width: "fit-content",
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: PURPLE,
          }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// ── Online indicator dot ──────────────────────────────────────────────────────
function PulseDot() {
  return (
    <div style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
      <motion.div
        animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#4ade80",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 2,
          borderRadius: "50%",
          background: "#4ade80",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [mounted, setMounted] = useState(false); // controls bounce-in
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [greetedOnce, setGreetedOnce] = useState(false);
  const [autoTyping, setAutoTyping] = useState(false); // shows typing dots in greeting
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── Step 1: bounce the button into existence after 3s ─────────────────────
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // ── Step 2: shake + tooltip after 8s ─────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      setShaking(true);
      setShowTooltip(true);
      setTimeout(() => setShaking(false), 700);
    }, 5000); // 5s after mounted = 8s total
    return () => clearTimeout(t);
  }, [mounted]);

  // ── Step 3: auto-open with greeting after 12s ─────────────────────────────
  useEffect(() => {
    if (!mounted || greetedOnce) return;
    const t = setTimeout(() => {
      if (open) return; // user already opened it — don't interrupt
      setOpen(true);
      setShowTooltip(false);
      setGreetedOnce(true);
      playChime();
      // Simulate typing for 1.4s then show greeting
      setAutoTyping(true);
      setTimeout(() => {
        setAutoTyping(false);
        setMessages([{ role: "assistant", content: AUTO_GREETING }]);
      }, 1400);
    }, 9000); // 9s after mounted = 12s total
    return () => clearTimeout(t);
  }, [mounted, greetedOnce, open]);

  // ── Manual open — play chime + show greeting if first time ───────────────
  const handleOpen = () => {
    const willOpen = !open;
    setOpen(willOpen);
    setShowTooltip(false);
    setShaking(false);
    if (willOpen && !greetedOnce) {
      setGreetedOnce(true);
      playChime();
      setAutoTyping(true);
      setTimeout(() => {
        setAutoTyping(false);
        setMessages([{ role: "assistant", content: AUTO_GREETING }]);
      }, 1200);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, autoTyping]);

  // Focus input when opening
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  const send = useCallback(
    async (text) => {
      const content = text?.trim() || input.trim();
      if (!content || loading) return;

      const userMsg = { role: "user", content };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const allMessages = [...messages, userMsg];
        const res = await fetch(`${BASE_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages }),
        });
        const data = await res.json();
        const reply =
          data.reply ||
          "Sorry, something went wrong. Please call +234 800 000 0001.";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm having trouble connecting. Please call **+234 800 000 0001** or WhatsApp us.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, messages, loading],
  );

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isFirstOpen = open && messages.length === 0 && !autoTyping;

  // Don't render anything until the bounce-in timer fires
  if (!mounted) return null;

  return (
    <>
      {/* ── Floating button + tooltip ────────────────────────────────────── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9998 }}>
        {/* Tooltip pop */}
        <AnimatePresence>
          {!open && showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.88 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={{
                position: "absolute",
                bottom: 70,
                right: 0,
                background: "#fff",
                borderRadius: 16,
                padding: "14px 18px",
                boxShadow:
                  "0 12px 40px rgba(0,0,0,0.16), 0 0 0 1px rgba(112,12,235,0.1)",
                minWidth: 220,
                maxWidth: 260,
                pointerEvents: "none",
              }}
            >
              {/* Avatar row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 9,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  🏠
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#0f0a1e",
                      margin: 0,
                    }}
                  >
                    Kemchuta Assistant
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 2,
                    }}
                  >
                    <PulseDot />
                    <p style={{ fontSize: 10, color: "#6b7280", margin: 0 }}>
                      Online now
                    </p>
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#374151",
                  fontWeight: 500,
                  margin: "0 0 2px",
                  lineHeight: 1.5,
                }}
              >
                👋 Hi! Got questions about our estates or investments?
              </p>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                Tap to chat — I reply instantly
              </p>
              {/* Caret */}
              <div
                style={{
                  position: "absolute",
                  bottom: -7,
                  right: 24,
                  width: 14,
                  height: 14,
                  background: "#fff",
                  transform: "rotate(45deg)",
                  boxShadow: "2px 2px 4px rgba(0,0,0,0.07)",
                  borderRadius: 2,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ring pulse rings behind the button */}
        {!open && (
          <>
            <motion.div
              animate={{ scale: [1, 1.55], opacity: [0.35, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: "50%",
                background: PURPLE,
                pointerEvents: "none",
                zIndex: -1,
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.85], opacity: [0.2, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.4,
              }}
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: "50%",
                background: PURPLE,
                pointerEvents: "none",
                zIndex: -1,
              }}
            />
          </>
        )}

        {/* The button */}
        <motion.button
          onClick={handleOpen}
          initial={{ scale: 0, opacity: 0 }}
          animate={
            shaking
              ? { scale: 1, opacity: 1, rotate: [0, -8, 8, -6, 6, -3, 3, 0] }
              : { scale: 1, opacity: 1, rotate: 0 }
          }
          transition={
            shaking
              ? { duration: 0.6, ease: "easeInOut" }
              : { type: "spring", stiffness: 260, damping: 18 }
          }
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.93 }}
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${DARK}, ${PURPLE})`,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 28px rgba(112,12,235,0.5)`,
            position: "relative",
          }}
        >
          {/* Unread badge — shown when auto-greeting is ready but user hasn't opened */}
          <AnimatePresence>
            {!open && greetedOnce && messages.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>
                  1
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {open ? (
              <motion.svg
                key="close"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </motion.svg>
            ) : (
              <motion.svg
                key="chat"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#fff"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Chat window ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.93 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{
              position: "fixed",
              bottom: 96,
              right: 24,
              zIndex: 9997,
              width: "min(400px, calc(100vw - 32px))",
              height: "min(580px, calc(100vh - 120px))",
              background: "#fff",
              borderRadius: 22,
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(112,12,235,0.12)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid rgba(112,12,235,0.1)",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: `linear-gradient(135deg, ${DARK}, ${PURPLE})`,
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                🏠
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  Kemchuta Assistant
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 3,
                  }}
                >
                  <PulseDot />
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 11,
                      margin: 0,
                    }}
                  >
                    Online · Replies instantly
                  </p>
                </div>
              </div>
              {/* WhatsApp handoff */}
              <a
                href={`https://wa.me/${WA_NUM}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Chat with a human on WhatsApp"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* Auto-greeting typing indicator */}
              {autoTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    🏠
                  </div>
                  <TypingIndicator />
                </motion.div>
              )}

              {/* Welcome state — starters shown before any message */}
              {isFirstOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      🏠
                    </div>
                    <div
                      style={{
                        background: "#f3f0ff",
                        borderRadius: "18px 18px 18px 4px",
                        padding: "12px 14px",
                        maxWidth: "85%",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          color: "#0f0a1e",
                          margin: 0,
                          lineHeight: 1.65,
                        }}
                      >
                        Hi! I'm the Kemchuta Homes assistant. How can I help you
                        today?
                      </p>
                    </div>
                  </div>
                  <div style={{ paddingLeft: 36 }}>
                    <p
                      style={{
                        fontSize: 10,
                        color: "#9ca3af",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        margin: "0 0 8px",
                      }}
                    >
                      Quick questions
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {STARTERS.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          style={{
                            textAlign: "left",
                            padding: "9px 13px",
                            borderRadius: 12,
                            background: "rgba(112,12,235,0.05)",
                            border: "1px solid rgba(112,12,235,0.15)",
                            color: PURPLE,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "rgba(112,12,235,0.1)";
                            e.target.style.borderColor = PURPLE;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "rgba(112,12,235,0.05)";
                            e.target.style.borderColor =
                              "rgba(112,12,235,0.15)";
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Conversation messages */}
              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: "flex",
                      flexDirection: isUser ? "row-reverse" : "row",
                      gap: 8,
                      alignItems: "flex-end",
                    }}
                  >
                    {!isUser && (
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        🏠
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "11px 14px",
                        borderRadius: isUser
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                        background: isUser
                          ? `linear-gradient(135deg,${DARK},${PURPLE})`
                          : "#f3f0ff",
                        color: isUser ? "#fff" : "#0f0a1e",
                        fontSize: 14,
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      <MessageText text={msg.content} />
                    </div>
                  </motion.div>
                );
              })}

              {/* AI typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    🏠
                  </div>
                  <TypingIndicator />
                </motion.div>
              )}

              {/* Starters shown after auto-greeting arrives */}
              {!isFirstOpen &&
                !autoTyping &&
                messages.length === 1 &&
                messages[0].role === "assistant" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ paddingLeft: 34 }}
                  >
                    <p
                      style={{
                        fontSize: 10,
                        color: "#9ca3af",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        margin: "4px 0 8px",
                      }}
                    >
                      What would you like to know?
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      {STARTERS.slice(0, 4).map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          style={{
                            textAlign: "left",
                            padding: "8px 12px",
                            borderRadius: 10,
                            background: "rgba(112,12,235,0.05)",
                            border: "1px solid rgba(112,12,235,0.15)",
                            color: PURPLE,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "rgba(112,12,235,0.1)";
                            e.target.style.borderColor = PURPLE;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "rgba(112,12,235,0.05)";
                            e.target.style.borderColor =
                              "rgba(112,12,235,0.15)";
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

              <div ref={bottomRef} />
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "10px 12px",
                borderTop: "1px solid #f0eeff",
                flexShrink: 0,
                background: "#fff",
              }}
            >
              {/* Quick actions */}
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <a
                  href={`https://wa.me/${WA_NUM}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    padding: "7px 0",
                    borderRadius: 10,
                    background: "#dcfce7",
                    color: "#15803d",
                    fontSize: 11,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="#15803d"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Us
                </a>
                <a
                  href="tel:+2348000000001"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    padding: "7px 0",
                    borderRadius: 10,
                    background: "#f0eeff",
                    color: PURPLE,
                    fontSize: 11,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={PURPLE}
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63 2 2 0 012-2.18H5a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 6.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 13.92v3z" />
                  </svg>
                  Call Lagos
                </a>
              </div>

              {/* Input row */}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask anything about our estates…"
                  rows={1}
                  style={{
                    flex: 1,
                    resize: "none",
                    border: "1.5px solid #e8e0ff",
                    borderRadius: 12,
                    padding: "10px 13px",
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                    background: "#fdfcff",
                    color: "#0f0a1e",
                    lineHeight: 1.5,
                    maxHeight: 80,
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                  onBlur={(e) => (e.target.style.borderColor = "#e8e0ff")}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    border: "none",
                    background:
                      input.trim() && !loading
                        ? `linear-gradient(135deg,${DARK},${PURPLE})`
                        : "#e8e0ff",
                    cursor:
                      input.trim() && !loading ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={input.trim() && !loading ? "#fff" : "#a78bfa"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <p
                style={{
                  fontSize: 10,
                  color: "#c4b5fd",
                  textAlign: "center",
                  margin: "6px 0 0",
                }}
              >
                Powered by AI · For urgent matters call +234 800 000 0001
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
