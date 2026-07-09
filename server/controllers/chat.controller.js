/**
 * controllers/chat.controller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * AI chat endpoint — Groq (Llama 3.3 70B, free tier).
 * Builds a DYNAMIC system prompt from live MongoDB data on every request:
 *   • Estates   — names, locations, prices, titles (from Estate collection)
 *   • ROI rates — live from ROISettings collection
 *   • FAQs, company info, notices — from KnowledgeBase collection (admin-managed)
 *
 * This means:
 *   - Admin updates estate price → chatbot immediately quotes the new price
 *   - Admin adds an FAQ → chatbot uses it verbatim
 *   - Admin changes phone number → chatbot uses the new number
 *   No redeployment, no code changes needed.
 *
 * POST /api/chat
 * Body: { messages: [{ role: "user"|"assistant", content: string }] }
 * Returns: { reply: string }
 *
 * .env: GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Estate from "../models/estate.model.js";
import { ROISettings } from "../models/Buy2sell.model.js";
import { KnowledgeBase } from "../models/knowledgeBase.model.js";
import { getCachedSystemPrompt } from "../utils/chatPromptCache.js";

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic system prompt builder — queries MongoDB on every chat request
// ─────────────────────────────────────────────────────────────────────────────
async function buildSystemPrompt() {
  // Fetch all live data in parallel — failures are caught individually
  const [estates, roi, kb] = await Promise.all([
    Estate.find({})
      .select(
        "estate location address price sqm title purpose desc paymentPlans",
      )
      .lean()
      .catch(() => []),
    ROISettings.findOne({ singleton: "global" })
      .lean()
      .catch(() => null),
    KnowledgeBase.findOne({ singleton: "global" })
      .lean()
      .catch(() => null),
  ]);

  // ── Company info ──────────────────────────────────────────────────────────
  const info = kb?.companyInfo || {};
  const lagosPhone = info.lagosPhone || "+234 800 000 0001";
  const asabaPhone = info.asabaPhone || "+234 800 000 0003";
  const whatsapp = info.whatsappNumber || "+234 800 000 0001";
  const email = info.email || "info@kemchutahomesltd.com";
  const lagosAddr =
    info.lagosAddress ||
    "Lekki-Epe Expressway, Abijo, Lekki Peninsula, Lagos State";
  const asabaAddr = info.asabaAddress || "Asaba, Delta State";
  const hours =
    info.workingHours ||
    "Monday–Friday 8am–6pm, Saturday 9am–4pm, Closed Sunday";
  const instagram = info.instagramHandle || "@kemchutahomesltd";

  // ── ROI rates ─────────────────────────────────────────────────────────────
  const roi6 = roi?.roiPercent6Months ?? 22;
  const roi12 = roi?.roiPercent12Months ?? 48;
  const roi18 = roi?.roiPercent18Months ?? 75;
  const minInv = roi?.minInvestment
    ? `₦${Number(roi.minInvestment).toLocaleString("en-NG")}`
    : "₦1,000,000";
  const maxInv = roi?.maxInvestment
    ? `₦${Number(roi.maxInvestment).toLocaleString("en-NG")}`
    : "₦50,000,000";

  // ── Estates block ─────────────────────────────────────────────────────────
  const byLocation = {};
  (estates || []).forEach((e) => {
    const loc = e.location || "Nigeria";
    if (!byLocation[loc]) byLocation[loc] = [];
    byLocation[loc].push(
      `  • ${e.estate} | Address: ${e.address} | Price: ${e.price} per ${e.sqm}` +
        ` | Title: ${e.title} | Purpose: ${e.purpose}` +
        (e.desc ? ` | ${e.desc.slice(0, 100)}…` : ""),
    );
  });
  const estatesBlock = Object.keys(byLocation).length
    ? Object.entries(byLocation)
        .map(([loc, list]) => `${loc.toUpperCase()}:\n${list.join("\n")}`)
        .join("\n\n")
    : "Contact us for current estate listings.";

  // ── Admin-managed FAQs ────────────────────────────────────────────────────
  const activeFaqs = (kb?.faqs || []).filter((f) => f.active !== false);
  const faqsBlock = activeFaqs.length
    ? activeFaqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
    : "";

  // ── Active notices ────────────────────────────────────────────────────────
  const activeNotices = (kb?.notices || []).filter((n) => n.active);
  const noticesBlock = activeNotices.length
    ? "⚡ CURRENT ANNOUNCEMENTS (mention these when relevant):\n" +
      activeNotices.map((n) => `• ${n.text}`).join("\n") +
      "\n"
    : "";

  // ── B2S example calculation ───────────────────────────────────────────────
  const exROI = Math.round((5_000_000 * roi12) / 100);
  const exTotal = 5_000_000 + exROI;

  return `You are Kemchuta, the friendly and knowledgeable AI assistant for Kemchuta Homes Limited — a reputable Nigerian real estate company.

Your role: answer visitor questions instantly and accurately, reduce calls to the team, and guide potential clients toward booking inspections or subscribing.

${noticesBlock}
═══ COMPANY CONTACTS (always use these exact details) ═══

Email: ${email}
Lagos Office: ${lagosAddr} | Tel: ${lagosPhone}
Asaba Office: ${asabaAddr} | Tel: ${asabaPhone}
WhatsApp: ${whatsapp}
Instagram: ${instagram}
Hours: ${hours}

═══ CURRENT ESTATES (LIVE FROM DATABASE) ═══

${estatesBlock}

Rules for estate questions:
- List only estates in the location the client asks about
- Always use the exact price from the data above
- Format each estate as a bullet line exactly like this:
  * **Estate Name** — ₦Price per Xsqm | Title: X | Purpose: X
- After the list add: "Contact us to confirm current plot availability."
- If no estates listed for a location, say so honestly and give contact details

═══ BUY2SELL INVESTMENT (LIVE RATES FROM DATABASE) ═══

Range: ${minInv} – ${maxInv}
Current ROI rates (locked in at time of investment):
  6 Months  → ${roi6}%
  12 Months → ${roi12}%
  18 Months → ${roi18}%

Example: ₦5,000,000 × 12 months @ ${roi12}% = ₦${exROI.toLocaleString("en-NG")} ROI → ₦${exTotal.toLocaleString("en-NG")} total payout

Process:
1. Choose amount (${minInv}–${maxInv}) and duration
2. Complete KYC (name, contact, ID number — no document upload)
3. Transfer principal, quote reference number
4. Activated on full payment confirmation
5. Payout (principal + ROI) within 14 working days of maturity

Key facts: ROI is permanently locked at submission. 1 month = 30 days exactly. Capital guaranteed. Early withdrawal = 50% forfeiture of accrued ROI.

═══ LAND SUBSCRIPTION ═══

Plans: Outright (full payment) or Instalment (30% deposit, balance monthly — 30-day intervals)
Process: Form → Acknowledgement email → Team calls within 24–48h → Pay deposit → Contract of Sale → Monthly instalments → Allocation Letter + Deed of Assignment
Title types: C of O, Registered Survey, Excision, Governor's Consent
Withdrawal: 90 days notice, 40% admin + 10% agency fee deducted

═══ INSPECTIONS ═══

Free. Book at kemchutahomesltd.com → Book Inspection.
Bring: valid ID + comfortable footwear. Team confirms within 24 hours.

═══ CLIENT PORTAL ═══

kemchutahomesltd.com/client/portal — subscription status, documents, Buy2Sell progress, payment history.

${faqsBlock ? `═══ FREQUENTLY ASKED QUESTIONS (use these answers verbatim) ═══\n\n${faqsBlock}` : ""}

═══ BEHAVIOUR RULES ═══

DO:
• Be warm, direct, and concise (≤200 words unless detail needed)
• Use bullet points for processes
• Give EXACT prices and rates from the live data above
• End with a clear next step or call to action

DO NOT:
• Say "I don't have that information" for anything listed above — you have it
• Invent prices, estates, or availability not in the data above
• Collect passwords or payment card details
• Discuss competitors

Escalation phrase (when you truly cannot help): "For this, please call ${lagosPhone} (Lagos) or ${asabaPhone} (Asaba), or WhatsApp us on ${whatsapp}. We're available ${hours}."`;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat
// ─────────────────────────────────────────────────────────────────────────────
export const handleChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "messages array is required" });
    }

    const valid = messages.every(
      (m) =>
        m.role &&
        ["user", "assistant"].includes(m.role) &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    );
    if (!valid) {
      return res.status(400).json({ message: "Invalid message format" });
    }

    // Build the dynamic prompt (cached, TTL 5 min — see utils/chatPromptCache.js)
    // + trim history to last 20 messages
    const [systemPrompt, trimmed] = await Promise.all([
      getCachedSystemPrompt(buildSystemPrompt),
      Promise.resolve(messages.slice(-20)),
    ]);

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 600,
          temperature: 0.4,
          messages: [{ role: "system", content: systemPrompt }, ...trimmed],
        }),
      },
    );

    if (!groqRes.ok) {
      const errBody = await groqRes.json().catch(() => ({}));
      throw new Error(
        errBody?.error?.message || `Groq API error ${groqRes.status}`,
      );
    }

    const data = await groqRes.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't generate a response. Please call +234 800 000 0001.";

    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({
      message: "Chat unavailable right now. Please call +234 800 000 0001.",
    });
  }
};
