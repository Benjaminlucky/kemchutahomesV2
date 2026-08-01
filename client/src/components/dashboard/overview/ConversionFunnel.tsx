"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import ChartCard from "./ChartCard";
import { buildFunnelSteps, fmtNumber, type Analytics } from "./types";

/**
 * Ordered stages, so the accent walks the pipeline (blue → purple → amber →
 * green) rather than being assigned by size. Each step is directly labelled,
 * so the colour is reinforcement, never the only cue.
 */
export default function ConversionFunnel({ analytics, delay = 0 }: { analytics: Analytics; delay?: number }) {
  const steps = buildFunnelSteps(analytics);

  return (
    <ChartCard
      title="Subscription Conversion Funnel"
      sub="How enquiries move from a site visit to an approved sale"
      delay={delay}
    >
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step.stage} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.09, duration: 0.4, ease: "easeOut" }}
              className="h-full rounded-xl border border-customBlack-100 bg-customBlack-50 p-4 text-center"
            >
              {/* Accent ring with dark type rather than white-on-accent: the
                  amber step would sit under 3:1 as a filled disc. */}
              <span
                aria-hidden
                className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-customBlack-900"
                style={{ boxShadow: `inset 0 0 0 3px ${step.color}` }}
              >
                {i + 1}
              </span>
              <p className="text-xl font-black text-customBlack-900">{fmtNumber(step.value)}</p>
              <p className="mt-0.5 text-xs font-bold text-customBlack-600">{step.stage}</p>

              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-customBlack-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${step.pct}%` }}
                  transition={{ delay: 0.2 + i * 0.09, duration: 0.7, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: step.color }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-customBlack-500">
                {step.pct}% {step.basis}
              </p>
            </motion.div>

            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute top-1/2 right-0 z-10 hidden h-6 w-6 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-customBlack-200 bg-white text-customBlack-500 xl:flex"
              >
                <ChevronRight size={13} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </ChartCard>
  );
}
