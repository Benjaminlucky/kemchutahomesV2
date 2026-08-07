/**
 * test/contact.schema.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * The public "submit contact form" endpoint (POST /api/contact) is
 * unauthenticated and rate-limited (5/hour/IP), but the schema itself had no
 * length caps on name/subject/message — the only thing standing between a
 * single request and a multi-hundred-KB email being built and sent was the
 * app-wide 1mb body limit. Locks down the caps added alongside the branch
 * schema hardening.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import { submitContactFormSchema } from "../schemas/contact.schema.js";

const BASE = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "General Enquiry",
  message: "Hello, I would like more information.",
};

describe("submitContactFormSchema — length caps", () => {
  it("accepts a normal-sized submission", () => {
    expect(submitContactFormSchema.safeParse(BASE).success).toBe(true);
  });

  it("rejects an excessively long name", () => {
    const result = submitContactFormSchema.safeParse({ ...BASE, name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects an excessively long subject", () => {
    const result = submitContactFormSchema.safeParse({ ...BASE, subject: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects an excessively long message", () => {
    const result = submitContactFormSchema.safeParse({ ...BASE, message: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  it("rejects an excessively long phone number", () => {
    const result = submitContactFormSchema.safeParse({ ...BASE, phone: "1".repeat(31) });
    expect(result.success).toBe(false);
  });
});
