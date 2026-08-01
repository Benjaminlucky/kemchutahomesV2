import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ConversionFunnel from "./overview/ConversionFunnel";
import KpiGrid from "./overview/KpiGrid";
import PaymentPlanCards from "./overview/PaymentPlanCards";
import PlotTypeChart from "./overview/PlotTypeChart";
import RevenueChart from "./overview/RevenueChart";
import StatusDonut from "./overview/StatusDonut";
import TrendChart from "./overview/TrendChart";
import { SectionHeading } from "./overview/ChartCard";
import { INSP_STATUS_COLOR, SUB_STATUS_COLOR, buildTrendRows, type Analytics } from "./overview/types";

/**
 * Admin landing analytics. Stays a server component — every interactive or
 * chart-bearing piece is its own "use client" leaf, so only those ship JS.
 */
export default function AdminOverview({ analytics }: { analytics: Analytics }) {
  const trendRows = buildTrendRows(analytics);

  return (
    <div className="space-y-8">
      <KpiGrid analytics={analytics} />

      <div>
        <SectionHeading title="Trends & Pipeline" sub="Six-month activity, revenue and status mix" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <TrendChart rows={trendRows} />
            <StatusDonut
              title="Subscription Status"
              sub="Pipeline breakdown"
              counts={analytics.subscriptions.byStatus}
              colors={SUB_STATUS_COLOR}
              delay={0.06}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <RevenueChart rows={trendRows} />
            <PlotTypeChart byPlotType={analytics.subscriptions.byPlotType} delay={0.06} />
            <StatusDonut
              title="Inspection Status"
              sub="Site visit pipeline"
              counts={analytics.inspections.byStatus}
              colors={INSP_STATUS_COLOR}
              delay={0.12}
            />
          </div>

          <ConversionFunnel analytics={analytics} />
        </div>
      </div>

      <div>
        <SectionHeading title="Payment Plans" sub="How subscribers choose to pay" />
        <PaymentPlanCards
          byPaymentPlan={analytics.subscriptions.byPaymentPlan}
          total={analytics.subscriptions.total}
        />
      </div>

      <Link
        href="/dashboard/realtors"
        className="inline-flex items-center gap-1.5 rounded-full border border-customPurple-100 bg-white px-4 py-2 text-sm font-bold text-customPurple-700 transition-colors hover:bg-customPurple-50"
      >
        View all realtors
        <ArrowRight size={15} aria-hidden />
      </Link>
    </div>
  );
}
