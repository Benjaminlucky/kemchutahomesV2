"use client";

import { useState } from "react";
import ROISettingsSection from "./ROISettingsSection";
import LeadsSection from "./LeadsSection";
import type { LeadListResponse, ROISettings } from "./types";

const TABS = [
  { key: "leads", label: "Investments" },
  { key: "roi", label: "ROI Settings" },
] as const;

export default function Buy2SellPanel({
  initialLeads,
  initialRoi,
  pageSize,
}: {
  initialLeads: LeadListResponse | null;
  initialRoi: ROISettings | null;
  pageSize: number;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("leads");

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

      {tab === "leads" && <LeadsSection initial={initialLeads} pageSize={pageSize} />}
      {tab === "roi" && <ROISettingsSection initial={initialRoi} />}
    </div>
  );
}
