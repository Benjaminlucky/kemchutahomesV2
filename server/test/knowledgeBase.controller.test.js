/**
 * test/knowledgeBase.controller.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Covers the :id validation gap (a malformed FAQ/notice id must 400, not
 * 500) and the atomic update/delete fix — the old handlers silently reported
 * success ("FAQ updated"/"deleted") for an id that matched nothing, since
 * they never checked whether the $set/$pull actually touched anything. Also
 * covers the new updateNotice endpoint (Show/Hide parity with FAQs).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import "./setup.js";
import { mockReq, mockRes } from "./mockExpress.js";
import { KnowledgeBase } from "../models/knowledgeBase.model.js";
import {
  addFaq,
  updateFaq,
  deleteFaq,
  addNotice,
  updateNotice,
  deleteNotice,
} from "../controllers/knowledgeBase.controller.js";

const ABSENT_ID = "507f1f77bcf86cd799439011";

async function seedFaq() {
  const res = mockRes();
  await addFaq(mockReq({ body: { question: "Q1", answer: "A1" } }), res);
  return res.body.faqs.at(-1);
}

async function seedNotice() {
  const res = mockRes();
  await addNotice(mockReq({ body: { text: "Notice 1" } }), res);
  return res.body.notices.at(-1);
}

describe("FAQ :id validation", () => {
  it("updateFaq answers 400, not 500, for a malformed id", async () => {
    const res = mockRes();
    await updateFaq(mockReq({ params: { faqId: "not-an-id" }, body: { question: "x" } }), res);
    expect(res.statusCode).toBe(400);
  });

  it("deleteFaq answers 400, not 500, for a malformed id", async () => {
    const res = mockRes();
    await deleteFaq(mockReq({ params: { faqId: "not-an-id" } }), res);
    expect(res.statusCode).toBe(400);
  });

  it("updateFaq answers 404 for a well-formed id that matches nothing, instead of a false success", async () => {
    await seedFaq();
    const res = mockRes();
    await updateFaq(mockReq({ params: { faqId: ABSENT_ID }, body: { question: "x" } }), res);
    expect(res.statusCode).toBe(404);
  });

  it("deleteFaq answers 404 for a well-formed id that matches nothing", async () => {
    await seedFaq();
    const res = mockRes();
    await deleteFaq(mockReq({ params: { faqId: ABSENT_ID } }), res);
    expect(res.statusCode).toBe(404);
  });

  it("updateFaq actually updates the matching FAQ", async () => {
    const faq = await seedFaq();
    const res = mockRes();
    await updateFaq(mockReq({ params: { faqId: faq._id.toString() }, body: { active: false } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.faqs.find((f) => f._id.toString() === faq._id.toString()).active).toBe(false);
  });
});

describe("Notice :id validation and updateNotice", () => {
  it("updateNotice answers 400, not 500, for a malformed id", async () => {
    const res = mockRes();
    await updateNotice(mockReq({ params: { id: "not-an-id" }, body: { active: false } }), res);
    expect(res.statusCode).toBe(400);
  });

  it("deleteNotice answers 400, not 500, for a malformed id", async () => {
    const res = mockRes();
    await deleteNotice(mockReq({ params: { id: "not-an-id" } }), res);
    expect(res.statusCode).toBe(400);
  });

  it("updateNotice answers 404 for a well-formed id that matches nothing", async () => {
    await seedNotice();
    const res = mockRes();
    await updateNotice(mockReq({ params: { id: ABSENT_ID }, body: { active: false } }), res);
    expect(res.statusCode).toBe(404);
  });

  it("updateNotice toggles active — the Show/Hide parity FAQs already had", async () => {
    const notice = await seedNotice();
    const res = mockRes();
    await updateNotice(mockReq({ params: { id: notice._id.toString() }, body: { active: false } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.notices.find((n) => n._id.toString() === notice._id.toString()).active).toBe(false);
  });

  it("a newly added notice defaults to active via the model schema", async () => {
    const notice = await seedNotice();
    expect(notice.active).toBe(true);
  });
});

describe("KnowledgeBase model — notice timestamps", () => {
  it("gives each notice its own createdAt", async () => {
    await seedNotice();
    const kb = await KnowledgeBase.findOne({ singleton: "global" });
    expect(kb.notices[0].createdAt).toBeInstanceOf(Date);
  });
});
