import Realtor from "../models/realtor.model.js";
import Subscription, { APPROVED_STATUSES } from "../models/Subscription.model.js";
import Inspection from "../models/inspection.model.js";
import Estate from "../models/estate.model.js";
import { Buy2SellLead } from "../models/Buy2sell.model.js";
import { Commission } from "../models/Commission.model.js";

// ── Status → dashboard bucket ────────────────────────────────────────────────
// Subscription.model.js's real STATUSES enum (see that file) is 13 granular
// payment/allocation states with no literal "pending"/"reviewed"/"approved"/
// "rejected" — those four are a coarser, dashboard-only grouping. Every real
// status must map to exactly one bucket, or subscriptions.total (the sum of
// all four buckets below) silently undercounts. The "approved" entries come
// from the model's own APPROVED_STATUSES so this can't drift out of sync
// with it or with client.controller.js's client-portal stats, which use the
// same constant.
const STATUS_BUCKET = {
  pending: "pending",
  rejected: "rejected",
  // In progress toward approval — some payment made, not yet confirmed/
  // completed/allocated by an admin.
  outright_paid: "reviewed",
  partial_paid: "reviewed",
  inst_1_paid: "reviewed",
  inst_2_paid: "reviewed",
  inst_3_paid: "reviewed",
  inst_4_paid: "reviewed",
  inst_5_paid: "reviewed",
  inst_6_paid: "reviewed",
  ...Object.fromEntries(APPROVED_STATUSES.map((status) => [status, "approved"])),
};

/**
 * GET /api/admin/analytics
 * Single endpoint — all KPI aggregations run in parallel.
 * Protected by protectAdmin middleware in routes.
 */
