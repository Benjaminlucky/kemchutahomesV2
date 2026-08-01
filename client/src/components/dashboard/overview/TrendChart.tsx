"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "./ChartCard";
import ChartTooltip from "./ChartTooltip";
import { CHART, fmtNumber, type TrendRow } from "./types";

const TICK = { fontSize: 11, fill: CHART.axis };

/**
 * Volume over the last 6 months. Counts only — revenue lives in its own chart
 * so the two never share a plot with mismatched scales.
 */
export default function TrendChart({ rows }: { rows: TrendRow[] }) {
  const latest = rows.at(-1);

  return (
    <ChartCard
      title="Monthly Activity Trend"
      sub="Subscriptions and inspections over the last 6 months"
      className="xl:col-span-2"
      action={
        latest && (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">{latest.month}</p>
            <p className="text-sm font-black text-customPurple-700">
              {fmtNumber(latest.Subscriptions)} subs · {fmtNumber(latest.Inspections)} insp
            </p>
          </div>
        )
      }
    >
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 260 }}>
          <AreaChart data={rows} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ovSubGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.purple} stopOpacity={0.28} />
                <stop offset="100%" stopColor={CHART.purple} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="ovInspGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.blue} stopOpacity={0.24} />
                <stop offset="100%" stopColor={CHART.blue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
            <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} width={44} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: CHART.grid, strokeWidth: 24 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Area
              type="monotone"
              dataKey="Subscriptions"
              stroke={CHART.purple}
              strokeWidth={2}
              fill="url(#ovSubGrad)"
              activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
              dot={{ r: 3, fill: CHART.purple, stroke: "#ffffff", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="Inspections"
              stroke={CHART.blue}
              strokeWidth={2}
              fill="url(#ovInspGrad)"
              activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
              dot={{ r: 3, fill: CHART.blue, stroke: "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
