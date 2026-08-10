/**
 * controllers/knowledgeBase.controller.js
 * Admin CRUD for the AI chatbot knowledge base.
 */

import { isValidObjectId } from "mongoose";
import { KnowledgeBase } from "../models/knowledgeBase.model.js";
import { triggerRevalidate } from "../utils/revalidate.js";
import { invalidateChatPromptCache } from "../utils/chatPromptCache.js";
import { getCached, invalidateCache } from "../utils/dataCache.js";

const CACHE_KEY = "knowledge-base";
const TTL_MS = 5 * 60 * 1000; // PRD FR-3: same 5 min window as the chat prompt cache

// ── :id guard ────────────────────────────────────────────────────────────────
// Mirrors estate.controller.js's rejectedInvalidId — without it, a malformed
// id reaches a query filter on an ObjectId-typed subdocument _id, throws a
// CastError, and gets reported as a generic 500 for what is plainly bad
// client input. Returns true when it has already sent the response.
const rejectedInvalidId = (req, res, paramName, label) => {
  if (isValidObjectId(req.params[paramName])) return false;
  res.status(400).json({ message: `Invalid ${label} ID` });
  return true;
};

// ── Helper — get or create the singleton doc ──────────────────────────────────
async function getOrCreate() {
  let kb = await KnowledgeBase.findOne({ singleton: "global" }).lean();
  if (!kb) kb = await KnowledgeBase.create({ singleton: "global" }).then((doc) => doc.toObject());
  return kb;
}

// ── GET /api/knowledge-base  (public — used by chat controller) ───────────────
export const getKnowledgeBase = async (req, res) => {
  try {
    const kb = await getCached(CACHE_KEY, TTL_MS, getOrCreate);
    res.set("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
    res.json(kb);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch knowledge base" });
  }
};

// ── PUT /api/knowledge-base/company-info  (admin) ─────────────────────────────
export const updateCompanyInfo = async (req, res) => {
  try {
    const allowed = [
      "lagosPhone",
      "asabaPhone",
      "whatsappNumber",
      "email",
      "lagosAddress",
      "asabaAddress",
      "workingHours",
      "instagramHandle",
    ];
    const update = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) update[`companyInfo.${k}`] = req.body[k];
    });

    const kb = await KnowledgeBase.findOneAndUpdate(
      { singleton: "global" },
      { $set: update },
      { new: true, upsert: true },
    );
    triggerRevalidate(["knowledge-base"]);
    invalidateChatPromptCache();
    invalidateCache(CACHE_KEY);
    res.json({ message: "Company info updated", companyInfo: kb.companyInfo });
  } catch (err) {
    res.status(500).json({ message: "Failed to update company info" });
  }
};

// ── POST /api/knowledge-base/faqs  (admin) ────────────────────────────────────
export const addFaq = async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    if (!question?.trim() || !answer?.trim())
      return res
        .status(400)
        .json({ message: "Question and answer are required" });

    const kb = await KnowledgeBase.findOneAndUpdate(
      { singleton: "global" },
      {
        $push: {
          faqs: {
            question: question.trim(),
            answer: answer.trim(),
            category: category || "General",
          },
        },
      },
      { new: true, upsert: true },
    );
    triggerRevalidate(["knowledge-base"]);
    invalidateChatPromptCache();
    invalidateCache(CACHE_KEY);
    res.status(201).json({ message: "FAQ added", faqs: kb.faqs });
  } catch (err) {
    res.status(500).json({ message: "Failed to add FAQ" });
  }
};

