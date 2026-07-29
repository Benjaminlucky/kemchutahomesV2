"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

type CompanyInfo = {
  whatsappNumber: string;
  lagosPhone: string;
};

const STARTERS = [
  "How does the Buy2Sell investment work?",
  "How do I subscribe for a plot of land?",
  "What documents will I receive?",
  "How do I book a site inspection?",
  "What are your ROI rates?",
  "How do I reach your team?",
];

const AUTO_GREETING =
  "Hi there! 👋 Welcome to Kemchuta Homes. I'm your personal assistant — I can help you with land subscriptions, Buy2Sell investments, site inspections, estate prices, and more. What would you like to know?";

// Two-note chime (C5 then E5) via the Web Audio API — no audio asset needed.
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
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
    // AudioContext blocked (autoplay policy, unsupported browser) — silent fallback.
  }
}

// Lightweight formatting: **bold** inline, "* "/"- " lines as bullets. Not a
// full markdown parser on purpose — the system prompt is instructed to only
// ever emit these two constructs (see server/controllers/chat.controller.js).
function InlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-extrabold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function MessageText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <span className="block">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          return (
            <span key={i} className="my-1 flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-black text-customPurple-600">•</span>
              <span>
                <InlineBold text={trimmed.slice(2)} />
              </span>
            </span>
          );
        }
        if (trimmed === "") return <span key={i} className="block h-1.5" />;
        return (
          <span key={i} className="mb-0.5 block">
            <InlineBold text={trimmed} />
          </span>
        );
      })}
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-customPurple-50 px-3.5 py-2.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-customPurple-600"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function PulseDot() {
  return (
    <div className="relative h-2.5 w-2.5 shrink-0">
      <motion.div
        animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        className="absolute inset-0 rounded-full bg-green-400"
      />
      <div className="absolute inset-[2px] rounded-full bg-green-400" />
    </div>
  );
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function ChatWidget({ companyInfo }: { companyInfo: CompanyInfo }) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [greetedOnce, setGreetedOnce] = useState(false);
  const [autoTyping, setAutoTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const whatsappHref = `https://wa.me/${companyInfo.whatsappNumber.replace(/[^0-9]/g, "")}`;
  const fallbackMessage = `I'm having trouble connecting. Please call **${companyInfo.lagosPhone}** or WhatsApp us.`;

  // Step 1: bounce the button into existence after 3s.
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Step 2: shake + tooltip 8s after mount (5s after the bounce-in).
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      setShaking(true);
      setShowTooltip(true);
      setTimeout(() => setShaking(false), 700);
    }, 5000);
    return () => clearTimeout(t);
  }, [mounted]);

  const greet = useCallback(() => {
    setGreetedOnce(true);
    playChime();
    setAutoTyping(true);
    setTimeout(() => {
      setAutoTyping(false);
      setMessages([{ role: "assistant", content: AUTO_GREETING }]);
    }, 1200);
  }, []);

  // Step 3: auto-open + greet 12s after mount, unless the user already
  // opened it (which cancels this and greets immediately instead).
  useEffect(() => {
    if (!mounted || greetedOnce) return;
    const t = setTimeout(() => {
      if (open) return;
      setOpen(true);
      setShowTooltip(false);
      greet();
    }, 9000);
    return () => clearTimeout(t);
  }, [mounted, greetedOnce, open, greet]);

  const handleToggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    setShowTooltip(false);
    setShaking(false);
    if (willOpen && !greetedOnce) greet();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, loading, autoTyping, reduceMotion]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  const send = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || loading) return;

      const userMsg: ChatMessage = { role: "user", content };
      const history = [...messages, userMsg];
      setMessages(history);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const reply = res.status === 429 && data.message ? data.message : fallbackMessage;
          setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
          return;
        }
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply || fallbackMessage }]);
      } catch {
        setMessages((prev) => [...prev, { role: "assistant", content: fallbackMessage }]);
      } finally {
        setLoading(false);
      }
    },
    [input, messages, loading, fallbackMessage],
  );

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isFirstOpen = open && messages.length === 0 && !autoTyping;

  if (!mounted) return null;

  return (
    <>
      <div className="fixed right-5 bottom-5 z-[9998] sm:right-6 sm:bottom-6">
        <AnimatePresence>
          {!open && showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 22 }}
              className="pointer-events-none absolute right-0 bottom-[74px] w-64 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-customPurple-100"
            >
              <div className="mb-2 flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3F0C91] to-customPurple-600 text-base">
                  🏠
                </div>
                <div>
                  <p className="text-xs font-extrabold text-customBlack-900">Kemchuta Assistant</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <PulseDot />
                    <p className="text-[10px] text-customBlack-400">Online now</p>
                  </div>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed font-medium text-customBlack-700">
                👋 Hi! Got questions about our estates or investments?
              </p>
              <p className="mt-0.5 text-[11px] text-customBlack-400">Tap to chat — I reply instantly</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleToggle}
          aria-label={open ? "Close chat" : "Open chat"}
          animate={shaking && !reduceMotion ? { x: [0, -4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl"
          style={{ background: "linear-gradient(135deg, #3F0C91, #700CEB)" }}
        >
          {open ? <X size={24} /> : <MessageCircle size={24} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={reduceMotion ? { duration: 0.15 } : { type: "spring", duration: 0.4 }}
            className="fixed right-5 bottom-24 z-[9998] flex h-[70vh] max-h-[600px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-customBlack-100 sm:right-6 sm:bottom-[104px]"
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ background: "linear-gradient(135deg, #3F0C91, #700CEB)" }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl">🏠</div>
              <div className="flex-1">
                <p className="text-sm font-extrabold text-white">Kemchuta Assistant</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <PulseDot />
                  <p className="text-[11px] text-white/70">Online · Replies instantly</p>
                </div>
              </div>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                title="Chat with a human on WhatsApp"
                className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/25"
              >
                <WhatsAppIcon />
              </a>
            </div>

            {/* Messages */}
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3.5 py-4">
              {autoTyping && (
                <div className="flex items-end gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3F0C91] to-customPurple-600 text-xs">
                    🏠
                  </div>
                  <TypingIndicator />
                </div>
              )}

              {isFirstOpen && (
                <div>
                  <div className="mb-3.5 flex items-start gap-2">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3F0C91] to-customPurple-600 text-xs">
                      🏠
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-customPurple-50 px-3.5 py-3">
                      <p className="text-[13.5px] leading-relaxed text-customBlack-900">
                        Hi! I&rsquo;m the Kemchuta Homes assistant. How can I help you today?
                      </p>
                    </div>
                  </div>
                  <div className="pl-9">
                    <p className="mb-2 text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">Quick questions</p>
                    <div className="flex flex-col gap-1.5">
                      {STARTERS.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-xl border border-customPurple-100 bg-customPurple-50/60 px-3 py-2 text-left text-[13px] font-semibold text-customPurple-700 transition-colors hover:border-customPurple-300 hover:bg-customPurple-100"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "items-end"}`}>
                  {m.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3F0C91] to-customPurple-600 text-xs">
                      🏠
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-customPurple-600 text-white"
                        : "rounded-bl-md bg-customPurple-50 text-customBlack-900"
                    }`}
                  >
                    <MessageText text={m.content} />
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3F0C91] to-customPurple-600 text-xs">
                    🏠
                  </div>
                  <TypingIndicator />
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-end gap-2 border-t border-customBlack-50 p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 4000))}
                onKeyDown={handleKey}
                placeholder="Ask anything about our estates…"
                rows={1}
                maxLength={4000}
                className="max-h-24 flex-1 resize-none rounded-xl border border-customBlack-100 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-customPurple-400"
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #3F0C91, #700CEB)" }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
