"use client";

import { Plus, Trash2 } from "lucide-react";

export type PaymentPlanRow = { plot: string; outright: string; initialDeposit: string };

export default function PaymentPlanInput({
  rows,
  onChange,
}: {
  rows: PaymentPlanRow[];
  onChange: (rows: PaymentPlanRow[]) => void;
}) {
  function update(index: number, field: keyof PaymentPlanRow, value: string) {
    onChange(rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">Payment plans</label>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <input
              value={row.plot}
              onChange={(e) => update(i, "plot", e.target.value)}
              placeholder="Plot size (e.g. 500sqm)"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-customPurple-500"
            />
            <input
              value={row.outright}
              onChange={(e) => update(i, "outright", e.target.value)}
              placeholder="Outright price"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-customPurple-500"
            />
            <input
              value={row.initialDeposit}
              onChange={(e) => update(i, "initialDeposit", e.target.value)}
              placeholder="Initial deposit"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-customPurple-500"
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
              aria-label="Remove payment plan"
              className="flex items-center justify-center rounded-lg px-3 text-red-500 hover:bg-red-50"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...rows, { plot: "", outright: "", initialDeposit: "" }])}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-customPurple-50 px-4 py-2 text-sm font-bold text-customPurple-600 hover:bg-customPurple-100"
      >
        <Plus size={14} />
        Add payment plan
      </button>
    </div>
  );
}
