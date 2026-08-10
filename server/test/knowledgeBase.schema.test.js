/**
 * test/knowledgeBase.schema.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * FAQ answers and notice text are injected verbatim into the AI's system
 * prompt on every chat request with no downstream truncation, so the max
 * length caps here are an availability safeguard, not just tidiness. The
 * company-info email field previously accepted any string even though it's
 * displayed to real customers via the chatbot — this locks down both.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import {
  updateCompanyInfoSchema,
  addFaqSchema,
  updateFaqSchema,
  addNoticeSchema,
  updateNoticeSchema,
} from "../schemas/knowledgeBase.schema.js";

describe("updateCompanyInfoSchema — email", () => {
  it("accepts a valid email", () => {
    expect(updateCompanyInfoSchema.safeParse({ email: "info@kemchutahomesltd.com" }).success).toBe(true);
  });

  it("accepts an empty string (field cleared)", () => {
    expect(updateCompanyInfoSchema.safeParse({ email: "" }).success).toBe(true);
  });

  it("rejects a malformed email", () => {
    expect(updateCompanyInfoSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });

  it("omitting email entirely is fine (all fields optional)", () => {
    expect(updateCompanyInfoSchema.safeParse({ lagosPhone: "+234 800 000 0001" }).success).toBe(true);
  });
});

describe("addFaqSchema / updateFaqSchema — length caps", () => {
  const BASE = { question: "What is Buy2Sell?", answer: "A land-bank investment scheme." };

  it("accepts a normal FAQ", () => {
    expect(addFaqSchema.safeParse(BASE).success).toBe(true);
  });

  it("rejects an excessively long question", () => {
    expect(addFaqSchema.safeParse({ ...BASE, question: "a".repeat(301) }).success).toBe(false);
  });

  it("rejects an excessively long answer", () => {
    expect(addFaqSchema.safeParse({ ...BASE, answer: "a".repeat(2001) }).success).toBe(false);
  });

  it("applies the same caps on update", () => {
    expect(updateFaqSchema.safeParse({ answer: "a".repeat(2001) }).success).toBe(false);
  });
});

describe("addNoticeSchema / updateNoticeSchema", () => {
  it("accepts a normal notice", () => {
    expect(addNoticeSchema.safeParse({ text: "New estate launching soon!" }).success).toBe(true);
  });

  it("rejects an excessively long notice", () => {
    expect(addNoticeSchema.safeParse({ text: "a".repeat(301) }).success).toBe(false);
  });

  it("updateNoticeSchema accepts an active-only patch", () => {
    expect(updateNoticeSchema.safeParse({ active: false }).success).toBe(true);
  });
});
