/**
 * test/analytics.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Regression coverage for the subscription status → dashboard bucket mapping
 * in analytics.controller.js. This was previously broken: it matched
 * subscriptions against a literal "approved" status that doesn't exist on
 * the Subscription model (see STATUSES in models/Subscription.model.js),
 * so approvedRevenue/avgDealSize/approvalRate were always 0 and
 * subscriptions.total silently undercounted anything that wasn't
 * "pending" or "rejected".
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import "./setup.js";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { mockReq, mockRes } from "./mockExpress.js";
import { makeSubscription } from "./fixtures.js";

describe("getAnalytics — subscription status bucketing", () => {
  it("maps confirmed/completed/allocated into the approved bucket and sums their revenue", async () => {
    await makeSubscription({ status: "pending", totalAmount: 1_000_000 });
    await makeSubscription({ status: "confirmed", totalAmount: 2_000_000 });
    await makeSubscription({ status: "completed", totalAmount: 3_000_000 });
    await makeSubscription({ status: "allocated", totalAmount: 4_000_000 });
    await makeSubscription({ status: "rejected", totalAmount: 5_000_000 });

    const res = mockRes();
    await getAnalytics(mockReq(), res);

    expect(res.statusCode).toBe(200);
    const { subscriptions } = res.body;

    expect(subscriptions.byStatus).toEqual({
      pending: 1,
      reviewed: 0,
      approved: 3,
      rejected: 1,
    });
    // Every real status must land in exactly one bucket — total must equal
    // the number of subscriptions created, not just pending + rejected.
    expect(subscriptions.total).toBe(5);

    // Revenue/count/avg only over the three approved-mapped statuses.
    expect(subscriptions.approvedRevenue).toBe(9_000_000); // 2M + 3M + 4M
    expect(subscriptions.approvedCount).toBe(3);
    expect(subscriptions.avgDealSize).toBe(3_000_000);
    expect(subscriptions.approvalRate).toBe(60); // 3 of 5
  });

  it("folds in-progress payment statuses into the reviewed bucket, not approved", async () => {
    await makeSubscription({ status: "outright_paid", totalAmount: 1_000_000 });
    await makeSubscription({ status: "partial_paid", totalAmount: 1_000_000 });
    await makeSubscription({ status: "inst_1_paid", totalAmount: 1_000_000 });
    await makeSubscription({ status: "inst_6_paid", totalAmount: 1_000_000 });

    const res = mockRes();
    await getAnalytics(mockReq(), res);

    const { subscriptions } = res.body;
    expect(subscriptions.byStatus).toEqual({
      pending: 0,
      reviewed: 4,
      approved: 0,
      rejected: 0,
    });
    expect(subscriptions.total).toBe(4);
    // None of these count as "approved" revenue yet.
    expect(subscriptions.approvedRevenue).toBe(0);
    expect(subscriptions.approvedCount).toBe(0);
    expect(subscriptions.approvalRate).toBe(0);
  });

  it("returns all-zero subscription stats with no subscriptions, without dividing by zero", async () => {
    const res = mockRes();
    await getAnalytics(mockReq(), res);

    const { subscriptions } = res.body;
    expect(subscriptions.total).toBe(0);
    expect(subscriptions.approvedRevenue).toBe(0);
    expect(subscriptions.avgDealSize).toBe(0);
    expect(subscriptions.approvalRate).toBe(0);
  });
});
