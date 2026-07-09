import { Users, ClipboardList, CalendarClock, Building2 } from "lucide-react";
import StatCard from "@/components/client-portal/StatCard";
import { fmtNGN } from "@/components/client-portal/portalFormat";

type Analytics = {
  realtors: { total: number; newThisMonth: number };
  subscriptions: { total: number; approvedRevenue: number; approvalRate: number };
  inspections: { total: number; upcoming7Days: number };
  estates: { total: number; active: number };
};

export default function AdminOverview({ analytics }: { analytics: Analytics }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      <StatCard
        label="Realtors"
        value={analytics.realtors.total}
        icon={Users}
        subtext={`+${analytics.realtors.newThisMonth} this month`}
      />
      <StatCard
        label="Subscriptions"
        value={analytics.subscriptions.total}
        icon={ClipboardList}
        subtext={`${analytics.subscriptions.approvalRate}% approval rate`}
      />
      <StatCard
        label="Approved Revenue"
        value={fmtNGN(analytics.subscriptions.approvedRevenue)}
        icon={Building2}
      />
      <StatCard
        label="Inspections"
        value={analytics.inspections.total}
        icon={CalendarClock}
        subtext={`${analytics.inspections.upcoming7Days} in next 7 days`}
      />
    </div>
  );
}
