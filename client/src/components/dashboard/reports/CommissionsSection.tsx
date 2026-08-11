"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, Receipt, Undo2, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtNGN } from "@/components/client-portal/portalFormat";
import ChartCard, { SectionHeading } from "../overview/ChartCard";
import ChartTooltip from "../overview/ChartTooltip";
import KpiCard from "../overview/KpiCard";
import { CHART, buildCommissionTrendRows, fmtCompact, fmtNGNCompact, pct, type Analytics } from "../overview/types";

const TICK = { fontSize: 11, fill: CHART.axis };
const SOURCE_ACCENTS = [CHART.purple, CHART.purpleMid, CHART.blue];

function MonthlyPaidChart({ rows }: { rows: ReturnType<typeof buildCommissionTrendRows> }) {
  const total = rows.reduce((sum, r) => sum + r.Paid, 0);
  return (
    <ChartCard title="Monthly Payouts" sub="Commission actually paid out per month" className="xl:col-span-2">
      <div className="h-56 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 240 }}>
          <BarChart data={rows} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
            <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={fmtCompact} width={58} />
            <Tooltip content={<ChartTooltip currency />} cursor={{ fill: "rgba(112,12,235,0.06)" }} />
            <Bar dataKey="Paid" name="Paid" fill={CHART.green} radius={[4, 4, 0, 0]} maxBarSize={38} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 border-t border-customBlack-100 pt-3 text-xs text-customBlack-500">
        6-month total <span className="font-black text-customPurple-700">{fmtNGN(total)}</span>
      </p>
    </ChartCard>
  );
}

function SourceSplit({ bySource, delay = 0 }: { bySource: Analytics["commissions"]["bySource"]; delay?: number }) {
  const total = bySource.reduce((sum, s) => sum + s.net, 0);

  return (
    <ChartCard title="Lands vs Buy2Sell" sub="Share of confirmed commission by product" delay={delay}>
      {bySource.length === 0 || total === 0 ? (
        <p className="py-12 text-center text-xs text-customBlack-400">No confirmed commissions yet.</p>
      ) : (
        <div className="space-y-3">
          {bySource.map((s, i) => {
            const share = pct(s.net, total);
            const accent = SOURCE_ACCENTS[i % SOURCE_ACCENTS.length];
            return (
              <div key={s.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-bold text-customBlack-700">{s.label}</span>
                  <span className="font-black text-customBlack-900">{fmtNGN(s.net)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-customBlack-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${share}%` }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: accent }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-customBlack-400">
                  {share}% · {s.count} deal{s.count === 1 ? "" : "s"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}

function LevelChart({ byLevel, delay = 0 }: { byLevel: Analytics["commissions"]["byLevel"]; delay?: number }) {
  const LEVEL_LABEL: Record<number, string> = {
    1: "L1 · Direct",
    2: "L2 · Recruiter",
    3: "L3 · Upline",
    4: "L4 · Top",
  };
  const rows = [...byLevel]
    .sort((a, b) => a.level - b.level)
    .map((l) => ({ label: LEVEL_LABEL[l.level] ?? `Level ${l.level}`, net: l.net, count: l.count }));

  return (
    <ChartCard title="By Hierarchy Level" sub="Confirmed commission per level" delay={delay}>
      {rows.length === 0 ? (
        <p className="py-12 text-center text-xs text-customBlack-400">No confirmed commissions yet.</p>
      ) : (
        <div className="h-52 w-full sm:h-56">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 208 }}>
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={TICK} axisLine={false} tickLine={false} tickFormatter={fmtCompact} hide />
              <YAxis
                dataKey="label"
                type="category"
                tick={{ ...TICK, fill: "#404040" }}
                axisLine={false}
                tickLine={false}
                width={92}
              />
              <Tooltip content={<ChartTooltip currency />} cursor={{ fill: "rgba(112,12,235,0.06)" }} />
              <Bar dataKey="net" name="Net" fill={CHART.purple} radius={[0, 4, 4, 0]} maxBarSize={22}>
                <LabelList
                  dataKey="net"
                  position="right"
                  offset={8}
                  formatter={(v: unknown) => fmtCompact(Number(v))}
                  style={{ fontSize: 11, fontWeight: 800, fill: "#262626" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export default function CommissionsSection({ analytics }: { analytics: Analytics }) {
  const c = analytics.commissions;
  const trendRows = buildCommissionTrendRows(analytics);

  return (
    <div>
      <SectionHeading title="Commissions & Payouts" sub="What realtors have earned across both products" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          <KpiCard label="Pending" value={fmtNGNCompact(c.byStatus.pending)} sub="Awaiting clawback window" icon={Clock} color={CHART.amber} />
          <KpiCard label="Approved" value={fmtNGNCompact(c.byStatus.approved)} sub="Ready for payout" icon={CheckCircle} color={CHART.green} delay={0.04} />
          <KpiCard label="Paid Out" value={fmtNGNCompact(c.byStatus.paid)} sub="Already disbursed" icon={Wallet} color={CHART.purple} delay={0.08} />
          <KpiCard label="Clawed Back" value={fmtNGNCompact(c.byStatus.clawedback)} sub="Reversed commission" icon={Undo2} color={CHART.red} delay={0.12} />
          <KpiCard label="WHT Withheld" value={fmtNGNCompact(c.totalWht)} sub="On confirmed commission" icon={Receipt} color={CHART.blue} delay={0.16} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <MonthlyPaidChart rows={trendRows} />
          <SourceSplit bySource={c.bySource} delay={0.06} />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <LevelChart byLevel={c.byLevel} delay={0.1} />
        </div>
      </div>
    </div>
  );
}
