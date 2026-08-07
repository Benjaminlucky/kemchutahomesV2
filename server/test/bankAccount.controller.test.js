/**
 * test/bankAccount.controller.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * The company's own receiving bank accounts — rendered as real payment
 * instructions in subscription/Buy2Sell customer emails and PDFs, so the
 * "exactly one primary, at least one active, primary must be active"
 * invariant has direct financial consequences if it silently breaks.
 *
 * Covers: the :id validation gap (malformed id must 400, not 500), the
 * demote-then-write reordering (a request that never reaches the target
 * document must never demote the real primary), and the active/primary
 * guards that didn't exist before (can't deactivate/delete the last active
 * account, can't make an inactive account primary, delete only ever
 * promotes an active replacement).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import "./setup.js";
import { mockReq, mockRes } from "./mockExpress.js";
import BankAccount from "../models/BankAccount.model.js";
import {
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "../controllers/Bankaccount.controller.js";

async function makeAccount(overrides = {}) {
  return BankAccount.create({
    bankName: "Access Bank",
    accountName: "Kemchuta Homes Limited",
    accountNumber: "0123456789",
    isActive: true,
    isPrimary: false,
    ...overrides,
  });
}

describe(":id validation", () => {
  it("updateBankAccount answers 400, not 500, for a malformed id", async () => {
    const res = mockRes();
    await updateBankAccount(mockReq({ params: { id: "not-an-id" }, body: { bankName: "X" } }), res);
    expect(res.statusCode).toBe(400);
  });

  it("deleteBankAccount answers 400, not 500, for a malformed id", async () => {
    const res = mockRes();
    await deleteBankAccount(mockReq({ params: { id: "not-an-id" } }), res);
    expect(res.statusCode).toBe(400);
  });
});

describe("createBankAccount", () => {
  it("makes the very first account primary regardless of the isPrimary flag sent", async () => {
    const res = mockRes();
    await createBankAccount(
      mockReq({ body: { bankName: "Access Bank", accountName: "KHL", accountNumber: "0123456789" } }),
      res,
    );

    expect(res.statusCode).toBe(201);
    expect(res.body.account.isPrimary).toBe(true);
  });

  it("demotes the previous primary only after the new one is created", async () => {
    const first = await makeAccount({ isPrimary: true });

    const res = mockRes();
    await createBankAccount(
      mockReq({
        body: {
          bankName: "GTBank",
          accountName: "KHL",
          accountNumber: "9876543210",
          isPrimary: true,
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(201);
    const primaries = await BankAccount.find({ isPrimary: true });
    expect(primaries).toHaveLength(1);
    expect(primaries[0]._id.toString()).toBe(res.body.account._id.toString());
    expect((await BankAccount.findById(first._id)).isPrimary).toBe(false);
  });
});

describe("updateBankAccount — primary/active invariant", () => {
  it("a well-formed id for a document that no longer exists never demotes the real primary", async () => {
    const primary = await makeAccount({ isPrimary: true });

    const res = mockRes();
    await updateBankAccount(
      mockReq({ params: { id: "507f1f77bcf86cd799439011" }, body: { isPrimary: true } }),
      res,
    );

    expect(res.statusCode).toBe(404);
    expect((await BankAccount.findById(primary._id)).isPrimary).toBe(true);
  });

  it("making an account primary demotes the previous primary", async () => {
    const primary = await makeAccount({ isPrimary: true });
    const other = await makeAccount({ isPrimary: false });

    const res = mockRes();
    await updateBankAccount(mockReq({ params: { id: other._id.toString() }, body: { isPrimary: true } }), res);

    expect(res.statusCode).toBe(200);
    expect((await BankAccount.findById(other._id)).isPrimary).toBe(true);
    expect((await BankAccount.findById(primary._id)).isPrimary).toBe(false);
  });

  it("refuses to make an inactive account primary", async () => {
    await makeAccount({ isPrimary: true });
    const inactive = await makeAccount({ isActive: false });

    const res = mockRes();
    await updateBankAccount(mockReq({ params: { id: inactive._id.toString() }, body: { isPrimary: true } }), res);

    expect(res.statusCode).toBe(400);
    expect((await BankAccount.findById(inactive._id)).isPrimary).toBe(false);
  });

  it("refuses to deactivate the only active account", async () => {
    const only = await makeAccount({ isPrimary: true, isActive: true });

    const res = mockRes();
    await updateBankAccount(mockReq({ params: { id: only._id.toString() }, body: { isActive: false } }), res);

    expect(res.statusCode).toBe(400);
    expect((await BankAccount.findById(only._id)).isActive).toBe(true);
  });

  it("allows deactivating an account when another active one remains", async () => {
    const primary = await makeAccount({ isPrimary: true, isActive: true });
    const other = await makeAccount({ isActive: true });

    const res = mockRes();
    await updateBankAccount(mockReq({ params: { id: other._id.toString() }, body: { isActive: false } }), res);

    expect(res.statusCode).toBe(200);
    expect((await BankAccount.findById(primary._id)).isActive).toBe(true);
  });

  it("refuses to unset the only primary with no other active account to fall back to", async () => {
    const only = await makeAccount({ isPrimary: true, isActive: true });

    const res = mockRes();
    await updateBankAccount(mockReq({ params: { id: only._id.toString() }, body: { isPrimary: false } }), res);

    expect(res.statusCode).toBe(400);
    expect((await BankAccount.findById(only._id)).isPrimary).toBe(true);
  });
});

describe("deleteBankAccount", () => {
  it("refuses to delete the only bank account (document count)", async () => {
    const only = await makeAccount({ isPrimary: true });

    const res = mockRes();
    await deleteBankAccount(mockReq({ params: { id: only._id.toString() } }), res);

    expect(res.statusCode).toBe(400);
    expect(await BankAccount.findById(only._id)).not.toBeNull();
  });

  it("refuses to delete the only active account, even when inactive accounts also exist", async () => {
    const active = await makeAccount({ isPrimary: true, isActive: true });
    await makeAccount({ isActive: false });

    const res = mockRes();
    await deleteBankAccount(mockReq({ params: { id: active._id.toString() } }), res);

    expect(res.statusCode).toBe(400);
    expect(await BankAccount.findById(active._id)).not.toBeNull();
  });

  it("promotes only an active replacement when the primary is deleted, never an inactive one", async () => {
    const primary = await makeAccount({ isPrimary: true, isActive: true });
    const inactiveOlder = await makeAccount({ isActive: false });
    const activeReplacement = await makeAccount({ isActive: true });
    void inactiveOlder;

    const res = mockRes();
    await deleteBankAccount(mockReq({ params: { id: primary._id.toString() } }), res);

    expect(res.statusCode).toBe(200);
    expect((await BankAccount.findById(activeReplacement._id)).isPrimary).toBe(true);
    expect((await BankAccount.findById(inactiveOlder._id)).isPrimary).toBe(false);
  });
});