// ── PUT /api/knowledge-base/faqs/:faqId  (admin) ─────────────────────────────
export const updateFaq = async (req, res) => {
  if (rejectedInvalidId(req, res, "faqId", "FAQ")) return;
  try {
    const { question, answer, category, active } = req.body;
    const update = {};
    if (question !== undefined) update["faqs.$.question"] = question.trim();
    if (answer !== undefined) update["faqs.$.answer"] = answer.trim();
    if (category !== undefined) update["faqs.$.category"] = category;
    if (active !== undefined) update["faqs.$.active"] = active;

    // Filtering on "faqs._id" too (not just the singleton) means a stale or
    // already-deleted faqId returns null here instead of silently matching
    // zero array elements and reporting success anyway.
    const kb = await KnowledgeBase.findOneAndUpdate(
      { singleton: "global", "faqs._id": req.params.faqId },
      { $set: update },
      { new: true },
    );
    if (!kb) return res.status(404).json({ message: "FAQ not found" });

    triggerRevalidate(["knowledge-base"]);
    invalidateChatPromptCache();
    invalidateCache(CACHE_KEY);
    res.json({ message: "FAQ updated", faqs: kb.faqs });
  } catch (err) {
    console.error("updateFaq:", err);
    res.status(500).json({ message: "Failed to update FAQ" });
  }
};

// ── DELETE /api/knowledge-base/faqs/:faqId  (admin) ──────────────────────────
export const deleteFaq = async (req, res) => {
  if (rejectedInvalidId(req, res, "faqId", "FAQ")) return;
  try {
    const kb = await KnowledgeBase.findOneAndUpdate(
      { singleton: "global", "faqs._id": req.params.faqId },
      { $pull: { faqs: { _id: req.params.faqId } } },
      { new: true },
    );
    if (!kb) return res.status(404).json({ message: "FAQ not found" });

    triggerRevalidate(["knowledge-base"]);
    invalidateChatPromptCache();
    invalidateCache(CACHE_KEY);
    res.json({ message: "FAQ deleted", faqs: kb.faqs });
  } catch (err) {
    console.error("deleteFaq:", err);
    res.status(500).json({ message: "Failed to delete FAQ" });
  }
};

// ── POST /api/knowledge-base/notices  (admin) ─────────────────────────────────
export const addNotice = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ message: "Notice text is required" });

    const kb = await KnowledgeBase.findOneAndUpdate(
      { singleton: "global" },
      { $push: { notices: { text: text.trim(), active: true } } },
      { new: true, upsert: true },
    );
    triggerRevalidate(["knowledge-base"]);
    invalidateChatPromptCache();
    invalidateCache(CACHE_KEY);
    res.status(201).json({ message: "Notice added", notices: kb.notices });
  } catch (err) {
    res.status(500).json({ message: "Failed to add notice" });
  }
};

// ── PUT /api/knowledge-base/notices/:id  (admin) — text and/or active ────────
export const updateNotice = async (req, res) => {
  if (rejectedInvalidId(req, res, "id", "notice")) return;
  try {
    const { text, active } = req.body;
    const update = {};
    if (text !== undefined) update["notices.$.text"] = text.trim();
    if (active !== undefined) update["notices.$.active"] = active;

    const kb = await KnowledgeBase.findOneAndUpdate(
      { singleton: "global", "notices._id": req.params.id },
      { $set: update },
      { new: true },
    );
    if (!kb) return res.status(404).json({ message: "Notice not found" });

    triggerRevalidate(["knowledge-base"]);
    invalidateChatPromptCache();
    invalidateCache(CACHE_KEY);
    res.json({ message: "Notice updated", notices: kb.notices });
  } catch (err) {
    console.error("updateNotice:", err);
    res.status(500).json({ message: "Failed to update notice" });
  }
};

// ── DELETE /api/knowledge-base/notices/:id  (admin) ───────────────────────────
export const deleteNotice = async (req, res) => {
  if (rejectedInvalidId(req, res, "id", "notice")) return;
  try {
    const kb = await KnowledgeBase.findOneAndUpdate(
      { singleton: "global", "notices._id": req.params.id },
      { $pull: { notices: { _id: req.params.id } } },
      { new: true },
    );
    if (!kb) return res.status(404).json({ message: "Notice not found" });

    triggerRevalidate(["knowledge-base"]);
    invalidateChatPromptCache();
    invalidateCache(CACHE_KEY);
    res.json({ message: "Notice deleted", notices: kb.notices });
  } catch (err) {
    console.error("deleteNotice:", err);
    res.status(500).json({ message: "Failed to delete notice" });
  }
};
