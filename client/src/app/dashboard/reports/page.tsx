import { cookies } from "next/headers";
import { LayoutGrid, Users, ClipboardList, CalendarCheck, Building2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import StatCard from "@/components/client-portal/StatCard";

type StatusBreakdown = { _id: string; count: number }[];

type Analytics = {
  realtors: {
    total: number;
    newThisMonth: number;
    newLastMonth: number;
    monthOverMonth: number;
    totalRecruits: number;
  };
  subscriptions: {
    total: number;
    byStatus: StatusBreakdown;
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
    byStatus: StatusBreakdown;
    upcoming7Days: number;
    inspToSubRate: number;
    monthly: { labels: string[]; counts: number[] };
  };
  estates: { total: number; active: number };
};

function naira(n: number) {
  return `₦${Math.round(n).toLocaleString()}`;
}

// Server Component only — GET /api/admin/analytics already existed server-side
// (14 KPI aggregations run in parallel) but the legacy Reports.jsx was a
// static placeholder that never called it. This is a genuine first build of
// the Reports page, not a port of prior UI.
export default async function ReportsPage() {
  const cookieHeader = (await cookies()).toString();
  let analytics: Analytics | null = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/analytics`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) analytics = await res.json();
  } catch {
    analytics = null;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">Reports & Analytics</h1>

      {!analytics ? (
        <ErrorBanner>Couldn&rsquo;t load analytics right now — please refresh.</ErrorBanner>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Realtors"
              value={analytics.realtors.total}
              icon={Users}
              subtext={`${analytics.realtors.newThisMonth} new this month (${analytics.realtors.monthOverMonth >= 0 ? "+" : ""}${analytics.realtors.monthOverMonth}% MoM)`}
            />
            <StatCard
              label="Subscriptions"
              value={analytics.subscriptions.total}
              icon={ClipboardList}
              subtext={`${analytics.subscriptions.approvalRate}% approval rate`}
            />
            <StatCard
              label="Approved Revenue"
              value={naira(analytics.subscriptions.approvedRevenue)}
              icon={LayoutGrid}
              subtext={`${analytics.subscriptions.approvedCount} deals · avg ${naira(analytics.subscriptions.avgDealSize)}`}
            />
            <StatCard
              label="Inspections"
              value={analytics.inspections.total}
              icon={CalendarCheck}
              subtext={`${analytics.inspections.upcoming7Days} upcoming · ${analytics.inspections.inspToSubRate}% converted`}
            />
            <StatCard
              label="Estates"
              value={analytics.estates.total}
              icon={Building2}
              subtext={`${analytics.estates.active} active`}
            />
            <StatCard label="Recruited Realtors" value={analytics.realtors.totalRecruits} icon={Users} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MonthlyTrend title="Subscriptions per Month" labels={analytics.subscriptions.monthly.labels} values={analytics.subscriptions.monthly.counts} />
            <MonthlyTrend title="Inspections per Month" labels={analytics.inspections.monthly.labels} values={analytics.inspections.monthly.counts} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StatusBreakdownCard title="Subscriptions by Status" rows={analytics.subscriptions.byStatus} />
            <StatusBreakdownCard title="Inspections by Status" rows={analytics.inspections.byStatus} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <LabelledBreakdownCard
              title="Subscriptions by Plot Type"
              rows={analytics.subscriptions.byPlotType.map((p) => ({ label: p.label, count: p.count }))}
            />
            <LabelledBreakdownCard
              title="Subscriptions by Payment Plan"
              rows={analytics.subscriptions.byPaymentPlan}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MonthlyTrend({ title, labels, values }: { title: string; labels: string[]; values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <Card radius="3xl" className="p-6">
      <h3 className="mb-6 text-sm font-bold tracking-widest text-customBlack-400 uppercase">{title}</h3>
      <div className="flex h-40 items-end justify-between gap-3">
        {labels.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-customPurple-500"
              style={{ height: `${Math.max(4, (values[i] / max) * 100)}%` }}
            />
            <span className="text-xs text-customBlack-400">{label}</span>
            <span className="text-xs font-bold text-customBlack-700">{values[i]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function StatusBreakdownCard({ title, rows }: { title: string; rows: StatusBreakdown }) {
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
  return (
    <Card radius="3xl" className="p-6">
      <h3 className="mb-6 text-sm font-bold tracking-widest text-customBlack-400 uppercase">{title}</h3>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r._id}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-customBlack-700 capitalize">{r._id}</span>
              <span className="font-bold text-customBlack-900">{r.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-customBlack-50">
              <div className="h-full rounded-full bg-customPurple-500" style={{ width: `${(r.count / total) * 100}%` }} />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-customBlack-400">No data yet.</p>}
      </div>
    </Card>
  );
}

function LabelledBreakdownCard({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
  return (
    <Card radius="3xl" className="p-6">
      <h3 className="mb-6 text-sm font-bold tracking-widest text-customBlack-400 uppercase">{title}</h3>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-customBlack-700">{r.label}</span>
              <span className="font-bold text-customBlack-900">{r.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-customBlack-50">
              <div className="h-full rounded-full bg-customPurple-500" style={{ width: `${(r.count / total) * 100}%` }} />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-customBlack-400">No data yet.</p>}
      </div>
    </Card>
  );
}
