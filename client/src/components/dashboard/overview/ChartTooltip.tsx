"use client";

import { fmtNGN } from "@/components/client-portal/portalFormat";
import { fmtNumber } from "./types";

type Entry = { name?: string | number; value?: number | string; color?: string };

/**
 * Recharts calls this with its own internal payload type; we only read the
 * three fields we need, so the props are declared loosely and optional.
 * Tooltips only *enhance* — every value here is also readable from the axis,
 * the direct labels, or the written count legends beside each chart.
 */
export default function ChartTooltip({
  active,
  payload,
  label,
  currency = false,
}: {
  active?: boolean;
  payload?: Entry[];
  label?: string | number;
  currency?: boolean;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-customPurple-100 bg-white px-3.5 py-2.5 shadow-[0_8px_24px_rgba(112,12,235,0.14)]">
      {label !== undefined && (
        <p className="mb-1.5 text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2 text-xs font-bold text-customBlack-900">
          <span
            aria-hidden
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: entry.color ?? "#700ceb" }}
          />
          <span>
            {entry.name}: {currency ? fmtNGN(Number(entry.value ?? 0)) : fmtNumber(Number(entry.value ?? 0))}
          </span>
        </p>
      ))}
    </div>
  );
}
