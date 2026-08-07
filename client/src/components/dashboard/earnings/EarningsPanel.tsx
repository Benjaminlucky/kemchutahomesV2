"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { BarChart3, CheckCircle, Clock, Wallet, Undo2, Info, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";
import {
  COMMISSION_STATUSES,
  SOURCE_TYPES,
  statusTone,
  statusLabel,
  sourceLabel,
  naira,
  fmtDate,
  LEVEL_LABELS,
  type Commission,
  type CommissionStatus,
  type SourceType,
  type MyCommissionsResponse,
} from "./types";
import type { CommissionTierSettings } from "../commissions/types";

const HEADERS = ["Sale / Reference", "Level", "Commission", "Status", "Date", ""];

async function fetchEarnings(page: number, limit: number, status: string, sourceType: string): Promise<MyCommissionsResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) qs.set("status", status);
  if (sourceType) qs.set("sourceType", sourceType);
  const res = await dashboardFetch(`/api/commissions/my?${qs}`);
  if (!res.ok) throw new Error("Failed to load earnings");
  return res.json();
}

async function fetchTiers(): Promise<CommissionTierSettings> {
  const res = await dashboardFetch("/api/commissions/tiers");
  if (!res.ok) throw new Error("Failed to load commission rates");
  return res.json();
}

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string; icon: typeof BarChart3; sub: string }) {
  return (
    <div className="rounded-2xl border border-customBlack-100 bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">{label}</p>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-customPurple-50">
          <Icon size={16} className="text-customPurple-600" />
        </div>
      </div>
      <p className="text-lg font-black tracking-tight break-all text-customBlack-900">{value}</p>
      <p className="mt-1 text-[11px] text-customBlack-400">{sub}</p>
    </div>
  );
}

function DetailGrid({ commission }: { commission: Commission }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
      {[
        ["Sale Amount", naira(commission.saleAmount)],
        ["Gross Commission", naira(commission.grossAmount)],
        ["WHT Deducted", naira(commission.whtAmount)],
        ["Net Payable", naira(commission.netAmount)],
        ["Clawback Window", commission.finalAt ? `Until ${fmtDate(commission.finalAt)}` : "—"],
        ["Paid On", commission.paidAt ? fmtDate(commission.paidAt) : "Pending"],
      ].map(([label, value]) => (
        <div key={label}>
          <p className="text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">{label}</p>
          <p className="text-sm font-bold break-words text-customBlack-900">{value}</p>
        </div>
      ))}
      {commission.status === "clawedback" && commission.clawbackReason && (
        <div className="col-span-full">
          <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase">Reversal Reason</p>
          <p className="text-sm font-bold break-words text-red-600">{commission.clawbackReason}</p>
        </div>
      )}
    </div>
  );
}

function CommissionRow({ commission }: { commission: Commission }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr onClick={() => setOpen((o) => !o)} className="cursor-pointer hover:bg-customPurple-50/30">
        <td className="px-6 py-3.5">
          <div className="flex items-center gap-2">
            <Building2 size={13} className="shrink-0 text-customBlack-300" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Badge tone={commission.sourceType === "buy2sell" ? "purple" : "gray"}>{sourceLabel(commission.sourceType)}</Badge>
              </div>
              <p className="mt-0.5 truncate text-sm font-bold text-customBlack-900">
                {commission.saleLabel || commission.estateName || "—"}
              </p>
              <p className="font-mono text-[10px] text-customBlack-400">{commission.referenceNumber || "—"}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-3.5">
          <Badge tone="purple">L{commission.level}</Badge>
          <p className="mt-0.5 text-[10px] text-customBlack-400">{LEVEL_LABELS[commission.level]}</p>
        </td>
        <td className="px-6 py-3.5">
          <p className="text-sm font-black text-customPurple-700">{naira(commission.netAmount)}</p>
          <p className="text-[10px] text-customBlack-400">
            {commission.percent}% of {naira(commission.saleAmount)}
          </p>
        </td>
        <td className="px-6 py-3.5">
          <Badge tone={statusTone(commission.status)}>{statusLabel(commission.status)}</Badge>
        </td>
        <td className="px-6 py-3.5 text-right text-xs text-customBlack-400">{fmtDate(commission.createdAt)}</td>
        <td className="px-3 py-3.5 text-customBlack-300">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="border-b border-customBlack-50 bg-customPurple-50/20 px-6 py-4">
            <DetailGrid commission={commission} />
          </td>
        </tr>
      )}
    </>
  );
}

