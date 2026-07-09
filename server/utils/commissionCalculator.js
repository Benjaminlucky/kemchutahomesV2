/**
 * utils/commissionCalculator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure commission calculation utilities.
 * Separated from commission.controller.js to avoid any import order issues.
 *
 * Usage in subscription.controller.js:
 *   import { calculateCommissions, clawbackCommissions } from "../utils/commissionCalculator.js";
 */

import Realtor from "../models/realtor.model.js";
import Subscription from "../models/Subscription.model.js";
import { Commission, CommissionTier } from "../models/Commission.model.js";

// ── Get or seed commission tier settings ──────────────────────────────────────
async function getTiers() {
  let tier = await CommissionTier.findOne({ singleton: "global" }).lean();
  if (!tier) {
    const created = await CommissionTier.create({ singleton: "global" });
    tier = created.toObject();
  }
  return tier;
}

// ── Walk the recruitedBy chain up to 4 levels ─────────────────────────────────
async function getHierarchy(startRealtorId) {
  const chain = [];
  let currentId = startRealtorId;

  for (let level = 1; level <= 4; level++) {
    if (!currentId) break;
    const realtor = await Realtor.findById(currentId)
      .select("firstName lastName email recruitedBy")
      .lean();
    if (!realtor) break;
    chain.push({ level, realtor });
    currentId = realtor.recruitedBy || null;
  }
  return chain;
}

// ─────────────────────────────────────────────────────────────────────────────
// calculateCommissions
// Called when subscription.status → "approved"
// Creates one Commission record per level in the hierarchy.
// ─────────────────────────────────────────────────────────────────────────────
export async function calculateCommissions(subscriptionId, realtorId) {
  try {
    if (!realtorId) {
      console.log(
        "ℹ️  No realtor linked to subscription — commissions skipped",
      );
      return [];
    }

    const sub = await Subscription.findById(subscriptionId).lean();
    if (!sub)
      throw new Error("Subscription not found for commission calculation");

    const tiers = await getTiers();
    const chain = await getHierarchy(realtorId);
    const directSellerId = chain[0]?.realtor._id;

    const percentMap = {
      1: tiers.level1Percent, // 10% — direct seller
      2: tiers.level2Percent, //  5% — recruiter
      3: tiers.level3Percent, //  3% — upline
      4: tiers.level4Percent, //  2% — top level
    };

    // finalAt = today + clawbackDays (after which commission cannot be reversed)
    const finalAt = new Date();
    finalAt.setDate(finalAt.getDate() + (tiers.clawbackDays || 90));

    const created = [];

    for (const { level, realtor } of chain) {
      const percent = percentMap[level] ?? 0;
      if (percent === 0) continue;

      // Idempotent — don't double-create
      const existing = await Commission.findOne({
        subscriptionId,
        realtorId: realtor._id,
        level,
      });
      if (existing) {
        console.log(
          `ℹ️  Commission L${level} already exists for ${realtor.email} — skipped`,
        );
        continue;
      }

      const grossAmount = Math.round((sub.totalAmount * percent) / 100);
      const whtAmount = Math.round(
        (grossAmount * (tiers.whtPercent || 5)) / 100,
      );
      const netAmount = grossAmount - whtAmount;

      const commission = await Commission.create({
        realtorId: realtor._id,
        realtorName: `${realtor.firstName} ${realtor.lastName}`,
        realtorEmail: realtor.email,
        subscriptionId,
        referenceNumber:
          sub.referenceNumber || sub._id.toString().slice(-8).toUpperCase(),
        estateName: sub.estateName,
        saleAmount: sub.totalAmount,
        level,
        percent,
        grossAmount,
        whtAmount,
        netAmount,
        directSellerId,
        status: "pending",
        finalAt,
      });

      created.push(commission);
      console.log(
        `✅ Commission L${level}: ${realtor.firstName} ${realtor.lastName}` +
          ` → NGN ${netAmount.toLocaleString("en-NG")} (${percent}% of ${sub.totalAmount.toLocaleString("en-NG")})`,
      );
    }

    return created;
  } catch (err) {
    console.error("❌ calculateCommissions:", err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// clawbackCommissions
// Called when subscription.status → "rejected"
// Voids all pending/approved commissions for the subscription.
// ─────────────────────────────────────────────────────────────────────────────
export async function clawbackCommissions(
  subscriptionId,
  reason = "Subscription reversed",
) {
  try {
    const result = await Commission.updateMany(
      { subscriptionId, status: { $in: ["pending", "approved"] } },
      {
        status: "clawedback",
        clawbackAt: new Date(),
        clawbackReason: reason,
      },
    );
    if (result.modifiedCount > 0) {
      console.log(
        `⚠️  ${result.modifiedCount} commission(s) clawed back for subscription ${subscriptionId} — reason: ${reason}`,
      );
    }
    return result;
  } catch (err) {
    console.error("❌ clawbackCommissions:", err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// finalisePendingCommissions  (daily cron — called from followUp.js)
// Approves any "pending" commissions whose clawback window has expired.
// ─────────────────────────────────────────────────────────────────────────────
export async function finalisePendingCommissions() {
  try {
    const result = await Commission.updateMany(
      { status: "pending", finalAt: { $lte: new Date() } },
      { status: "approved" },
    );
    if (result.modifiedCount > 0) {
      console.log(
        `✅ Cron: ${result.modifiedCount} commission(s) finalised (clawback window expired)`,
      );
    }
    return result;
  } catch (err) {
    console.error("❌ finalisePendingCommissions:", err.message);
    return null;
  }
}
