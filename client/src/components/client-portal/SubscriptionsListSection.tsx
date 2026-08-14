"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ClipboardList, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { fmtNGN, fmtDate } from "./portalFormat";
import type { PortalSubscription } from "./types";

export default function SubscriptionsListSection({ subscriptions }: { subscriptions: PortalSubscription[] }) {
  return (
    <div className="space-y-6">
      <Link
        href="/client/portal"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-customPurple-600 hover:text-customPurple-700"
      >
        <ArrowLeft size={16} /> Back to portal
      </Link>

      <div
        className="relative overflow-hidden rounded-[2rem] px-6 py-7 text-white sm:px-8"
        style={{ background: "linear-gradient(135deg, #3F0C91, #700CEB)" }}
      >
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <ClipboardList size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">My Subscriptions</h1>
            <p className="mt-0.5 text-sm text-white/60">Your land purchase applications</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[2rem] border border-customBlack-100 bg-white shadow-sm"
      >
        {subscriptions.length === 0 ? (
          <div className="py-20 text-center">
            <ClipboardList size={40} className="mx-auto mb-4 text-customBlack-200" />
            <p className="font-bold text-customBlack-500">No subscriptions found</p>
            <Link
              href="/developments"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-customPurple-200 transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #3F0C91, #700CEB)" }}
            >
              Explore Estates
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-customBlack-50/50">
                    {["Estate", "Plot", "Amount", "Status", "Applied On", ""].map((h) => (
                      <th key={h} className="px-6 py-4 text-xs font-bold tracking-widest text-customBlack-400 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-customBlack-50">
                  {subscriptions.map((sub) => (
                    <tr key={sub._id} className="transition-colors hover:bg-customPurple-50/30">
                      <td className="px-6 py-4">
                        <Link href={`/client/portal/${sub._id}`} className="text-sm font-bold text-customBlack-900 hover:text-customPurple-600">
                          {sub.estateName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-customBlack-600">
                        {sub.numberOfPlots} × {sub.plotSize} · {sub.plotType}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-customPurple-700">{fmtNGN(sub.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-customBlack-400">{fmtDate(sub.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/client/portal/${sub._id}`}>
                          <ChevronRight size={16} className="ml-auto text-customBlack-300" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-customBlack-50 sm:hidden">
              {subscriptions.map((sub) => (
                <Link
                  key={sub._id}
                  href={`/client/portal/${sub._id}`}
                  className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-customPurple-50/30"
                >
                  <div>
                    <p className="text-sm font-bold text-customBlack-900">{sub.estateName}</p>
                    <p className="mt-1 text-xs text-customBlack-400">
                      {sub.numberOfPlots} × {sub.plotSize} · {sub.plotType}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-bold text-customPurple-700">{fmtNGN(sub.totalAmount)}</span>
                      <StatusBadge status={sub.status} />
                    </div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-customBlack-300" />
                </Link>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
