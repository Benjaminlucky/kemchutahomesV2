/**
 * test/branch.schema.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Branch offices are the "Contact Info" admin page's underlying resource, and
 * mapLink/mapEmbedUrl/social.* get rendered as raw hrefs and an iframe src on
 * the public Contact page (client/src/components/contact/Contact.tsx) — a
 * "javascript:" value in any of those fields would previously have passed
 * validation untouched and executed in a visitor's browser when clicked. This
 * locks down the safeUrl guard added to close that gap, plus the branchId
 * slug format and per-item email validation added alongside it.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import { createBranchSchema, updateBranchSchema } from "../schemas/branch.schema.js";

const BASE = { branchId: "lagos", label: "Lagos" };

describe("branch schema — safeUrl fields (mapLink, mapEmbedUrl, social.*)", () => {
  it("rejects a javascript: URI in mapLink", () => {
    const result = createBranchSchema.safeParse({ ...BASE, mapLink: "javascript:alert(1)" });
    expect(result.success).toBe(false);
  });

  it("rejects a javascript: URI in a social field", () => {
    const result = createBranchSchema.safeParse({
      ...BASE,
      social: { instagram: "javascript:alert(document.cookie)" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects plain non-URL text in mapEmbedUrl", () => {
    const result = createBranchSchema.safeParse({ ...BASE, mapEmbedUrl: "not a url" });
    expect(result.success).toBe(false);
  });

  it("rejects a plain http:// URL — only https is allowed", () => {
    const result = createBranchSchema.safeParse({ ...BASE, mapLink: "http://example.com" });
    expect(result.success).toBe(false);
  });

  it("accepts an empty string (field left unset)", () => {
    const result = createBranchSchema.safeParse({ ...BASE, mapLink: "", mapEmbedUrl: "" });
    expect(result.success).toBe(true);
  });

  it("accepts a valid https:// URL", () => {
    const result = createBranchSchema.safeParse({
      ...BASE,
      mapLink: "https://maps.google.com/?q=Lekki",
      social: { whatsapp: "https://wa.me/2348000000001" },
    });
    expect(result.success).toBe(true);
  });

  it("applies the same rule on update", () => {
    const result = updateBranchSchema.safeParse({ mapEmbedUrl: "javascript:alert(1)" });
    expect(result.success).toBe(false);
  });
});

describe("branch schema — branchId slug format", () => {
  it("rejects a branchId containing spaces", () => {
    const result = createBranchSchema.safeParse({ ...BASE, branchId: "port harcourt" });
    expect(result.success).toBe(false);
  });

  it("rejects a branchId containing punctuation", () => {
    const result = createBranchSchema.safeParse({ ...BASE, branchId: "port!harcourt" });
    expect(result.success).toBe(false);
  });

  it("accepts letters, numbers, and hyphens", () => {
    const result = createBranchSchema.safeParse({ ...BASE, branchId: "port-harcourt-2" });
    expect(result.success).toBe(true);
  });
});

describe("branch schema — emails array", () => {
  it("rejects an invalid email in the array", () => {
    const result = createBranchSchema.safeParse({ ...BASE, emails: ["not-an-email"] });
    expect(result.success).toBe(false);
  });

  it("accepts a well-formed email", () => {
    const result = createBranchSchema.safeParse({ ...BASE, emails: ["branch@kemchutahomesltd.com"] });
    expect(result.success).toBe(true);
  });
});
