"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle, Clock, Wallet, TrendingUp, Star, Home, ChevronRight, CalendarCheck } from "lucide-react";
import StatCard from "./StatCard";
import StatusBadge from "./StatusBadge";
import { fmtNGN } from "./portalFormat";
import type { ClientDashboard } from "./types";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function OverviewSection({ dashboard }: { dashboard: ClientDashboard }) {
  const { stats, recentSubscriptions, recentInvestments } = dashboard;
  const hasActivity = recentSubscriptions.length > 0 || recentInvestments.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 px-1 text-xs font-bold tracking-widest text-gray-400 uppercase">Land Subscriptions</p>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <StatCard label="Total" value={stats.totalSubscriptions} icon={ClipboardList} delay={0} />
          <StatCard label="Approved" value={stats.approvedSubscriptions} icon={CheckCircle} delay={0.06} />
          <StatCard label="Pending" value={stats.pendingSubscriptions} icon={Clock} subtext="Under review" delay={0.12} />
          <StatCard label="Total Paid" value={fmtNGN(stats.totalAmountPaid)} icon={Wallet} delay={0.18} />
        </div>
      </div>

      {stats.totalInvestments > 0 && (
        <div>
          <p className="mb-3 px-1 text-xs font-bold tracking-widest text-gray-400 uppercase">Buy2Sell Investments</p>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            <StatCard label="Total" value={stats.totalInvestments} icon={TrendingUp} delay={0} />
            <StatCard label="Active" value={stats.activeInvestments} icon={CheckCircle} delay={0.06} />
            <StatCard label="Invested" value={fmtNGN(stats.totalInvested)} icon={Wallet} delay={0.12} />
            <StatCard label="Expected Payout" value={fmtNGN(stats.totalExpectedPayout)} icon={Star} delay={0.18} />
          </div>
        </div>
      )}

      {stats.totalInspections > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Inspections</p>
            <Link
              href="/client/portal/inspections"
              className="inline-flex items-center gap-1 text-xs font-bold text-customPurple-600 hover:text-customPurple-700"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <StatCard label="Total" value={stats.totalInspections} icon={CalendarCheck} delay={0} />
            <StatCard label="Upcoming" value={stats.upcomingInspections} icon={Clock} subtext="Scheduled ahead" delay={0.06} />
          </div>
        </div>
      )}

      {recentSubscriptions.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          className="overflow-hidden rounded-[2rem] border border-customBlack-100 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b border-customBlack-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h3 className="text-2xl font-bold text-customBlack-900">Recent Subscriptions</h3>
              <p className="font-medium text-customBlack-400">Your land purchase applications</p>
            </div>
          </div>
          <div className="divide-y divide-customBlack-50">
            {recentSubscriptions.map((sub) => (
              <Link
                key={sub._id}
                href={`/client/portal/${sub._id}`}
                className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-customPurple-50/30 sm:flex-row sm:items-center sm:justify-between sm:px-8"
              >
                <div>
                  <p className="font-bold text-customBlack-900">{sub.estateName}</p>
                  <p className="text-xs text-customBlack-400">
                    {sub.numberOfPlots} × {sub.plotSize} · {sub.plotType}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-customPurple-700">{fmtNGN(sub.totalAmount)}</span>
                  <StatusBadge status={sub.status} />
                  <ChevronRight size={14} className="text-customBlack-300" />
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {recentInvestments.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          className="overflow-hidden rounded-[2rem] border border-customBlack-100 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b border-customBlack-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h3 className="text-2xl font-bold text-customBlack-900">Recent Investments</h3>
              <p className="font-medium text-customBlack-400">Your Buy2Sell investment portfolio</p>
            </div>
          </div>
          <div className="divide-y divide-customBlack-50">
            {recentInvestments.map((inv) => (
              <div
                key={inv._id}
                className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-customPurple-50/30 sm:flex-row sm:items-center sm:justify-between sm:px-8"
              >
                <div>
                  <p className="font-bold text-customBlack-900">{inv.duration} Investment</p>
                  <p className="font-mono text-xs text-customBlack-400">{inv.referenceNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-customBlack-900">{fmtNGN(inv.principalAmount)}</span>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {!hasActivity && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="relative overflow-hidden rounded-[2rem] border border-customBlack-100 bg-white p-16 text-center"
        >
          <div
            className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, rgba(112,12,235,0.08), transparent 70%)" }}
          />
          <div
            className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg, rgba(63,12,145,0.1), rgba(112,12,235,0.12))" }}
          >
            <Home size={28} className="text-customPurple-500" />
          </div>
          <h3 className="relative mb-2 text-xl font-bold text-customBlack-900">No activity yet</h3>
          <p className="relative mb-6 text-sm text-customBlack-400">
            Your subscription and investment history will appear here once you make one.
          </p>
          <Link
            href="/developments"
            className="relative inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-md shadow-customPurple-200 transition-transform hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #3F0C91, #700CEB)" }}
          >
            Explore Estates
            <ChevronRight size={14} />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
