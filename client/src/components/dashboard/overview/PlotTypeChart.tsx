"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtNGN } from "@/components/client-portal/portalFormat";
import ChartCard from "./ChartCard";
import ChartTooltip from "./ChartTooltip";
import { CHART, titleCase, type Analytics } from "./types";

const TICK = { fontSize: 11, fill: CHART.axis };
const MAX_ROWS = 6;

type Row = { label: string; Subscriptions: number; revenue: number };

/** Keeps the chart to six readable rows — the tail folds into "Other". */
export function buildPlotTypeRows(byPlotType: Analytics["subscriptions"]["byPlotType"]): Row[] {
  const sorted = [...byPlotType].sort((a, b) => b.count - a.count);
  const head = sorted.slice(0, MAX_ROWS).map((p) => ({
    label: titleCase(p.label),
    Subscriptions: p.count,
    revenue: p.revenue,
  }));
  const tail = sorted.slice(MAX_ROWS);
  if (tail.length) {
    head.push({
      label: "Other",
      Subscriptions: tail.reduce((s, p) => s + p.count, 0),
      revenue: tail.reduce((s, p) => s + p.revenue, 0),
    });
  }
  return head;
}

export default function PlotTypeChart({
  byPlotType,
  delay = 0,
}: {
  byPlotType: Analytics["subscriptions"]["byPlotType"];
  delay?: number;
}) {
  const rows = buildPlotTypeRows(byPlotType);
  const top = rows[0];

  return (
    <ChartCard title="Plot Type Breakdown" sub="Subscriptions by land type" delay={delay}>
      {rows.length === 0 ? (
        <p className="py-12 text-center text-xs text-customBlack-400">No subscriptions recorded yet.</p>
      ) : (
        <>
          <div className="h-52 w-full sm:h-56">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 208 }}>
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 28, left: 0, bottom: 0 }}>
                {/* No grid: the value axis is hidden and every bar is directly
                    labelled, so gridlines would be chrome with nothing to read. */}
                <XAxis type="number" tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} hide />
                <YAxis
                  dataKey="label"
                  type="category"
                  tick={{ ...TICK, fill: "#404040" }}
                  axisLine={false}
                  tickLine={false}
                  width={84}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(112,12,235,0.06)" }} />
                <Bar dataKey="Subscriptions" fill={CHART.purpleMid} radius={[0, 4, 4, 0]} maxBarSize={22}>
                  <LabelList
                    dataKey="Subscriptions"
                    position="right"
                    offset={8}
                    style={{ fontSize: 11, fontWeight: 800, fill: "#262626" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {top && (
            <p className="mt-3 border-t border-customBlack-100 pt-3 text-xs text-customBlack-500">
              Top seller <span className="font-bold text-customBlack-900">{top.label}</span> —{" "}
              <span className="font-black text-customPurple-700">{fmtNGN(top.revenue)}</span>
            </p>
          )}
        </>
      )}
    </ChartCard>
  );
}
