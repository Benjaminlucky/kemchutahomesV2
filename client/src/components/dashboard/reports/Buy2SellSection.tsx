"use client";

import { Landmark, TrendingUp, Wallet, CalendarClock } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtNGN } from "@/components/client-portal/portalFormat";
import ChartCard, { SectionHeading } from "../overview/ChartCard";
import ChartTooltip from "../overview/ChartTooltip";
import KpiCard from "../overview/KpiCard";
import StatusDonut from "../overview/StatusDonut";
import {
  B2S_STATUS_COLOR,
  CHART,
  buildB2STrendRows,
  fmtCompact,
  fmtNGNCompact,
  fmtNumber,
  titleCase,
  type Analytics,
} from "../overview/types";

const TICK = { fontSize: 11, fill: CHART.axis };

function LeadsTrend({ rows }: { rows: ReturnType<typeof buildB2STrendRows> }) {
  return (
    <ChartCard title="Investment Leads" sub="New Buy2Sell submissions per month" className="xl:col-span-2">
      <div className="h-56 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 240 }}>
          <AreaChart data={rows} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="b2sLeadsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.purpleMid} stopOpacity={0.28} />
                <stop offset="100%" stopColor={CHART.purpleMid} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
            <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: CHART.grid, strokeWidth: 24 }} />
            <Area
              type="monotone"
              dataKey="Leads"
              stroke={CHART.purpleMid}
              strokeWidth={2}
              fill="url(#b2sLeadsGrad)"
              activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
              dot={{ r: 3, fill: CHART.purpleMid, stroke: "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function PrincipalChart({ rows, delay = 0 }: { rows: ReturnType<typeof buildB2STrendRows>; delay?: number }) {
  const total = rows.reduce((sum, r) => sum + r.Principal, 0);
  return (
    <ChartCard title="Principal Invested" sub="New Buy2Sell capital committed per month" delay={delay}>
      <div className="h-52 w-full sm:h-56">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 208 }}>
          <BarChart data={rows} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
            <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={fmtCompact} width={58} />
            <Tooltip content={<ChartTooltip currency />} cursor={{ fill: "rgba(112,12,235,0.06)" }} />
            <Bar dataKey="Principal" name="Principal" fill={CHART.purpleMid} radius={[4, 4, 0, 0]} maxBarSize={38} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 border-t border-customBlack-100 pt-3 text-xs text-customBlack-500">
        6-month total <span className="font-black text-customPurple-700">{fmtNGN(total)}</span>
      </p>
    </ChartCard>
  );
}

function DurationChart({
  byDuration,
  delay = 0,
}: {
  byDuration: Analytics["buy2sell"]["byDuration"];
  delay?: number;
}) {
  const rows = [...byDuration].sort((a, b) => b.principal - a.principal);
  const top = rows[0];

  return (
    <ChartCard title="By Duration" sub="Leads and principal by investment term" delay={delay}>
      {rows.length === 0 ? (
        <p className="py-12 text-center text-xs text-customBlack-400">No Buy2Sell leads recorded yet.</p>
      ) : (
        <>
          <div className="h-52 w-full sm:h-56">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 208 }}>
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 28, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} hide />
                <YAxis
                  dataKey="label"
                  type="category"
                  tick={{ ...TICK, fill: "#404040" }}
                  axisLine={false}
                  tickLine={false}
                  width={78}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(112,12,235,0.06)" }} />
                <Bar dataKey="count" name="Leads" fill={CHART.purple} radius={[0, 4, 4, 0]} maxBarSize={22}>
                  <LabelList dataKey="count" position="right" offset={8} style={{ fontSize: 11, fontWeight: 800, fill: "#262626" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {top && (
            <p className="mt-3 border-t border-customBlack-100 pt-3 text-xs text-customBlack-500">
              Most popular <span className="font-bold text-customBlack-900">{titleCase(top.label)}</span> —{" "}
              <span className="font-black text-customPurple-700">{fmtNGN(top.principal)}</span> committed
            </p>
          )}
        </>
      )}
    </ChartCard>
  );
}

export default function Buy2SellSection({ analytics }: { analytics: Analytics }) {
  const b2s = analytics.buy2sell;
  const trendRows = buildB2STrendRows(analytics);

  return (
    <div>
      <SectionHeading title="Buy2Sell Investments" sub="Land-bank investment pipeline and payout liability" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard
            label="Principal Invested"
            value={fmtNGNCompact(b2s.totalPrincipal)}
            sub="Across active, matured & paid-out leads"
            icon={Landmark}
            color={CHART.purpleMid}
          />
          <KpiCard
            label="Expected ROI Liability"
            value={fmtNGNCompact(b2s.totalExpectedROI)}
            sub="Owed to investors on maturity"
            icon={TrendingUp}
            color={CHART.amber}
            delay={0.04}
          />
          <KpiCard
            label="Paid Out"
            value={fmtNGNCompact(b2s.totalPaidOut)}
            sub="Principal + ROI returned to date"
            icon={Wallet}
            color={CHART.green}
            delay={0.08}
          />
          <KpiCard
            label="Maturing Soon"
            value={fmtNumber(b2s.maturingSoon30Days)}
            sub="Within the next 30 days"
            icon={CalendarClock}
            color={CHART.blue}
            delay={0.12}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <LeadsTrend rows={trendRows} />
          <StatusDonut
            title="Investment Status"
            sub="Pipeline breakdown"
            counts={b2s.byStatus}
            colors={B2S_STATUS_COLOR}
            delay={0.06}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PrincipalChart rows={trendRows} delay={0.06} />
          <DurationChart byDuration={b2s.byDuration} delay={0.1} />
        </div>
      </div>
    </div>
  );
}