export const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    const [
      // ── Realtors ────────────────────────────────────────────────────────────
      totalRealtors,
      newRealtorsThisMonth,
      newRealtorsLastMonth,
      totalRecruits, // realtors who have a recruiter

      // ── Subscriptions ───────────────────────────────────────────────────────
      subStatusCounts, // {pending, reviewed, approved, rejected}
      subRevenueAgg, // total amount across approved subs
      subMonthly, // subscriptions per month (last 6 months)
      subByPlotType, // breakdown by plotType
      subByPaymentPlan, // Outright vs Installment

      // ── Inspections ─────────────────────────────────────────────────────────
      inspStatusCounts, // {pending, confirmed, cancelled, completed}
      inspMonthly, // inspections per month (last 6 months)
      inspUpcoming, // inspections in the next 7 days (confirmed)

      // ── Estates ─────────────────────────────────────────────────────────────
      totalEstates,
      activeEstates,
    ] = await Promise.all([
      // Realtors
      Realtor.countDocuments(),
      Realtor.countDocuments({ createdAt: { $gte: thisMonth } }),
      Realtor.countDocuments({
        createdAt: { $gte: lastMonth, $lte: lastMonthEnd },
      }),
      Realtor.countDocuments({ recruitedBy: { $ne: null } }),

      // Subscription status breakdown
      Subscription.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Revenue — sum totalAmount for "approved" subscriptions, per the
      // model's APPROVED_STATUSES (imported above).
      Subscription.aggregate([
        { $match: { status: { $in: APPROVED_STATUSES } } },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),

      // Monthly subscription trend — last 6 months
      Subscription.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Plot type breakdown
      Subscription.aggregate([
        {
          $group: {
            _id: "$plotType",
            count: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Payment plan breakdown
      Subscription.aggregate([
        { $group: { _id: "$paymentPlan", count: { $sum: 1 } } },
      ]),

      // Inspection status breakdown
      Inspection.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Monthly inspection trend — last 6 months
      Inspection.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Upcoming confirmed inspections (next 7 days)
      Inspection.countDocuments({
        status: "confirmed",
        inspectionDate: {
          $gte: now,
          $lte: new Date(now.getTime() + 7 * 86400000),
        },
      }),

      // Estates
      Estate.countDocuments(),
      Estate.countDocuments({ isActive: true }),
    ]);

    // Second parallel batch — Buy2Sell + Commissions. Kept separate from the
    // batch above for readability (this endpoint runs one aggregation set
    // per KPI already; a single 20-slot destructure stops being scannable),
    // at the cost of two round-trips instead of one on an admin-only,
    // low-frequency page where that's a non-issue.
    const FUNDED_B2S_STATUSES = ["active", "matured", "paid_out"];
    const [
      // ── Buy2Sell ──────────────────────────────────────────────────────────
      b2sStatusCounts, // count per B2S_STATUSES value
      b2sFundedAgg, // principal + expected ROI committed across funded leads
      b2sPaidOutAgg, // actual payout total for paid_out leads
      b2sByDuration, // count + principal per duration tier
      b2sMonthly, // leads submitted + principal per month (last 6 months)
      b2sMaturingSoon, // active/matured leads maturing in the next 30 days

      // ── Commissions ─────────────────────────────────────────────────────────
      commByStatusAgg, // net amount per status (pending/approved/paid/clawedback)
      commWhtAgg, // WHT withheld on confirmed (approved+paid) commissions only
      commBySourceAgg, // Lands vs Buy2Sell split
      commByLevelAgg, // level 1-4 split
      commMonthlyPaidAgg, // net amount actually paid out, by paidAt month
      topRealtorsAgg, // top 5 earners by confirmed (approved+paid) net commission
    ] = await Promise.all([
      Buy2SellLead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Buy2SellLead.aggregate([
        { $match: { status: { $in: FUNDED_B2S_STATUSES } } },
        {
          $group: {
            _id: null,
            principal: { $sum: "$principalAmount" },
            expectedROI: { $sum: "$expectedROI" },
          },
        },
      ]),
      Buy2SellLead.aggregate([
        { $match: { status: "paid_out" } },
        { $group: { _id: null, paid: { $sum: "$actualPayout" } } },
      ]),
      Buy2SellLead.aggregate([
        { $group: { _id: "$duration", count: { $sum: 1 }, principal: { $sum: "$principalAmount" } } },
      ]),
      Buy2SellLead.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
          },
        },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
            principal: { $sum: "$principalAmount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Buy2SellLead.countDocuments({
        status: { $in: ["active", "matured"] },
        maturityDate: { $gte: now, $lte: new Date(now.getTime() + 30 * 86400000) },
      }),

      Commission.aggregate([{ $group: { _id: "$status", net: { $sum: "$netAmount" } } }]),
      Commission.aggregate([
        { $match: { status: { $in: ["approved", "paid"] } } },
        { $group: { _id: null, wht: { $sum: "$whtAmount" } } },
      ]),
      Commission.aggregate([
        { $group: { _id: "$sourceType", count: { $sum: 1 }, net: { $sum: "$netAmount" } } },
      ]),
      Commission.aggregate([
        { $group: { _id: "$level", count: { $sum: 1 }, net: { $sum: "$netAmount" } } },
        { $sort: { _id: 1 } },
      ]),
      Commission.aggregate([
        {
          $match: {
            status: "paid",
            paidAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
          },
        },
        {
          $group: {
            _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
            net: { $sum: "$netAmount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Commission.aggregate([
        { $match: { status: { $in: ["approved", "paid"] } } },
        {
          $group: {
            _id: "$realtorId",
            name: { $first: "$realtorName" },
            email: { $first: "$realtorEmail" },
            totalEarned: { $sum: "$netAmount" },
            dealCount: { $sum: 1 },
          },
        },
        { $sort: { totalEarned: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // ── Shape subscription status map ────────────────────────────────────────
    // Bucket (not overwrite) — several real statuses fold into "reviewed",
    // and three fold into "approved" (see STATUS_BUCKET above). Falls back to
    // "reviewed" for any status this map doesn't know about, so an
    // unrecognised future status still counts toward the total instead of
    // silently vanishing from it.
    const subStatus = { pending: 0, reviewed: 0, approved: 0, rejected: 0 };
    subStatusCounts.forEach(({ _id, count }) => {
      const bucket = STATUS_BUCKET[_id] ?? "reviewed";
      subStatus[bucket] += count;
    });
    const totalSubs = Object.values(subStatus).reduce((a, b) => a + b, 0);

    // ── Shape inspection status map ──────────────────────────────────────────
    const inspStatus = { pending: 0, confirmed: 0, cancelled: 0, completed: 0 };
    inspStatusCounts.forEach(({ _id, count }) => {
      if (_id in inspStatus) inspStatus[_id] = count;
    });
    const totalInsp = Object.values(inspStatus).reduce((a, b) => a + b, 0);

    // ── Revenue ──────────────────────────────────────────────────────────────
    const approvedRevenue = subRevenueAgg[0]?.total || 0;
    const approvedCount = subRevenueAgg[0]?.count || 0;
    const avgDealSize =
      approvedCount > 0 ? Math.round(approvedRevenue / approvedCount) : 0;

    // ── Conversion rates ─────────────────────────────────────────────────────
    // Inspection → Subscription: how many people who booked an inspection also subscribed
    // Using email overlap as proxy
    const inspEmails = await Inspection.distinct("email");
    const subEmailsFromInsp = await Subscription.countDocuments({
      email: { $in: inspEmails },
    });
    const inspToSubRate =
      inspEmails.length > 0
        ? Math.round((subEmailsFromInsp / inspEmails.length) * 100)
        : 0;

    // Subscription approval rate
    const approvalRate =
      totalSubs > 0 ? Math.round((subStatus.approved / totalSubs) * 100) : 0;

    // Month-over-month realtor growth
    const realtorGrowth =
      newRealtorsLastMonth > 0
        ? Math.round(
            ((newRealtorsThisMonth - newRealtorsLastMonth) /
              newRealtorsLastMonth) *
              100,
          )
        : newRealtorsThisMonth > 0
          ? 100
          : 0;

    // ── Build 6-month labels ─────────────────────────────────────────────────
    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthLabels.push({
        label: MONTHS[d.getMonth()],
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      });
    }

    const mapMonthly = (agg) =>
      monthLabels.map(({ month, year }) => {
        const found = agg.find(
          (a) => a._id.month === month && a._id.year === year,
        );
        return found ? found.count : 0;
      });

    const mapMonthlyRevenue = (agg) =>
      monthLabels.map(({ month, year }) => {
        const found = agg.find(
          (a) => a._id.month === month && a._id.year === year,
        );
        return found ? found.revenue || 0 : 0;
      });

    // ── Shape Buy2Sell status map ─────────────────────────────────────────────
    const b2sStatus = {
      pending: 0,
      partial_paid: 0,
      active: 0,
      matured: 0,
      paid_out: 0,
      closed: 0,
    };
    b2sStatusCounts.forEach(({ _id, count }) => {
      if (_id in b2sStatus) b2sStatus[_id] = count;
    });
    const totalB2S = Object.values(b2sStatus).reduce((a, b) => a + b, 0);

    const b2sMonthlyPrincipal = monthLabels.map(({ month, year }) => {
      const found = b2sMonthly.find((a) => a._id.month === month && a._id.year === year);
      return found ? found.principal || 0 : 0;
    });
    const b2sMonthlyCount = monthLabels.map(({ month, year }) => {
      const found = b2sMonthly.find((a) => a._id.month === month && a._id.year === year);
      return found ? found.count : 0;
    });

    // ── Shape commission status map ───────────────────────────────────────────
    const commStatus = { pending: 0, approved: 0, paid: 0, clawedback: 0 };
    commByStatusAgg.forEach(({ _id, net }) => {
      if (_id in commStatus) commStatus[_id] = net;
    });

    const commMonthlyPaid = monthLabels.map(({ month, year }) => {
      const found = commMonthlyPaidAgg.find((a) => a._id.month === month && a._id.year === year);
      return found ? found.net || 0 : 0;
    });

    res.json({
      // ── Realtor KPIs ───────────────────────────────────────────────────────
      realtors: {
        total: totalRealtors,
        newThisMonth: newRealtorsThisMonth,
        newLastMonth: newRealtorsLastMonth,
        monthOverMonth: realtorGrowth, // % change
        totalRecruits,
      },

      // ── Subscription KPIs ──────────────────────────────────────────────────
      subscriptions: {
        total: totalSubs,
        byStatus: subStatus,
        approvedRevenue,
        approvedCount,
        avgDealSize,
        approvalRate,
        byPlotType: subByPlotType.map((p) => ({
          label: p._id || "Unknown",
          count: p.count,
          revenue: p.revenue,
        })),
        byPaymentPlan: subByPaymentPlan.map((p) => ({
          label: p._id || "Unknown",
          count: p.count,
        })),
        monthly: {
          labels: monthLabels.map((m) => m.label),
          counts: mapMonthly(subMonthly),
          revenue: mapMonthlyRevenue(subMonthly),
        },
      },

      // ── Inspection KPIs ────────────────────────────────────────────────────
      inspections: {
        total: totalInsp,
        byStatus: inspStatus,
        upcoming7Days: inspUpcoming,
        inspToSubRate, // % of inspection visitors who subscribed
        monthly: {
          labels: monthLabels.map((m) => m.label),
          counts: mapMonthly(inspMonthly),
        },
      },

      // ── Estate KPIs ────────────────────────────────────────────────────────
      estates: {
        total: totalEstates,
        active: activeEstates,
      },

      // ── Buy2Sell KPIs ──────────────────────────────────────────────────────
      buy2sell: {
        total: totalB2S,
        byStatus: b2sStatus,
        totalPrincipal: b2sFundedAgg[0]?.principal || 0,
        totalExpectedROI: b2sFundedAgg[0]?.expectedROI || 0,
        totalPaidOut: b2sPaidOutAgg[0]?.paid || 0,
        maturingSoon30Days: b2sMaturingSoon,
        byDuration: b2sByDuration.map((d) => ({
          label: d._id || "Unknown",
          count: d.count,
          principal: d.principal,
        })),
        monthly: {
          labels: monthLabels.map((m) => m.label),
          counts: b2sMonthlyCount,
          principal: b2sMonthlyPrincipal,
        },
      },

      // ── Commission KPIs ────────────────────────────────────────────────────
      commissions: {
        byStatus: commStatus, // net ₦ per status: pending/approved/paid/clawedback
        totalWht: commWhtAgg[0]?.wht || 0, // WHT on confirmed (approved+paid) commissions
        bySource: commBySourceAgg.map((s) => ({
          label: s._id === "buy2sell" ? "Buy2Sell" : "Lands",
          count: s.count,
          net: s.net,
        })),
        byLevel: commByLevelAgg.map((l) => ({
          level: l._id,
          count: l.count,
          net: l.net,
        })),
        monthly: {
          labels: monthLabels.map((m) => m.label),
          paid: commMonthlyPaid,
        },
      },

      // ── Top Realtors (by confirmed net commission) ────────────────────────
      topRealtors: topRealtorsAgg.map((r) => ({
        id: r._id?.toString() || "",
        name: r.name,
        email: r.email,
        totalEarned: r.totalEarned,
        dealCount: r.dealCount,
      })),
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Failed to load analytics." });
  }
};