function CommissionCard({ commission }: { commission: Commission }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="overflow-hidden rounded-2xl border border-customBlack-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge tone={commission.sourceType === "buy2sell" ? "purple" : "gray"}>{sourceLabel(commission.sourceType)}</Badge>
          <p className="mt-1 truncate text-base font-bold text-customBlack-900">
            {commission.saleLabel || commission.estateName || "—"}
          </p>
          <p className="font-mono text-[10px] text-customBlack-400">{commission.referenceNumber || "—"}</p>
        </div>
        <Badge tone={statusTone(commission.status)}>{statusLabel(commission.status)}</Badge>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-customBlack-50/60 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Badge tone="purple">L{commission.level}</Badge>
          <div>
            <p className="text-sm font-black text-customPurple-700">{naira(commission.netAmount)}</p>
            <p className="text-[10px] text-customBlack-400">{commission.percent}% of {naira(commission.saleAmount)}</p>
          </div>
        </div>
        <span className="text-xs text-customBlack-400">{fmtDate(commission.createdAt)}</span>
      </div>
      {open && (
        <div className="mt-3 border-t border-customBlack-50 pt-3">
          <DetailGrid commission={commission} />
        </div>
      )}
      <Button variant="ghost" size="sm" className="mt-3 w-full justify-center" onClick={() => setOpen((o) => !o)}>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {open ? "Hide" : "Show"} Details
      </Button>
    </article>
  );
}

