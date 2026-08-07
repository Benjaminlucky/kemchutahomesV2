/**
 * Characterization + regression tests for controllers/commission.controller.js
 * — specifically the payout-integrity fixes: markCommissionPaid must never
 * pay a commission that isn't "approved" (previously unguarded, the one gap
 * in a page where the batch endpoint already got this right), and
 * payCommissionBatch must report when some requested ids were skipped
 * instead of a blanket success message.
 */
import { describe, expect, it } from "vitest";
import "./setup.js";
import { mockReq, mockRes } from "./mockExpress.js";
import { Commission } from "../models/Commission.model.js";
import {
  markCommissionPaid,
  clawbackCommission,
  payCommissionBatch,
} from "../controllers/commission.controller.js";
import { makeRealtor } from "./fixtures.js";

async function makeCommission(realtor, overrides = {}) {
  return Commission.create({
    realtorId: realtor._id,
    realtorName: `${realtor.firstName} ${realtor.lastName}`,
    realtorEmail: realtor.email,
    sourceType: "subscription",
    saleAmount: 1_000_000,
    level: 1,
    percent: 10,
    grossAmount: 100_000,
    whtAmount: 5_000,
    netAmount: 95_000,
    status: "pending",
    ...overrides,
  });
}

describe("markCommissionPaid", () => {
  it("pays an approved commission", async () => {
    const realtor = await makeRealtor();
    const commission = await makeCommission(realtor, { status: "approved" });

    const res = mockRes();
    await markCommissionPaid(
      mockReq({ params: { id: commission._id.toString() }, body: { paymentRef: "TXN-1" } }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.commission.status).toBe("paid");
    expect(res.body.commission.paymentRef).toBe("TXN-1");
  });

  it("refuses to pay a commission that is still pending — the clawback window must not be bypassable", async () => {
    const realtor = await makeRealtor();
    const commission = await makeCommission(realtor, { status: "pending" });

    const res = mockRes();
    await markCommissionPaid(mockReq({ params: { id: commission._id.toString() }, body: {} }), res);

    expect(res.statusCode).toBe(400);
    expect((await Commission.findById(commission._id)).status).toBe("pending");
  });

  it("refuses to re-pay a commission that is already paid, protecting the original payout audit trail", async () => {
    const realtor = await makeRealtor();
    const commission = await makeCommission(realtor, {
      status: "paid",
      paidAt: new Date("2026-01-01"),
      paidBy: "original-admin@khl.com",
      paymentRef: "ORIGINAL-REF",
    });

    const res = mockRes();
    await markCommissionPaid(
      mockReq({ params: { id: commission._id.toString() }, body: { paymentRef: "NEW-REF" } }),
      res,
    );

    expect(res.statusCode).toBe(400);
    const fresh = await Commission.findById(commission._id);
    expect(fresh.paymentRef).toBe("ORIGINAL-REF"); // untouched
    expect(fresh.paidBy).toBe("original-admin@khl.com");
  });

  it("refuses to resurrect a clawed-back commission into a live payout", async () => {
    const realtor = await makeRealtor();
    const commission = await makeCommission(realtor, {
      status: "clawedback",
      clawbackAt: new Date(),
      clawbackReason: "Subscription rejected",
    });

    const res = mockRes();
    await markCommissionPaid(mockReq({ params: { id: commission._id.toString() }, body: {} }), res);

    expect(res.statusCode).toBe(400);
    expect((await Commission.findById(commission._id)).status).toBe("clawedback");
  });

  it("400s on a malformed id instead of 500ing", async () => {
    const res = mockRes();
    await markCommissionPaid(mockReq({ params: { id: "not-an-id" }, body: {} }), res);
    expect(res.statusCode).toBe(400);
  });
});

describe("clawbackCommission", () => {
  it("reverses an approved commission", async () => {
    const realtor = await makeRealtor();
    const commission = await makeCommission(realtor, { status: "approved" });

    const res = mockRes();
    await clawbackCommission(
      mockReq({ params: { id: commission._id.toString() }, body: { reason: "Client defaulted" } }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.commission.status).toBe("clawedback");
    expect(res.body.commission.clawbackReason).toBe("Client defaulted");
  });

  it("refuses to claw back a commission that has already been paid", async () => {
    const realtor = await makeRealtor();
    const commission = await makeCommission(realtor, { status: "paid", paidAt: new Date() });

    const res = mockRes();
    await clawbackCommission(mockReq({ params: { id: commission._id.toString() }, body: {} }), res);

    expect(res.statusCode).toBe(400);
    expect((await Commission.findById(commission._id)).status).toBe("paid");
  });
});

describe("payCommissionBatch", () => {
  it("reports a full success when every id was approved", async () => {
    const realtor = await makeRealtor();
    const a = await makeCommission(realtor, { status: "approved" });
    const b = await makeCommission(realtor, { status: "approved" });

    const res = mockRes();
    await payCommissionBatch(
      mockReq({ body: { ids: [a._id.toString(), b._id.toString()] } }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.modifiedCount).toBe(2);
    expect(res.body.requestedCount).toBe(2);
    expect(res.body.message).not.toMatch(/skipped/);
  });

  it("reports a partial success when some ids were no longer approved, instead of a blanket success message", async () => {
    const realtor = await makeRealtor();
    const approved = await makeCommission(realtor, { status: "approved" });
    const alreadyPaid = await makeCommission(realtor, { status: "paid", paidAt: new Date() });

    const res = mockRes();
    await payCommissionBatch(
      mockReq({ body: { ids: [approved._id.toString(), alreadyPaid._id.toString()] } }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.modifiedCount).toBe(1);
    expect(res.body.requestedCount).toBe(2);
    expect(res.body.message).toMatch(/skipped/);
  });
});
