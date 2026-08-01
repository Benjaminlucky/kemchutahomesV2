"use client";

import {
  Building2,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Percent,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import KpiCard, { type KpiCardProps } from "./KpiCard";
import { SectionHeading } from "./ChartCard";
import { CHART, fmtNGNCompact, fmtNumber, pct, trendOf, type Analytics } from "./types";

type Group = { title: string; sub: string; cards: KpiCardProps[] };

function buildGroups(a: Analytics): Group[] {
  const recruitShare = pct(a.realtors.totalRecruits, a.realtors.total);
  const monthDelta =
    a.realtors.newLastMonth > 0
      ? Math.round(((a.realtors.newThisMonth - a.realtors.newLastMonth) / a.realtors.newLastMonth) * 100)
      : a.realtors.newThisMonth > 0
        ? 100
        : 0;

  return [
    {
      title: "Network & Properties",
      sub: "Realtor network and estate inventory",
      cards: [
        {
          label: "Total Realtors",
          value: fmtNumber(a.realtors.total),
          sub: `+${fmtNumber(a.realtors.newThisMonth)} joined this month`,
          icon: Users,
          color: CHART.purple,
          trend: trendOf(a.realtors.monthOverMonth),
          trendValue: a.realtors.monthOverMonth,
        },
        {
          label: "Total Recruits",
          value: fmtNumber(a.realtors.totalRecruits),
          sub: `${recruitShare}% of the network has a recruiter`,
          icon: Trophy,
          color: CHART.purpleMid,
        },
        {
          label: "Active Estates",
          value: fmtNumber(a.estates.active),
          sub: `${fmtNumber(a.estates.total)} total listed`,
          icon: Building2,
          color: CHART.blue,
        },
        {
          label: "New This Month",
          value: fmtNumber(a.realtors.newThisMonth),
          sub: `vs ${fmtNumber(a.realtors.newLastMonth)} last month`,
          icon: UserPlus,
          color: CHART.green,
          trend: trendOf(monthDelta),
          trendValue: monthDelta,
        },
      ],
    },
    {
      title: "Revenue & Conversions",
      sub: "Subscription revenue and pipeline performance",
      cards: [
        {
          label: "Approved Revenue",
          value: fmtNGNCompact(a.subscriptions.approvedRevenue),
          sub: `${fmtNumber(a.subscriptions.approvedCount)} approved deals`,
          icon: Wallet,
          color: CHART.green,
        },
        {
          label: "Avg Deal Size",
          value: fmtNGNCompact(a.subscriptions.avgDealSize),
          sub: "Per approved subscription",
          icon: TrendingUp,
          color: CHART.purple,
        },
        {
          label: "Approval Rate",
          value: `${a.subscriptions.approvalRate}%`,
          sub: `${fmtNumber(a.subscriptions.byStatus.pending)} pending review`,
          icon: ClipboardList,
          color: CHART.amber,
        },
        {
          label: "Insp → Sale Rate",
          value: `${a.inspections.inspToSubRate}%`,
          sub: "Inspection visitors who subscribed",
          icon: Percent,
          color: CHART.blue,
        },
      ],
    },
    {
      title: "Inspection Pipeline",
      sub: "Site visit bookings and conversion",
      cards: [
        {
          label: "Total Inspections",
          value: fmtNumber(a.inspections.total),
          sub: `${fmtNumber(a.inspections.byStatus.pending)} awaiting confirmation`,
          icon: CalendarCheck,
          color: CHART.purple,
        },
        {
          label: "Confirmed",
          value: fmtNumber(a.inspections.byStatus.confirmed),
          sub: `${pct(a.inspections.byStatus.confirmed, a.inspections.total)}% of all bookings`,
          icon: CheckCircle2,
          color: CHART.green,
        },
        {
          label: "Upcoming (7 days)",
          value: fmtNumber(a.inspections.upcoming7Days),
          sub: "Confirmed visits this week",
          icon: CalendarClock,
          color: CHART.blue,
        },
        {
          label: "Completed",
          value: fmtNumber(a.inspections.byStatus.completed),
          sub: `${fmtNumber(a.inspections.byStatus.cancelled)} cancelled`,
          icon: Trophy,
          color: CHART.purpleMid,
        },
      ],
    },
  ];
}

export default function KpiGrid({ analytics }: { analytics: Analytics }) {
  let index = 0;

  return (
    <div className="space-y-7">
      {buildGroups(analytics).map((group) => (
        <div key={group.title}>
          <SectionHeading title={group.title} sub={group.sub} />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {group.cards.map((card) => (
              <KpiCard key={card.label} {...card} delay={index++ * 0.04} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
