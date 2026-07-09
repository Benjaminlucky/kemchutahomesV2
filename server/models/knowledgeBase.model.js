/**
 * models/knowledgeBase.model.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Stores admin-managed knowledge that the AI chatbot uses at runtime.
 * Three collections per document (singleton pattern like ROISettings):
 *   • faqs         — Q&A pairs (e.g. "What is the withdrawal policy?")
 *   • companyInfo  — phone, WhatsApp, hours, addresses
 *   • notices      — temporary announcements ("New estate launching soon")
 * ─────────────────────────────────────────────────────────────────────────────
 */

import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: {
      type: String,
      default: "General",
      enum: [
        "General",
        "Subscription",
        "Buy2Sell",
        "Inspection",
        "Documents",
        "Payment",
      ],
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const knowledgeBaseSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "global", unique: true },

    // Company contact info — editable by admin
    companyInfo: {
      lagosPhone: { type: String, default: "+234 800 000 0001" },
      asabaPhone: { type: String, default: "+234 800 000 0003" },
      whatsappNumber: { type: String, default: "+234 800 000 0001" },
      email: { type: String, default: "info@kemchutahomesltd.com" },
      lagosAddress: {
        type: String,
        default: "Lekki-Epe Expressway, Abijo, Lekki Peninsula, Lagos State",
      },
      asabaAddress: { type: String, default: "Asaba, Delta State" },
      workingHours: {
        type: String,
        default: "Monday–Friday 8am–6pm, Saturday 9am–4pm, Closed Sunday",
      },
      instagramHandle: { type: String, default: "@kemchutahomesltd" },
    },

    // FAQ pairs — full CRUD from admin dashboard
    faqs: { type: [faqSchema], default: [] },

    // Notices — temporary announcements injected into AI context
    notices: { type: [{ text: String, active: Boolean }], default: [] },
  },
  { timestamps: true },
);

export const KnowledgeBase =
  mongoose.models.KnowledgeBase ||
  mongoose.model("KnowledgeBase", knowledgeBaseSchema);
