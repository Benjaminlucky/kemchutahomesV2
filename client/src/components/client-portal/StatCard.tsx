"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="flex flex-col justify-between rounded-3xl border border-customBlack-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-customPurple-100/60"
    >
      <div
        className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: "linear-gradient(135deg, rgba(63,12,145,0.1), rgba(112,12,235,0.12))" }}
      >
        <Icon size={22} className="text-customPurple-600" />
      </div>
      <div>
        <p className="mb-1 text-xs font-bold tracking-widest text-customBlack-400 uppercase">{label}</p>
        <p className="text-3xl font-black tracking-tight text-customBlack-900">{value}</p>
        {subtext && <p className="mt-1 text-xs text-customBlack-400">{subtext}</p>}
      </div>
    </motion.div>
  );
}
