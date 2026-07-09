import Realtor from "../models/realtor.model.js";
import Subscription from "../models/Subscription.model.js";
import Inspection from "../models/inspection.model.js";
import Estate from "../models/estate.model.js";

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

      // Revenue — sum totalAmount for approved subscriptions
      Subscription.aggregate([
        { $match: { status: "approved" } },
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

    // ── Shape subscription status map ────────────────────────────────────────
    const subStatus = { pending: 0, reviewed: 0, approved: 0, rejected: 0 };
    subStatusCounts.forEach(({ _id, count }) => {
      if (_id in subStatus) subStatus[_id] = count;
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
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Failed to load analytics." });
  }
};
