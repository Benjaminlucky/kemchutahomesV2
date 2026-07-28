import Link from "next/link";
import { ClipboardList, CheckCircle, Clock, Wallet, TrendingUp, Star, Home, ChevronRight } from "lucide-react";
import StatCard from "./StatCard";
import StatusBadge from "./StatusBadge";
import { fmtNGN } from "./portalFormat";
import type { ClientDashboard } from "./types";

export default function OverviewSection({ dashboard }: { dashboard: ClientDashboard }) {
  const { stats, recentSubscriptions, recentInvestments } = dashboard;
  const hasActivity = recentSubscriptions.length > 0 || recentInvestments.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 px-1 text-xs font-bold tracking-widest text-gray-400 uppercase">Land Subscriptions</p>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <StatCard label="Total" value={stats.totalSubscriptions} icon={ClipboardList} />
          <StatCard label="Approved" value={stats.approvedSubscriptions} icon={CheckCircle} />
          <StatCard label="Pending" value={stats.pendingSubscriptions} icon={Clock} subtext="Under review" />
          <StatCard label="Total Paid" value={fmtNGN(stats.totalAmountPaid)} icon={Wallet} />
        </div>
      </div>

      {stats.totalInvestments > 0 && (
        <div>
          <p className="mb-3 px-1 text-xs font-bold tracking-widest text-gray-400 uppercase">Buy2Sell Investments</p>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            <StatCard label="Total" value={stats.totalInvestments} icon={TrendingUp} />
            <StatCard label="Active" value={stats.activeInvestments} icon={CheckCircle} />
            <StatCard label="Invested" value={fmtNGN(stats.totalInvested)} icon={Wallet} />
            <StatCard label="Expected Payout" value={fmtNGN(stats.totalExpectedPayout)} icon={Star} />
          </div>
        </div>
      )}

      {recentSubscriptions.length > 0 && (
        <section className="overflow-hidden rounded-[2rem] border border-customBlack-100 bg-white shadow-sm">
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
        </section>
      )}

      {recentInvestments.length > 0 && (
        <section className="overflow-hidden rounded-[2rem] border border-customBlack-100 bg-white shadow-sm">
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
        </section>
      )}

      {!hasActivity && (
        <div className="rounded-[2rem] border border-customBlack-100 bg-white p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-customPurple-50">
            <Home size={28} className="text-customPurple-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-customBlack-900">No activity yet</h3>
          <p className="mb-6 text-sm text-customBlack-400">
            Your subscription and investment history will appear here once you make one.
          </p>
          <Link
            href="/developments"
            className="inline-flex items-center gap-2 rounded-2xl bg-customPurple-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-customPurple-700"
          >
            Explore Estates
            <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