export default function EarningsPanel({ initial, pageSize }: { initial: MyCommissionsResponse | null; pageSize: number }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<CommissionStatus | "">("");
  const [sourceFilter, setSourceFilter] = useState<SourceType | "">("");

  const { data, isFetching, error } = useQuery({
    queryKey: ["earnings", page, status, sourceFilter],
    queryFn: () => fetchEarnings(page, pageSize, status, sourceFilter),
    initialData: page === 1 && !status && !sourceFilter ? (initial ?? undefined) : undefined,
    placeholderData: keepPreviousData,
  });

  const { data: tiers } = useQuery({ queryKey: ["commission-tiers"], queryFn: fetchTiers });

  const commissions = data?.commissions ?? [];
  const totals = data?.totals ?? [];
  const levelTotals = data?.levelTotals ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  // "Total Earned" and the level breakdown both deliberately exclude
  // clawedback — a reversed commission was never actually earned, so
  // counting it here previously made a realtor's headline number impossible
  // to reconcile against Pending + Approved + Paid.
  const byStatus = (key: CommissionStatus) => totals.find((t) => t._id === key)?.totalNet || 0;
  const totalEarned = totals.filter((t) => t._id !== "clawedback").reduce((acc, t) => acc + t.totalNet, 0);
  const reversedTotal = byStatus("clawedback");

  const maxLevelTotal = Math.max(...levelTotals.map((l) => l.total), 1);

  function goTo(p: number) {
    if (p < 1 || p > pages || p === page) return;
    setPage(p);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-customBlack-900">My Earnings</h1>
        <p className="mt-0.5 text-sm text-customBlack-400">Commission earned from your Lands and Buy2Sell sales</p>
      </div>

      {error && <ErrorBanner>{error.message}</ErrorBanner>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Earned" value={naira(totalEarned)} icon={BarChart3} sub={`${total} commission${total !== 1 ? "s" : ""}`} />
        <StatCard label="Pending" value={naira(byStatus("pending"))} icon={Clock} sub="Awaiting clawback window" />
        <StatCard label="Approved" value={naira(byStatus("approved"))} icon={CheckCircle} sub="Ready for payout" />
        <StatCard label="Paid Out" value={naira(byStatus("paid"))} icon={Wallet} sub="Received in full" />
        <StatCard label="Reversed" value={naira(reversedTotal)} icon={Undo2} sub="Clawed back, not earned" />
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-customPurple-100 bg-customPurple-50/60 p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-customPurple-600" />
        {tiers ? (
          <p className="text-xs leading-relaxed text-customBlack-600">
            You earn <strong>{tiers.level1Percent}%</strong> on every direct sale you close (Level 1). You also earn
            override commissions when realtors you recruited make sales — <strong>{tiers.level2Percent}%</strong> (L2),{" "}
            <strong>{tiers.level3Percent}%</strong> (L3), <strong>{tiers.level4Percent}%</strong> (L4). WHT of{" "}
            <strong>{tiers.whtPercent}%</strong> is deducted before payout. Commissions are held for a{" "}
            <strong>{tiers.clawbackDays}-day</strong> clawback window then auto-approved. Applies to both Lands and
            Buy2Sell sales.
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-customBlack-400">Loading current commission rates…</p>
        )}
      </div>

      {levelTotals.length > 0 && (
        <div className="rounded-2xl border border-customBlack-100 bg-white p-6">
          <p className="mb-4 text-[11px] font-bold tracking-widest text-customBlack-400 uppercase">Earnings by Commission Level</p>
          <div className="space-y-3">
            {levelTotals.map(({ _id: level, count, total: levelTotal }) => (
              <div key={level}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge tone="purple">L{level}</Badge>
                    <span className="text-xs font-semibold text-customBlack-600">{LEVEL_LABELS[level]}</span>
                    <span className="text-[11px] text-customBlack-400">
                      ({count} sale{count !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <span className="text-sm font-black text-customPurple-700">{naira(levelTotal)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-customBlack-50">
                  <div className="h-full rounded-full bg-customPurple-500" style={{ width: `${Math.round((levelTotal / maxLevelTotal) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-customBlack-900">Transaction History</p>
            <p className="text-xs text-customBlack-400">{total} commission records</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["" as const, ...COMMISSION_STATUSES] as const).map((s) => (
              <button
                key={s || "all"}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  status === s ? "bg-customPurple-500 text-white" : "bg-customBlack-50 text-customBlack-500"
                }`}
              >
                {s ? statusLabel(s) : "All"}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(["" as const, ...SOURCE_TYPES] as const).map((s) => (
            <button
              key={s || "all-products"}
              onClick={() => {
                setSourceFilter(s);
                setPage(1);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                sourceFilter === s ? "bg-customBlack-900 text-white" : "bg-customBlack-50 text-customBlack-500"
              }`}
            >
              {s ? sourceLabel(s) : "All Products"}
            </button>
          ))}
        </div>

        {/* ── Desktop / tablet: full table ───────────────────────────────── */}
        <TableShell className="hidden md:block">
          <TableHeadRow headers={HEADERS} />
          <TableBody>
            {commissions.map((c) => (
              <CommissionRow key={c._id} commission={c} />
            ))}
            {!isFetching && commissions.length === 0 && (
              <TableEmptyRow colSpan={6} message={status ? `No ${statusLabel(status)} commissions` : "No commissions yet — your earnings will appear here once you close your first sale."} />
            )}
          </TableBody>
        </TableShell>

        {/* ── Mobile: one card per commission ────────────────────────────── */}
        <div className="space-y-3 md:hidden">
          {commissions.map((c) => (
            <CommissionCard key={c._id} commission={c} />
          ))}
          {!isFetching && commissions.length === 0 && (
            <div className="rounded-2xl border border-customBlack-100 bg-white px-6 py-16 text-center text-sm text-gray-400">
              {status ? `No ${statusLabel(status)} commissions` : "No commissions yet — your earnings will appear here once you close your first sale."}
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-customBlack-500">
            <span>
              Page {page} of {pages} — {total} total
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => goTo(page - 1)} disabled={page <= 1 || isFetching}>
                Prev
              </Button>
              <Button variant="secondary" size="sm" onClick={() => goTo(page + 1)} disabled={page >= pages || isFetching}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-customBlack-400">
        Payout requests are processed by the admin team. Contact{" "}
        <a href="mailto:info@kemchutahomesltd.com" className="font-bold text-customPurple-600">
          info@kemchutahomesltd.com
        </a>{" "}
        to request your approved earnings.
      </p>
    </div>
  );
}
