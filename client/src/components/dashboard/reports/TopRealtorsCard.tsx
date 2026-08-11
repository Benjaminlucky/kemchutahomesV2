"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { fmtNGN } from "@/components/client-portal/portalFormat";
import ChartCard from "../overview/ChartCard";
import { CHART, type Analytics } from "../overview/types";

const RANK_ACCENT = [CHART.amber, "#9ca3af", "#b45309", CHART.purple, CHART.purple];

export default function TopRealtorsCard({
  topRealtors,
  delay = 0,
}: {
  topRealtors: Analytics["topRealtors"];
  delay?: number;
}) {
  const max = Math.max(1, ...topRealtors.map((r) => r.totalEarned));

  return (
    <ChartCard title="Top Earning Realtors" sub="Highest confirmed commission (approved + paid)" delay={delay}>
      {topRealtors.length === 0 ? (
        <p className="py-12 text-center text-xs text-customBlack-400">No confirmed commissions yet.</p>
      ) : (
        <ol className="space-y-3">
          {topRealtors.map((r, i) => (
            <motion.li
              key={r.id || r.email}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + i * 0.07, duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-3 rounded-xl border border-customBlack-100 bg-customBlack-50 p-3"
            >
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-customBlack-900"
                style={{ boxShadow: `inset 0 0 0 2px ${RANK_ACCENT[i % RANK_ACCENT.length]}` }}
              >
                {i === 0 ? <Trophy size={14} style={{ color: RANK_ACCENT[0] }} /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-bold text-customBlack-900">{r.name}</p>
                  <p className="shrink-0 text-sm font-black text-customPurple-700">{fmtNGN(r.totalEarned)}</p>
                </div>
                <p className="truncate text-[11px] text-customBlack-400">
                  {r.email} · {r.dealCount} deal{r.dealCount === 1 ? "" : "s"}
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-customBlack-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.totalEarned / max) * 100}%` }}
                    transition={{ delay: delay + 0.15 + i * 0.07, duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full bg-customPurple-500"
                  />
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      )}
    </ChartCard>
  );
}
