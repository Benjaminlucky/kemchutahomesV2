/**
 * test/clientDashboard.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Regression coverage for the client portal's own "approved subscriptions"
 * stat (getClientDashboard, client.controller.js). It used to filter on
 * ["confirmed", "allocated", "active"] — "active" isn't a real status on the
 * Subscription model (see STATUSES in models/Subscription.model.js) and
 * "completed" was missing entirely. Now sourced from the same
 * APPROVED_STATUSES the admin analytics endpoint uses (see
 * analytics.test.js), so the two can't drift apart again.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import "./setup.js";
import { getClientDashboard } from "../controllers/client.controller.js";
import { mockRes } from "./mockExpress.js";
import { makeSubscription } from "./fixtures.js";

describe("getClientDashboard — approvedSubscriptions stat", () => {
  it("counts confirmed/completed/allocated as approved, and nothing else", async () => {
    const email = "client-dashboard-test@example.com";
    await makeSubscription({ email, status: "pending" });
    await makeSubscription({ email, status: "confirmed" });
    await makeSubscription({ email, status: "completed" });
    await makeSubscription({ email, status: "allocated" });
    await makeSubscription({ email, status: "outright_paid" });
    await makeSubscription({ email, status: "rejected" });

    const res = mockRes();
    await getClientDashboard({ user: { email } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.stats.totalSubscriptions).toBe(6);
    expect(res.body.stats.approvedSubscriptions).toBe(3); // confirmed + completed + allocated
    expect(res.body.stats.pendingSubscriptions).toBe(1);
  });
});
