// Shape returned by GET /api/admin/analytics (server/controllers/analytics.controller.js).
// Kept in one place so the server component page and every chart agree on it.

import { fmtNGN } from "@/components/client-portal/portalFormat";

export type SubscriptionStatus = "pending" | "reviewed" | "approved" | "rejected";
export type InspectionStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Analytics = {
  realtors: {
    total: number;
    newThisMonth: number;
    newLastMonth: number;
    monthOverMonth: number;
    totalRecruits: number;
  };
  subscriptions: {
    total: number;
    byStatus: Record<SubscriptionStatus, number>;
    approvedRevenue: number;
    approvedCount: number;
    avgDealSize: number;
    approvalRate: number;
    byPlotType: { label: string; count: number; revenue: number }[];
    byPaymentPlan: { label: string; count: number }[];
    monthly: { labels: string[]; counts: number[]; revenue: number[] };
  };
  inspections: {
    total: number;
    byStatus: Record<InspectionStatus, number>;
    upcoming7Days: number;
    inspToSubRate: number;
    monthly: { labels: string[]; counts: number[] };
  };
  estates: { total: number; active: number };
};

// ── Palette ──────────────────────────────────────────────────────────────────
// Validated with the dataviz palette validator against a white chart surface:
// every adjacent pair clears the CVD separation and normal-vision floors, and
// the one sub-3:1 mark (amber) is always paired with a written count legend.
export const CHART = {
  purple: "#700ceb", // brand — subscriptions / primary series
  purpleMid: "#8a2ff0",
  blue: "#3b82f6", // informational — inspections
  green: "#059669", // approved / completed
  amber: "#ca8a04", // pending / under review
  red: "#dc2626", // rejected / cancelled
  grid: "#ececec", // solid hairline, one shade off the surface
  axis: "#737373", // customBlack-400
} as const;

export const SUB_STATUS_COLOR: Record<SubscriptionStatus, string> = {
  pending: CHART.amber,
  reviewed: CHART.purple,
  approved: CHART.green,
  rejected: CHART.red,
};

export const INSP_STATUS_COLOR: Record<InspectionStatus, string> = {
  pending: CHART.amber,
  confirmed: CHART.purple,
  cancelled: CHART.red,
  completed: CHART.green,
};

// ── Formatting ───────────────────────────────────────────────────────────────
export function fmtNumber(n = 0) {
  return new Intl.NumberFormat("en-NG").format(n);
}

/**
 * Currency for a narrow KPI tile. Anything under a million keeps the shared
 * `fmtNGN` spelling; above that it compacts, because "₦163,000,000" wraps
 * mid-number in a half-width card on a 375px screen.
 *
 * The compact half is assembled by hand rather than with Intl's `notation:
 * "compact"` — Node and the browser ship different ICU builds, so the same
 * value renders "₦163.0M" server-side and "₦163M" client-side and React
 * throws a hydration mismatch. This is deterministic everywhere.
 */
export function fmtNGNCompact(n = 0) {
  const abs = Math.abs(n);
  if (abs < 1_000_000) return fmtNGN(n);
  const sign = n < 0 ? "-" : "";
  const [value, unit] = abs >= 1_000_000_000 ? [abs / 1_000_000_000, "B"] : [abs / 1_000_000, "M"];
  return `${sign}₦${(Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, "")}${unit}`;
}

/** Compact axis ticks — 1.2M / 450K / 900. Keeps the y-axis gutter narrow. */
export function fmtCompact(n = 0) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function titleCase(s = "") {
  return s
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Safe percentage — never divides by zero, always a whole number. */
export function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export type Trend = "up" | "down" | "flat";

export function trendOf(value: number): Trend {
  return value > 0 ? "up" : value < 0 ? "down" : "flat";
}

// ── Derived chart data ───────────────────────────────────────────────────────
export type TrendRow = { month: string; Subscriptions: number; Inspections: number; Revenue: number };

/**
 * Zips the two independent 6-month series onto one row per month. The API
 * builds both from the same label list, but a short/missing array is tolerated
 * so an empty dataset renders a flat chart rather than throwing.
 */
export function buildTrendRows(a: Analytics): TrendRow[] {
  const labels = a.subscriptions.monthly.labels.length
    ? a.subscriptions.monthly.labels
    : a.inspections.monthly.labels;

  return labels.map((month, i) => ({
    month,
    Subscriptions: a.subscriptions.monthly.counts[i] ?? 0,
    Inspections: a.inspections.monthly.counts[i] ?? 0,
    Revenue: a.subscriptions.monthly.revenue[i] ?? 0,
  }));
}

export type FunnelStep = { stage: string; value: number; pct: number; basis: string; color: string };

/**
 * Inspections → subscriptions → review queue → approved. Each step states the
 * denominator its percentage is measured against, because the last two are
 * both shares of *subscriptions*, not of the step immediately before them.
 */
export function buildFunnelSteps(a: Analytics): FunnelStep[] {
  const inReview = a.subscriptions.byStatus.pending + a.subscriptions.byStatus.reviewed;
  return [
    { stage: "Inspections", value: a.inspections.total, pct: 100, basis: "of the pipeline", color: CHART.blue },
    {
      stage: "Subscriptions",
      value: a.subscriptions.total,
      pct: pct(a.subscriptions.total, a.inspections.total),
      basis: "of inspections",
      color: CHART.purple,
    },
    {
      stage: "Under Review",
      value: inReview,
      pct: pct(inReview, a.subscriptions.total),
      basis: "of subscriptions",
      color: CHART.amber,
    },
    {
      stage: "Approved",
      value: a.subscriptions.byStatus.approved,
      pct: pct(a.subscriptions.byStatus.approved, a.subscriptions.total),
      basis: "of subscriptions",
      color: CHART.green,
    },
  ];
}
