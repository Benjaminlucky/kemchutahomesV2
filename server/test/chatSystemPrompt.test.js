/**
 * test/chatSystemPrompt.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * The AI chatbot's "COMPANY CONTACTS" block used to be built entirely from
 * the KnowledgeBase collection's static companyInfo fields, completely
 * disconnected from the Branch collection ("Contact Info" admin page) that
 * is the actual source of truth for office phone/address everywhere else on
 * the site. An admin updating a branch's phone number saw zero effect on
 * what the chatbot told customers. This locks down the fix: live, active
 * Branch data now drives the prompt, for any number of offices, with the
 * legacy KnowledgeBase fields kept only as a last-resort fallback.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import "./setup.js";
import Branch from "../models/branch.model.js";
import { KnowledgeBase } from "../models/knowledgeBase.model.js";
import { buildSystemPrompt, getFallbackPhone } from "../controllers/chat.controller.js";

describe("buildSystemPrompt — company contacts from live Branch data", () => {
  it("uses a branch's real phone/address instead of the stale KnowledgeBase fields", async () => {
    await KnowledgeBase.create({
      singleton: "global",
      companyInfo: { lagosPhone: "+234 000 000 0000", lagosAddress: "Stale Old Address" },
    });
    await Branch.create({
      branchId: "lagos",
      label: "Lagos",
      isHQ: true,
      address: "Fresh New HQ Address",
      phones: ["+234 900 000 0009"],
      isActive: true,
    });

    const prompt = await buildSystemPrompt();

    expect(prompt).toContain("Fresh New HQ Address");
    expect(prompt).toContain("+234 900 000 0009");
    expect(prompt).not.toContain("Stale Old Address");
    expect(prompt).not.toContain("+234 000 000 0000");
  });

  it("lists every active branch, not just a hardcoded Lagos/Asaba pair", async () => {
    await KnowledgeBase.create({ singleton: "global" });
    await Branch.create({ branchId: "lagos", label: "Lagos", isHQ: true, phones: ["+234 111 111 1111"], isActive: true });
    await Branch.create({ branchId: "asaba", label: "Asaba", phones: ["+234 222 222 2222"], isActive: true });
    await Branch.create({ branchId: "abuja", label: "Abuja", phones: ["+234 333 333 3333"], isActive: true });

    const prompt = await buildSystemPrompt();

    expect(prompt).toContain("Lagos (HQ) Office");
    expect(prompt).toContain("Asaba Office");
    expect(prompt).toContain("Abuja Office");
    expect(prompt).toContain("+234 333 333 3333");
  });

  it("excludes inactive branches", async () => {
    await KnowledgeBase.create({ singleton: "global" });
    await Branch.create({ branchId: "lagos", label: "Lagos", isHQ: true, phones: ["+234 111 111 1111"], isActive: true });
    await Branch.create({ branchId: "closed", label: "Closed Branch", phones: ["+234 999 999 9999"], isActive: false });

    const prompt = await buildSystemPrompt();

    expect(prompt).not.toContain("Closed Branch");
    expect(prompt).not.toContain("+234 999 999 9999");
  });

  it("falls back to the legacy KnowledgeBase fields when no branches exist", async () => {
    await KnowledgeBase.create({
      singleton: "global",
      companyInfo: { lagosPhone: "+234 800 000 0001", lagosAddress: "Fallback Address" },
    });

    const prompt = await buildSystemPrompt();

    expect(prompt).toContain("Fallback Address");
    expect(prompt).toContain("+234 800 000 0001");
  });

  it("the escalation phrase uses the HQ branch's phone, not a hardcoded Lagos/Asaba pair", async () => {
    await KnowledgeBase.create({ singleton: "global", companyInfo: { whatsappNumber: "+234 700 000 0007" } });
    await Branch.create({ branchId: "lagos", label: "Lagos", isHQ: true, phones: ["+234 900 000 0009"], isActive: true });

    const prompt = await buildSystemPrompt();

    expect(prompt).toContain("please call +234 900 000 0009 or WhatsApp us on +234 700 000 0007");
  });
});

describe("getFallbackPhone — used when the AI itself is unavailable", () => {
  it("uses the HQ branch's real phone instead of a hardcoded placeholder", async () => {
    await Branch.create({ branchId: "lagos", label: "Lagos", isHQ: true, phones: ["+234 916 099 9960"], isActive: true });

    expect(await getFallbackPhone()).toBe("+234 916 099 9960");
  });

  it("falls back to a hardcoded default when there is no active branch at all", async () => {
    expect(await getFallbackPhone()).toBe("+234 800 000 0001");
  });
});
