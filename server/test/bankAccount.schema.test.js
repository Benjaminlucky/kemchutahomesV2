/**
 * test/bankAccount.schema.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * accountNumber/sortCode used to accept any non-empty string, including
 * letters and symbols, despite being rendered verbatim as real wire-transfer
 * instructions in customer-facing subscription/Buy2Sell emails and PDFs.
 * Locks down the digits-only + length guard added to close that gap.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import { createBankAccountSchema, updateBankAccountSchema } from "../schemas/bankAccount.schema.js";

const BASE = {
  bankName: "Access Bank",
  accountName: "Kemchuta Homes Limited",
  accountNumber: "0123456789",
};

describe("bankAccount schema — accountNumber", () => {
  it("accepts a well-formed digits-only account number", () => {
    expect(createBankAccountSchema.safeParse(BASE).success).toBe(true);
  });

  it("rejects letters in the account number", () => {
    const result = createBankAccountSchema.safeParse({ ...BASE, accountNumber: "ABC123456" });
    expect(result.success).toBe(false);
  });

  it("rejects a placeholder like 'Contact admin'", () => {
    const result = createBankAccountSchema.safeParse({ ...BASE, accountNumber: "Contact admin" });
    expect(result.success).toBe(false);
  });

  it("rejects an account number that is too short", () => {
    const result = createBankAccountSchema.safeParse({ ...BASE, accountNumber: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects an account number that is too long", () => {
    const result = createBankAccountSchema.safeParse({ ...BASE, accountNumber: "1".repeat(21) });
    expect(result.success).toBe(false);
  });

  it("applies the same rule on update", () => {
    const result = updateBankAccountSchema.safeParse({ accountNumber: "not-a-number" });
    expect(result.success).toBe(false);
  });
});

describe("bankAccount schema — sortCode", () => {
  it("accepts digits and hyphens", () => {
    expect(createBankAccountSchema.safeParse({ ...BASE, sortCode: "12-34-56" }).success).toBe(true);
  });

  it("rejects letters", () => {
    const result = createBankAccountSchema.safeParse({ ...BASE, sortCode: "AB-34-56" });
    expect(result.success).toBe(false);
  });

  it("is optional", () => {
    expect(createBankAccountSchema.safeParse(BASE).success).toBe(true);
  });
});
