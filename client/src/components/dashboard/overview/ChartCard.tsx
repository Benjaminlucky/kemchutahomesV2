"use client";

import { motion } from "framer-motion";

/**
 * Shared white surface for every chart/analytics block on the overview.
 * Background and text colour are both set explicitly — the dashboard has no
 * dark mode, so nothing may inherit a colour from the root scheme.
 */
export default function ChartCard({
  title,
  sub,
  action,
  delay = 0,
  className = "",
  children,
}: {
  title?: string;
  sub?: string;
  action?: React.ReactNode;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    // Animated on mount, not on scroll into view: a viewport-triggered
    // entrance leaves the whole card at opacity 0 anywhere the intersection
    // observer never fires (embedded frames, print, some a11y modes), which
    // would hide real data behind decoration.
    <motion.section
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      className={`rounded-2xl border border-customBlack-100 bg-white p-4 text-customBlack-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:p-5 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-bold text-customBlack-900">{title}</h3>}
            {sub && <p className="mt-0.5 text-xs text-customBlack-400">{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}

export function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-black tracking-tight text-customBlack-900">{title}</h2>
      {sub && <p className="mt-0.5 text-xs text-customBlack-400">{sub}</p>}
    </div>
  );
}
