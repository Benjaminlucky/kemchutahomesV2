"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import type { Trend } from "./types";

const TREND_STYLE: Record<Trend, { pill: string; Icon: LucideIcon }> = {
  up: { pill: "bg-green-100 text-green-700", Icon: ArrowUpRight },
  down: { pill: "bg-red-100 text-red-700", Icon: ArrowDownRight },
  flat: { pill: "bg-customBlack-100 text-customBlack-600", Icon: Minus },
};

export type KpiCardProps = {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  /** Accent hex from the validated CHART palette — tints the icon tile and rule. */
  color: string;
  trend?: Trend;
  trendValue?: number;
  delay?: number;
};

export default function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  trend,
  trendValue,
  delay = 0,
}: KpiCardProps) {
  const trendStyle = trend ? TREND_STYLE[trend] : null;

  return (
    <motion.div
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="group flex flex-col rounded-2xl border border-customBlack-100 bg-white p-4 text-customBlack-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_10px_28px_rgba(112,12,235,0.12)] sm:p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${color}1a` }}
        >
          <Icon size={18} style={{ color }} />
        </span>
        {trendStyle && trendValue !== undefined && (
          <span
            className={`flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-bold ${trendStyle.pill}`}
          >
            <trendStyle.Icon size={11} aria-hidden />
            {Math.abs(trendValue)}%
          </span>
        )}
      </div>

      <p className="text-xl leading-none font-black tracking-tight text-customBlack-900 sm:text-2xl">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-bold tracking-wider text-customBlack-500 uppercase">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-customBlack-400">{sub}</p>}

      <div aria-hidden className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-customBlack-100">
        <div
          className="h-full w-0 rounded-full transition-[width] duration-700 ease-out group-hover:w-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}
