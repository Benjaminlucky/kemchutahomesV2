"use client";

import { Users, Link2 } from "lucide-react";
import StatCard from "@/components/client-portal/StatCard";

type RealtorSummary = {
  name: string;
  downlines: number;
  recruitedBy: string;
  referralCode: string;
  referralLink: string;
};

export default function RealtorOverview({ summary }: { summary: RealtorSummary }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="My Recruits" value={summary.downlines} icon={Users} subtext={`Recruited by ${summary.recruitedBy}`} />
        <StatCard label="Referral Code" value={summary.referralCode} icon={Link2} />
      </div>

      <div className="rounded-3xl border border-customBlack-100 bg-white p-6">
        <p className="mb-2 text-xs font-bold tracking-widest text-customBlack-400 uppercase">Your referral link</p>
        <p className="break-all rounded-xl bg-customPurple-50 px-4 py-3 font-mono text-sm text-customPurple-700">
          {summary.referralLink}
        </p>
      </div>
    </div>
  );
}
