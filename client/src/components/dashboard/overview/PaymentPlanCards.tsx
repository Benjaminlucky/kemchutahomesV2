"use client";

import { motion } from "framer-motion";
import { CHART, fmtNumber, pct, titleCase, type Analytics } from "./types";

// Ordered accents from the validated palette — plan identity, not rank.
const ACCENTS = [CHART.purple, CHART.blue, CHART.green, CHART.amber, CHART.purpleMid, CHART.red];

export default function PaymentPlanCards({
  byPaymentPlan,
  total,
}: {
  byPaymentPlan: Analytics["subscriptions"]["byPaymentPlan"];
  total: number;
}) {
  if (!byPaymentPlan.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {byPaymentPlan.map((plan, i) => {
        const share = pct(plan.count, total);
        const accent = ACCENTS[i % ACCENTS.length];

        return (
          <motion.div
            key={plan.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
            className="rounded-2xl border border-customBlack-100 bg-white p-5 text-customBlack-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="mb-1 text-[11px] font-bold tracking-widest text-customBlack-500 uppercase">
                  {titleCase(plan.label)}
                </p>
                <p className="text-2xl font-black text-customBlack-900">{fmtNumber(plan.count)}</p>
                <p className="text-xs text-customBlack-400">
                  subscription{plan.count === 1 ? "" : "s"} on this plan
                </p>
              </div>
              {/* Ring rather than a filled disc — the share reads as dark text
                  on white, so no accent needs to carry small white type. */}
              <span
                aria-hidden
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                style={{ background: `conic-gradient(${accent} ${share * 3.6}deg, #e5e5e5 0deg)` }}
              >
                <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white text-sm font-black text-customBlack-900">
                  {share}%
                </span>
              </span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-customBlack-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${share}%` }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: accent }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
