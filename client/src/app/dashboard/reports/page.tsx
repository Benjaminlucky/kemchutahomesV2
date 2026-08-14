import { cookies } from "next/headers";
import ConversionFunnel from "@/components/dashboard/overview/ConversionFunnel";
import { SectionHeading } from "@/components/dashboard/overview/ChartCard";
import KpiGrid from "@/components/dashboard/overview/KpiGrid";
import PaymentPlanCards from "@/components/dashboard/overview/PaymentPlanCards";
import PlotTypeChart from "@/components/dashboard/overview/PlotTypeChart";
import RevenueChart from "@/components/dashboard/overview/RevenueChart";
import StatusDonut from "@/components/dashboard/overview/StatusDonut";
import TrendChart from "@/components/dashboard/overview/TrendChart";
import Buy2SellSection from "@/components/dashboard/reports/Buy2SellSection";
import CommissionsSection from "@/components/dashboard/reports/CommissionsSection";
import TopRealtorsCard from "@/components/dashboard/reports/TopRealtorsCard";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import {
  INSP_STATUS_COLOR,
  SUB_STATUS_COLOR,
  buildTrendRows,
  type Analytics,
} from "@/components/dashboard/overview/types";
import { requireAdminAccess } from "@/lib/requireAdminAccess";

// Server Component — everything below is built from the one GET
// /api/admin/analytics call (all aggregations run server-side in parallel).
// This page is the deep-dive counterpart to the Dashboard home's summary:
// same realtor/subscription/inspection KPIs, plus the full Buy2Sell,
// Commissions, and realtor-leaderboard picture the home page deliberately
// keeps out to stay a quick daily glance.
export default async function ReportsPage() {
  await requireAdminAccess("reports");
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
      <h1 className="mb-1 text-2xl font-bold text-customBlack-900 sm:text-3xl">Reports &amp; Analytics</h1>
      <p className="mb-7 text-sm text-customBlack-400">
        Every number behind Kemchuta Homes — network growth, land sales, Buy2Sell investments, and commission
        payouts, all in one place.
      </p>

      {!analytics ? (
        <ErrorBanner>Couldn&rsquo;t load analytics right now — please refresh.</ErrorBanner>
      ) : (
        <div className="space-y-10">
          <KpiGrid analytics={analytics} />

          <div>
            <SectionHeading title="Land Subscriptions & Site Visits" sub="Six-month activity, revenue and status mix" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <TrendChart rows={buildTrendRows(analytics)} />
                <StatusDonut
                  title="Subscription Status"
                  sub="Pipeline breakdown"
                  counts={analytics.subscriptions.byStatus}
                  colors={SUB_STATUS_COLOR}
                  delay={0.06}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <RevenueChart rows={buildTrendRows(analytics)} delay={0.04} />
                <PlotTypeChart byPlotType={analytics.subscriptions.byPlotType} delay={0.08} />
                <StatusDonut
                  title="Inspection Status"
                  sub="Site visit pipeline"
                  counts={analytics.inspections.byStatus}
                  colors={INSP_STATUS_COLOR}
                  delay={0.12}
                />
              </div>

              <ConversionFunnel analytics={analytics} delay={0.06} />

              <PaymentPlanCards
                byPaymentPlan={analytics.subscriptions.byPaymentPlan}
                total={analytics.subscriptions.total}
              />
            </div>
          </div>

          <Buy2SellSection analytics={analytics} />

          <CommissionsSection analytics={analytics} />

          <div>
            <SectionHeading title="Realtor Leaderboard" sub="Who's driving the network forward" />
            <TopRealtorsCard topRealtors={analytics.topRealtors} />
          </div>
        </div>
      )}
    </div>
  );
}
