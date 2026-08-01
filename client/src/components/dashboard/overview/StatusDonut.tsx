"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "./ChartCard";
import ChartTooltip from "./ChartTooltip";
import { fmtNumber, pct, titleCase } from "./types";

/**
 * Part-to-whole at a glance (never more than four segments), always paired
 * with the written count legend below — so no value is colour-only and the
 * numbers stay readable without hovering.
 */
export default function StatusDonut({
  title,
  sub,
  counts,
  colors,
  delay = 0,
  className = "",
}: {
  title: string;
  sub: string;
  counts: Record<string, number>;
  colors: Record<string, string>;
  delay?: number;
  className?: string;
}) {
  const entries = Object.entries(counts);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const slices = entries.filter(([, v]) => v > 0).map(([key, value]) => ({ name: titleCase(key), value, key }));

  return (
    <ChartCard title={title} sub={sub} delay={delay} className={className}>
      <div className="relative h-44 w-full sm:h-48">
        {total === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-customBlack-400">Nothing recorded yet.</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height: 176 }}>
              <PieChart>
                <Pie
                  data={slices}
                  cx="50%"
                  cy="50%"
                  innerRadius="62%"
                  outerRadius="88%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.key} fill={colors[slice.key] ?? "#737373"} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl leading-none font-black text-customBlack-900">{fmtNumber(total)}</p>
              <p className="mt-0.5 text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">Total</p>
            </div>
          </>
        )}
      </div>

      {/* Container query, not a viewport breakpoint: this card sits in a
          1/3-width column on desktop and full width on mobile, so what matters
          is the card's own width — two columns only once a label + count fits.
          The query must live on a descendant of the container, hence the div. */}
      <div className="@container/legend">
        <ul className="mt-3 grid grid-cols-1 gap-2 @[19rem]/legend:grid-cols-2">
          {entries.map(([key, value]) => (
            <li
              key={key}
              className="flex items-center justify-between gap-2 rounded-lg bg-customBlack-50 px-2.5 py-1.5"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: colors[key] ?? "#737373" }}
                />
                <span className="truncate text-[11px] font-semibold text-customBlack-600">{titleCase(key)}</span>
              </span>
              <span className="shrink-0 text-[11px] font-black text-customBlack-900 tabular-nums">
                {fmtNumber(value)}
                <span className="ml-1 font-semibold text-customBlack-400">{pct(value, total)}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}
