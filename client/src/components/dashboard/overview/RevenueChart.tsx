"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtNGN } from "@/components/client-portal/portalFormat";
import ChartCard from "./ChartCard";
import ChartTooltip from "./ChartTooltip";
import { CHART, fmtCompact, type TrendRow } from "./types";

const TICK = { fontSize: 11, fill: CHART.axis };

/** Single measure, single hue — bar length already encodes magnitude. */
export default function RevenueChart({ rows, delay = 0 }: { rows: TrendRow[]; delay?: number }) {
  const total = rows.reduce((sum, r) => sum + r.Revenue, 0);

  return (
    <ChartCard title="Monthly Revenue" sub="Subscription value booked per month" delay={delay}>
      <div className="h-52 w-full sm:h-56">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 208 }}>
          <BarChart data={rows} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
            <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={fmtCompact} width={58} />
            <Tooltip
              content={<ChartTooltip currency />}
              cursor={{ fill: "rgba(112,12,235,0.06)" }}
            />
            <Bar dataKey="Revenue" name="Revenue" fill={CHART.purple} radius={[4, 4, 0, 0]} maxBarSize={38} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 border-t border-customBlack-100 pt-3 text-xs text-customBlack-500">
        6-month total <span className="font-black text-customPurple-700">{fmtNGN(total)}</span>
      </p>
    </ChartCard>
  );
}
