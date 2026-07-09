/**
 * Characterization tests for utils/commissionCalculator.js — the highest-risk
 * business logic named in the PRD's risk register (§4.8: "Dashboard behaviour
 * parity gaps (payments, commissions, clawback) → Financial/workflow errors").
 * These pin down CURRENT behavior so a future dashboard port can be checked
 * against it, not a redesign of what the behavior should be.
 */
import { beforeEach, describe, expect, it } from "vitest";
import "./setup.js";
import { Commission, CommissionTier } from "../models/Commission.model.js";
import {
  calculateCommissions,
  clawbackCommissions,
  finalisePendingCommissions,
} from "../utils/commissionCalculator.js";
import { makeRealtor, makeSubscription } from "./fixtures.js";

describe("calculateCommissions", () => {
  it("creates one commission per level in the recruitment chain, with default tier percentages and 5% WHT", async () => {
    const topRealtor = await makeRealtor();
    const midRealtor = await makeRealtor({ recruitedBy: topRealtor._id });
    const directSeller = await makeRealtor({ recruitedBy: midRealtor._id });
    const sub = await makeSubscription({
      totalAmount: 10_000_000,
      realtorId: directSeller._id,
    });

    const created = await calculateCommissions(sub._id, directSeller._id);

    expect(created).toHaveLength(3); // 3-deep chain → levels 1, 2, 3
    const byLevel = Object.fromEntries(created.map((c) => [c.level, c]));

    // Level 1 (direct seller) — default 10%, 5% WHT
    expect(byLevel[1].realtorId.toString()).toBe(directSeller._id.toString());
    expect(byLevel[1].percent).toBe(10);
    expect(byLevel[1].grossAmount).toBe(1_000_000);
    expect(byLevel[1].whtAmount).toBe(50_000);
    expect(byLevel[1].netAmount).toBe(950_000);
    expect(byLevel[1].status).toBe("pending");

    // Level 2 (recruiter) — default 5%
    expect(byLevel[2].realtorId.toString()).toBe(midRealtor._id.toString());
    expect(byLevel[2].grossAmount).toBe(500_000);

    // Level 3 (recruiter's upline) — default 3%
    expect(byLevel[3].realtorId.toString()).toBe(topRealtor._id.toString());
    expect(byLevel[3].grossAmount).toBe(300_000);

    // directSellerId on every record should point at the level-1 realtor
    for (const c of created) {
      expect(c.directSellerId.toString()).toBe(directSeller._id.toString());
    }
  });

  it("is idempotent — calling it twice for the same subscription does not double-create commissions", async () => {
    const realtor = await makeRealtor();
    const sub = await makeSubscription({ realtorId: realtor._id });

    await calculateCommissions(sub._id, realtor._id);
    const secondCall = await calculateCommissions(sub._id, realtor._id);

    expect(secondCall).toHaveLength(0); // nothing new created on the second call
    const all = await Commission.find({ subscriptionId: sub._id });
    expect(all).toHaveLength(1); // still just the one L1 commission
  });

  it("creates nothing when the subscription has no linked realtor", async () => {
    const sub = await makeSubscription();
    const created = await calculateCommissions(sub._id, null);
    expect(created).toHaveLength(0);
    expect(await Commission.countDocuments()).toBe(0);
  });

  it("respects admin-overridden commission tiers instead of the schema defaults", async () => {
    await CommissionTier.create({
      singleton: "global",
      level1Percent: 20,
      whtPercent: 10,
    });
    const realtor = await makeRealtor();
    const sub = await makeSubscription({
      totalAmount: 1_000_000,
      realtorId: realtor._id,
    });

    const [commission] = await calculateCommissions(sub._id, realtor._id);

    expect(commission.percent).toBe(20);
    expect(commission.grossAmount).toBe(200_000);
    expect(commission.whtAmount).toBe(20_000); // 10% of gross
    expect(commission.netAmount).toBe(180_000);
  });
});

describe("clawbackCommissions", () => {
  it("reverses pending and approved commissions but leaves already-paid ones untouched", async () => {
    const realtor = await makeRealtor();
    const sub = await makeSubscription({ realtorId: realtor._id });

    const pending = await Commission.create({
      realtorId: realtor._id,
      realtorName: "A B",
      realtorEmail: "a@b.com",
      subscriptionId: sub._id,
      estateName: sub.estateName,
      saleAmount: sub.totalAmount,
      level: 1,
      percent: 10,
      grossAmount: 100,
      netAmount: 95,
      status: "pending",
    });
    const approved = await Commission.create({
      realtorId: realtor._id,
      realtorName: "A B",
      realtorEmail: "a@b.com",
      subscriptionId: sub._id,
      estateName: sub.estateName,
      saleAmount: sub.totalAmount,
      level: 2,
      percent: 5,
      grossAmount: 50,
      netAmount: 48,
      status: "approved",
    });
    const paid = await Commission.create({
      realtorId: realtor._id,
      realtorName: "A B",
      realtorEmail: "a@b.com",
      subscriptionId: sub._id,
      estateName: sub.estateName,
      saleAmount: sub.totalAmount,
      level: 3,
      percent: 3,
      grossAmount: 30,
      netAmount: 29,
      status: "paid",
      paidAt: new Date(),
    });

    await clawbackCommissions(sub._id, "Subscription rejected");

    const [refreshedPending, refreshedApproved, refreshedPaid] =
      await Promise.all([
        Commission.findById(pending._id),
        Commission.findById(approved._id),
        Commission.findById(paid._id),
      ]);

    expect(refreshedPending.status).toBe("clawedback");
    expect(refreshedPending.clawbackReason).toBe("Subscription rejected");
    expect(refreshedApproved.status).toBe("clawedback");
    // A payout that already happened must never be silently reversed by a
    // later admin action on the subscription — this is the exact scenario
    // the PRD flags as the highest-impact dashboard migration risk.
    expect(refreshedPaid.status).toBe("paid");
  });
});

describe("finalisePendingCommissions", () => {
  it("approves only pending commissions whose clawback window (finalAt) has already passed", async () => {
    const realtor = await makeRealtor();
    const sub = await makeSubscription({ realtorId: realtor._id });
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const due = await Commission.create({
      realtorId: realtor._id,
      realtorName: "A B",
      realtorEmail: "a@b.com",
      subscriptionId: sub._id,
      estateName: sub.estateName,
      saleAmount: sub.totalAmount,
      level: 1,
      percent: 10,
      grossAmount: 100,
      netAmount: 95,
      status: "pending",
      finalAt: yesterday,
    });
    const notYetDue = await Commission.create({
      realtorId: realtor._id,
      realtorName: "A B",
      realtorEmail: "a@b.com",
      subscriptionId: sub._id,
      estateName: sub.estateName,
      saleAmount: sub.totalAmount,
      level: 2,
      percent: 5,
      grossAmount: 50,
      netAmount: 48,
      status: "pending",
      finalAt: nextWeek,
    });

    await finalisePendingCommissions();

    expect((await Commission.findById(due._id)).status).toBe("approved");
    expect((await Commission.findById(notYetDue._id)).status).toBe("pending");
  });
});
