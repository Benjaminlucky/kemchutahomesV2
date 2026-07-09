/**
 * controllers/commission.controller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles the 4-level MLM commission system for KHL realtors.
 *
 * Called automatically from subscription.controller when status → "approved"
 * AND when payment is fully confirmed.
 *
 * Commission chain:
 *   Level 1 → the realtor who made the direct sale (subscriptionRealtorId)
 *   Level 2 → Level 1's recruiter (recruitedBy)
 *   Level 3 → Level 2's recruiter
 *   Level 4 → Level 3's recruiter
 *
 * WHT (Withholding Tax) at 5% deducted from each commission before payout.
 * Clawback: if subscription reversed within clawbackDays, commissions are voided.
 */

import { Commission, CommissionTier } from "../models/Commission.model.js";
// Calculation helpers live in a separate utility to avoid any import order issues
import {
  calculateCommissions,
  clawbackCommissions,
  finalisePendingCommissions,
} from "../utils/commissionCalculator.js";

export {
  calculateCommissions,
  clawbackCommissions,
  finalisePendingCommissions,
};

// Local helper for the HTTP tier controllers below
async function getTiers() {
  let tier = await CommissionTier.findOne({ singleton: "global" }).lean();
  if (!tier) {
    const c = await CommissionTier.create({ singleton: "global" });
    tier = c.toObject();
  }
  return tier;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/commissions — admin: all commissions with filters
export const getAllCommissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, realtorId, level } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (realtorId) filter.realtorId = realtorId;
    if (level) filter.level = Number(level);

    const skip = (Number(page) - 1) * Number(limit);
    const [commissions, total] = await Promise.all([
      Commission.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate(
          "realtorId",
          "firstName lastName email phone bank accountName accountNumber",
        )
        .lean(),
      Commission.countDocuments(filter),
    ]);

    // Totals by status
    const [pending, approved, paid, clawedback] = await Promise.all([
      Commission.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: null, total: { $sum: "$netAmount" } } },
      ]),
      Commission.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, total: { $sum: "$netAmount" } } },
      ]),
      Commission.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$netAmount" } } },
      ]),
      Commission.aggregate([
        { $match: { status: "clawedback" } },
        { $group: { _id: null, total: { $sum: "$netAmount" } } },
      ]),
    ]);

    res.json({
      commissions,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      summary: {
        pendingAmount: pending[0]?.total || 0,
        approvedAmount: approved[0]?.total || 0,
        paidAmount: paid[0]?.total || 0,
        clawedbackAmount: clawedback[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch commissions" });
  }
};

// GET /api/commissions/my — realtor: their own commissions
export const getMyCommissions = async (req, res) => {
  try {
    const realtorId = req.user?._id || req.user?.id;
    const { page = 1, limit = 20, status } = req.query;
    const filter = { realtorId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [commissions, total] = await Promise.all([
      Commission.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Commission.countDocuments(filter),
    ]);

    // Cast to ObjectId for aggregate pipeline
    const { Types } = await import("mongoose");
    const oid = new Types.ObjectId(String(realtorId));

    const totals = await Commission.aggregate([
      { $match: { realtorId: oid } },
      {
        $group: {
          _id: "$status",
          totalNet: { $sum: "$netAmount" },
          totalGross: { $sum: "$grossAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      commissions,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      totals,
    });
  } catch (err) {
    console.error("getMyCommissions:", err);
    res.status(500).json({ message: "Failed to fetch commissions" });
  }
};

// PATCH /api/commissions/:id/pay — admin marks as paid
export const markCommissionPaid = async (req, res) => {
  try {
    const { paymentRef, note } = req.body;
    const commission = await Commission.findByIdAndUpdate(
      req.params.id,
      {
        status: "paid",
        paidAt: new Date(),
        paidBy: req.user?.email || "admin",
        paymentRef: paymentRef || "",
        ...(note && { notes: note }),
      },
      { new: true },
    );
    if (!commission)
      return res.status(404).json({ message: "Commission not found" });
    res.json({ message: "Commission marked as paid", commission });
  } catch (err) {
    res.status(500).json({ message: "Failed to update commission" });
  }
};

// POST /api/commissions/pay-batch — admin pays multiple commissions at once
export const payCommissionBatch = async (req, res) => {
  try {
    const { ids, paymentRef } = req.body;
    if (!ids?.length)
      return res.status(400).json({ message: "No commission IDs provided" });

    const result = await Commission.updateMany(
      { _id: { $in: ids }, status: "approved" },
      {
        status: "paid",
        paidAt: new Date(),
        paidBy: req.user?.email || "admin",
        paymentRef: paymentRef || "",
      },
    );
    res.json({ message: `${result.modifiedCount} commissions marked as paid` });
  } catch (err) {
    res.status(500).json({ message: "Failed to batch-pay commissions" });
  }
};

// GET /api/commissions/tiers — get tier settings
export const getCommissionTiers = async (req, res) => {
  try {
    const tiers = await getTiers();
    res.json(tiers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tier settings" });
  }
};

// PUT /api/commissions/tiers — admin updates tier settings
export const updateCommissionTiers = async (req, res) => {
  try {
    const {
      level1Percent,
      level2Percent,
      level3Percent,
      level4Percent,
      whtPercent,
      clawbackDays,
    } = req.body;

    const tiers = await CommissionTier.findOneAndUpdate(
      { singleton: "global" },
      {
        ...(level1Percent !== undefined && {
          level1Percent: Number(level1Percent),
        }),
        ...(level2Percent !== undefined && {
          level2Percent: Number(level2Percent),
        }),
        ...(level3Percent !== undefined && {
          level3Percent: Number(level3Percent),
        }),
        ...(level4Percent !== undefined && {
          level4Percent: Number(level4Percent),
        }),
        ...(whtPercent !== undefined && { whtPercent: Number(whtPercent) }),
        ...(clawbackDays !== undefined && {
          clawbackDays: Number(clawbackDays),
        }),
        updatedBy: req.user?.email || "admin",
      },
      { new: true, upsert: true },
    );
    res.json({ message: "Tier settings updated", tiers });
  } catch (err) {
    res.status(500).json({ message: "Failed to update tier settings" });
  }
};
