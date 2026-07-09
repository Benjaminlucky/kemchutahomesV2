/**
 * controllers/knowledgeBase.controller.js
 * Admin CRUD for the AI chatbot knowledge base.
 */

import { KnowledgeBase } from "../models/knowledgeBase.model.js";
import { triggerRevalidate } from "../utils/revalidate.js";
import { invalidateChatPromptCache } from "../utils/chatPromptCache.js";

// ── Helper — get or create the singleton doc ──────────────────────────────────
async function getOrCreate() {
  let kb = await KnowledgeBase.findOne({ singleton: "global" });
  if (!kb) kb = await KnowledgeBase.create({ singleton: "global" });
  return kb;
}

// ── GET /api/knowledge-base  (public — used by chat controller) ───────────────
export const getKnowledgeBase = async (req, res) => {
  try {
    const kb = await getOrCreate();
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
    res.status(201).json({ message: "FAQ added", faqs: kb.faqs });
  } catch (err) {
    res.status(500).json({ message: "Failed to add FAQ" });
  }
};

// ── PUT /api/knowledge-base/faqs/:faqId  (admin) ─────────────────────────────
export const updateFaq = async (req, res) => {
  try {
    const { question, answer, category, active } = req.body;
    const update = {};
    if (question !== undefined) update["faqs.$.question"] = question.trim();
    if (answer !== undefined) update["faqs.$.answer"] = answer.trim();
    if (category !== undefined) update["faqs.$.category"] = category;
    if (active !== undefined) update["faqs.$.active"] = active;

    await KnowledgeBase.updateOne(
      { singleton: "global", "faqs._id": req.params.faqId },
      { $set: update },
    );
    const kb = await KnowledgeBase.findOne({ singleton: "global" });
    triggerRevalidate(["knowledge-base"]);
    invalidateChatPromptCache();
    res.json({ message: "FAQ updated", faqs: kb.faqs });
  } catch (err) {
    res.status(500).json({ message: "Failed to update FAQ" });
  }
};

// ── DELETE /api/knowledge-base/faqs/:faqId  (admin) ──────────────────────────
export const deleteFaq = async (req, res) => {
  try {
    const kb = await KnowledgeBase.findOneAndUpdate(
      { singleton: "global" },
      { $pull: { faqs: { _id: req.params.faqId } } },
      { new: true },
    );
    triggerRevalidate(["knowledge-base"]);
    invalidateChatPromptCache();
    res.json({ message: "FAQ deleted", faqs: kb.faqs });
  } catch (err) {
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
    res.status(201).json({ message: "Notice added", notices: kb.notices });
  } catch (err) {
    res.status(500).json({ message: "Failed to add notice" });
  }
};

// ── DELETE /api/knowledge-base/notices/:id  (admin) ───────────────────────────
export const deleteNotice = async (req, res) => {
  try {
    const kb = await KnowledgeBase.findOneAndUpdate(
      { singleton: "global" },
      { $pull: { notices: { _id: req.params.id } } },
      { new: true },
    );
    triggerRevalidate(["knowledge-base"]);
    invalidateChatPromptCache();
    res.json({ message: "Notice deleted", notices: kb.notices });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notice" });
  }
};
