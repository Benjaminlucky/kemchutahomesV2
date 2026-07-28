"use client";

import { useState } from "react";
import LedgerSection from "./LedgerSection";
import TierSettingsSection from "./TierSettingsSection";
import type { AdminCommissionListResponse, CommissionTierSettings } from "./types";

const TABS = [
  { key: "ledger", label: "Ledger" },
  { key: "tiers", label: "Tier Settings" },
] as const;

export default function CommissionsPanel({
  initialLedger,
  initialTiers,
  pageSize,
}: {
  initialLedger: AdminCommissionListResponse | null;
  initialTiers: CommissionTierSettings | null;
  pageSize: number;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("ledger");

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-customBlack-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              tab === t.key
                ? "border-customPurple-500 text-customPurple-700"
                : "border-transparent text-customBlack-400 hover:text-customBlack-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ledger" && <LedgerSection initial={initialLedger} pageSize={pageSize} />}
      {tab === "tiers" && <TierSettingsSection initial={initialTiers} />}
    </div>
  );
}
