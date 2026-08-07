/**
 * models/Commission.model.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Tracks commission earned per realtor per sale through 4 levels of hierarchy.
 *
 * Commission structure (industry standard for Nigerian real estate MLM):
 *   Level 1 (Direct seller):     10% of sale value
 *   Level 2 (Recruiter):          5% override
 *   Level 3 (Recruiter's upline): 3% override
 *   Level 4 (Top level):          2% override
 *
 * WHT (Withholding Tax): 5% deducted from gross commission before payout.
 * Clawback: If subscription is rejected/refunded within 90 days, commission reverts.
 *
 * Admin can override tiers from the dashboard at any time.
 */

import mongoose from "mongoose";

// ── Commission tier settings (singleton, admin-controlled) ───────────────────
const commissionTierSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "global", unique: true },
    level1Percent: { type: Number, default: 10, min: 0, max: 50 }, // direct seller
    level2Percent: { type: Number, default: 5, min: 0, max: 30 }, // recruiter
    level3Percent: { type: Number, default: 3, min: 0, max: 20 }, // upline
    level4Percent: { type: Number, default: 2, min: 0, max: 15 }, // top level
    whtPercent: { type: Number, default: 5, min: 0, max: 20 }, // withholding tax
    clawbackDays: { type: Number, default: 90 }, // days before commission is final
    updatedBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

// ── Individual commission record ─────────────────────────────────────────────
const commissionSchema = new mongoose.Schema(
  {
    // ── Realtor who earns this commission ─────────────────────────────────
    realtorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Realtor",
      required: true,
    },
    realtorName: { type: String, required: true },
    realtorEmail: { type: String, required: true },

    // ── Which product generated this commission ───────────────────────────
    // Defaults to "subscription" so every pre-existing row (created before
    // this field existed) reads correctly without a data migration.
    sourceType: {
      type: String,
      enum: ["subscription", "buy2sell"],
      default: "subscription",
    },

    // ── The sale that triggered this commission ───────────────────────────
    // Exactly one of these two is set, matching sourceType. subscriptionId is
    // optional (not required) specifically so a buy2sell-sourced commission
    // can be saved — it was previously required, which made a Buy2Sell
    // commission structurally impossible to create.
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    buy2sellId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buy2SellLead",
      default: null,
    },
    referenceNumber: { type: String },
    estateName: { type: String }, // Lands-only; kept for back-compat with existing rows/queries
    saleLabel: { type: String }, // generic display label for either product
    saleAmount: { type: Number, required: true }, // total subscription value, or Buy2Sell principal

    // ── Commission calculation ────────────────────────────────────────────
    level: { type: Number, enum: [1, 2, 3, 4], required: true },
    percent: { type: Number, required: true }, // rate applied (snapshot)
    grossAmount: { type: Number, required: true }, // saleAmount × percent / 100
    whtAmount: { type: Number, default: 0 }, // 5% WHT deducted
    netAmount: { type: Number, required: true }, // grossAmount - whtAmount

    // ── Hierarchy chain snapshot ──────────────────────────────────────────
    // Who was the direct seller (level 1)?
    directSellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Realtor" },

    // ── Status ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "clawedback"],
      default: "pending",
    },
    // pending    → waiting for subscription approval / clawback window
    // approved   → subscription confirmed, commission approved for payout
    // paid       → admin has processed the payout
    // clawedback → subscription refunded/rejected within clawback period

    // ── Payout ────────────────────────────────────────────────────────────
    paidAt: { type: Date, default: null },
    paidBy: { type: String, default: "" },
    paymentRef: { type: String, default: "" }, // bank transfer ref

    // ── Clawback ──────────────────────────────────────────────────────────
    clawbackAt: { type: Date, default: null },
    clawbackReason: { type: String, default: "" },
    finalAt: { type: Date, default: null }, // date after which no clawback possible

    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

commissionSchema.index({ realtorId: 1, status: 1 });
commissionSchema.index({ subscriptionId: 1 });
commissionSchema.index({ buy2sellId: 1 });
commissionSchema.index({ sourceType: 1, status: 1 });
commissionSchema.index({ status: 1, createdAt: -1 });
commissionSchema.index({ finalAt: 1 }); // for cron: finding finalised commissions

// Idempotency at the database level — one commission per {sale, realtor,
// level}. Two partial unique indexes (rather than one on a synthetic
// combined field) because exactly one of subscriptionId/buy2sellId is set
// per row; a partial filter keeps each index from being confused by rows
// from the other product. This is what makes calculateCommissions/
// calculateBuy2SellCommissions' duplicate-key handling actually safe under
// concurrent or retried calls — the in-code findOne pre-check alone has a
// race window, this index is the real guarantee.
commissionSchema.index(
  { subscriptionId: 1, realtorId: 1, level: 1 },
  { unique: true, partialFilterExpression: { subscriptionId: { $type: "objectId" } } },
);
commissionSchema.index(
  { buy2sellId: 1, realtorId: 1, level: 1 },
  { unique: true, partialFilterExpression: { buy2sellId: { $type: "objectId" } } },
);

export const CommissionTier =
  mongoose.models.CommissionTier ||
  mongoose.model("CommissionTier", commissionTierSchema);

export const Commission =
  mongoose.models.Commission || mongoose.model("Commission", commissionSchema);
