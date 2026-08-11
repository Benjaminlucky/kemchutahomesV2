import { describe, expect, it } from "vitest";
import {
  buildB2STrendRows,
  buildCommissionTrendRows,
  buildFunnelSteps,
  buildTrendRows,
  fmtCompact,
  fmtNGNCompact,
  pct,
  titleCase,
  trendOf,
  type Analytics,
} from "./types";

function makeAnalytics(overrides: Partial<Analytics> = {}): Analytics {
  return {
    realtors: { total: 40, newThisMonth: 6, newLastMonth: 4, monthOverMonth: 50, totalRecruits: 25 },
    subscriptions: {
      total: 20,
      byStatus: { pending: 5, reviewed: 3, approved: 10, rejected: 2 },
      approvedRevenue: 52_000_000,
      approvedCount: 10,
      avgDealSize: 5_200_000,
      approvalRate: 50,
      byPlotType: [{ label: "residential", count: 12, revenue: 30_000_000 }],
      byPaymentPlan: [{ label: "outright", count: 12 }],
      monthly: {
        labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        counts: [1, 2, 3, 4, 5, 5],
        revenue: [0, 1_000_000, 2_000_000, 3_000_000, 4_000_000, 5_000_000],
      },
    },
    inspections: {
      total: 50,
      byStatus: { pending: 10, confirmed: 20, cancelled: 5, completed: 15 },
      upcoming7Days: 4,
      inspToSubRate: 40,
      monthly: { labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"], counts: [5, 6, 7, 8, 12, 12] },
    },
    estates: { total: 9, active: 7 },
    buy2sell: {
      total: 15,
      byStatus: { pending: 2, partial_paid: 1, active: 6, matured: 2, paid_out: 3, closed: 1 },
      totalPrincipal: 45_000_000,
      totalExpectedROI: 21_600_000,
      totalPaidOut: 9_000_000,
      maturingSoon30Days: 2,
      byDuration: [{ label: "12 Months", count: 8, principal: 24_000_000 }],
      monthly: {
        labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        counts: [1, 2, 2, 3, 3, 4],
        principal: [0, 2_000_000, 3_000_000, 5_000_000, 6_000_000, 8_000_000],
      },
    },
    commissions: {
      byStatus: { pending: 500_000, approved: 300_000, paid: 1_200_000, clawedback: 100_000 },
      totalWht: 75_000,
      bySource: [
        { label: "Lands", count: 10, net: 1_000_000 },
        { label: "Buy2Sell", count: 4, net: 500_000 },
      ],
      byLevel: [
        { level: 1, count: 8, net: 900_000 },
        { level: 2, count: 4, net: 350_000 },
      ],
      monthly: {
        labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        paid: [0, 100_000, 150_000, 200_000, 300_000, 450_000],
      },
    },
    topRealtors: [{ id: "r1", name: "Jane Doe", email: "jane@example.com", totalEarned: 800_000, dealCount: 6 }],
    ...overrides,
  };
}

describe("pct", () => {
  it("rounds to a whole percentage", () => {
    expect(pct(1, 3)).toBe(33);
  });

  it("returns 0 rather than dividing by zero", () => {
    expect(pct(5, 0)).toBe(0);
  });
});

describe("trendOf", () => {
  it("maps sign to direction", () => {
    expect(trendOf(12)).toBe("up");
    expect(trendOf(-12)).toBe("down");
    expect(trendOf(0)).toBe("flat");
  });
});

describe("fmtCompact", () => {
  it("abbreviates millions and thousands, leaves small numbers alone", () => {
    expect(fmtCompact(2_400_000)).toBe("2.4M");
    expect(fmtCompact(45_000)).toBe("45K");
    expect(fmtCompact(320)).toBe("320");
  });
});

describe("fmtNGNCompact", () => {
  // Hand-rolled rather than Intl `notation: "compact"`, whose output differs
  // between Node's ICU and the browser's and so breaks hydration.
  it("compacts millions and billions without a trailing .0", () => {
    expect(fmtNGNCompact(163_000_000)).toBe("₦163M");
    expect(fmtNGNCompact(14_818_182)).toBe("₦14.8M");
    expect(fmtNGNCompact(2_400_000_000)).toBe("₦2.4B");
    expect(fmtNGNCompact(-5_000_000)).toBe("-₦5M");
  });

  it("defers to the shared fmtNGN below a million", () => {
    expect(fmtNGNCompact(0)).toContain("0");
    expect(fmtNGNCompact(450_000)).toContain("450,000");
  });
});

describe("titleCase", () => {
  it("normalises raw DB enum labels", () => {
    expect(titleCase("outright")).toBe("Outright");
    expect(titleCase("payment_plan")).toBe("Payment Plan");
    expect(titleCase("")).toBe("");
  });
});

describe("buildTrendRows", () => {
  it("zips both monthly series onto one row per month", () => {
    const rows = buildTrendRows(makeAnalytics());
    expect(rows).toHaveLength(6);
    expect(rows[0]).toEqual({ month: "Mar", Subscriptions: 1, Inspections: 5, Revenue: 0 });
    expect(rows[5]).toEqual({ month: "Aug", Subscriptions: 5, Inspections: 12, Revenue: 5_000_000 });
  });

  it("falls back to the inspection labels and zero-fills missing points", () => {
    const a = makeAnalytics();
    a.subscriptions.monthly = { labels: [], counts: [], revenue: [] };
    const rows = buildTrendRows(a);
    expect(rows).toHaveLength(6);
    expect(rows.every((r) => r.Subscriptions === 0 && r.Revenue === 0)).toBe(true);
    expect(rows[4].Inspections).toBe(12);
  });
});

describe("buildFunnelSteps", () => {
  it("measures each stage against the denominator it names", () => {
    const steps = buildFunnelSteps(makeAnalytics());
    expect(steps.map((s) => s.stage)).toEqual([
      "Inspections",
      "Subscriptions",
      "Under Review",
      "Approved",
    ]);
    expect(steps[0].pct).toBe(100);
    expect(steps[1].pct).toBe(40); // 20 subs / 50 inspections
    expect(steps[2].value).toBe(8); // pending + reviewed
    expect(steps[2].pct).toBe(40); // 8 / 20 subs
    expect(steps[3].pct).toBe(50); // 10 approved / 20 subs
    expect(steps[3].basis).toBe("of subscriptions");
  });

  it("stays at zero for an empty dataset instead of throwing", () => {
    const a = makeAnalytics();
    a.inspections.total = 0;
    a.subscriptions.total = 0;
    a.subscriptions.byStatus = { pending: 0, reviewed: 0, approved: 0, rejected: 0 };
    expect(buildFunnelSteps(a).map((s) => s.pct)).toEqual([100, 0, 0, 0]);
  });
});

describe("buildB2STrendRows", () => {
  it("zips the Buy2Sell monthly series onto one row per month", () => {
    const rows = buildB2STrendRows(makeAnalytics());
    expect(rows).toHaveLength(6);
    expect(rows[0]).toEqual({ month: "Mar", Leads: 1, Principal: 0 });
    expect(rows[5]).toEqual({ month: "Aug", Leads: 4, Principal: 8_000_000 });
  });

  it("zero-fills a missing point instead of throwing", () => {
    const a = makeAnalytics();
    a.buy2sell.monthly = { labels: ["Mar"], counts: [], principal: [] };
    const rows = buildB2STrendRows(a);
    expect(rows).toEqual([{ month: "Mar", Leads: 0, Principal: 0 }]);
  });
});

describe("buildCommissionTrendRows", () => {
  it("zips the commission payout monthly series onto one row per month", () => {
    const rows = buildCommissionTrendRows(makeAnalytics());
    expect(rows).toHaveLength(6);
    expect(rows[0]).toEqual({ month: "Mar", Paid: 0 });
    expect(rows[5]).toEqual({ month: "Aug", Paid: 450_000 });
  });
});
