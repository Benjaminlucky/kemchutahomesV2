"use client";

import { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { BarChart3, Clock, CheckCircle, Wallet, Undo2, ChevronDown, ChevronUp } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { TableShell, TableBody, TableEmptyRow } from "@/components/ui/Table";
import MarkPaidModal from "./MarkPaidModal";
import {
  COMMISSION_STATUSES,
  STATUS_TONE,
  statusLabel,
  LEVEL_LABELS,
  type AdminCommission,
  type AdminCommissionListResponse,
  type CommissionStatus,
} from "./types";

const HEADERS = ["", "Realtor", "Sale", "Level", "Commission", "Status", "Date", ""];

function naira(n: number) {
  return `₦${Math.round(n).toLocaleString()}`;
}

function fmtDate(d?: string | null) {
  return d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof BarChart3; tone: string }) {
  return (
    <div className="rounded-2xl border border-customBlack-100 bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-xl font-black tracking-tight text-customBlack-900">{value}</p>
    </div>
  );
}

async function fetchCommissions(
  page: number,
  limit: number,
  status: string,
  level: string,
): Promise<AdminCommissionListResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) qs.set("status", status);
  if (level) qs.set("level", level);
  const res = await dashboardFetch(`/api/commissions?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch commissions");
  return res.json();
}

function CommissionRow({
  commission,
  selected,
  onToggleSelect,
  onMarkPaid,
}: {
  commission: AdminCommission;
  selected: boolean;
  onToggleSelect: () => void;
  onMarkPaid: () => void;
}) {
  const [open, setOpen] = useState(false);
  const realtor = typeof commission.realtorId === "object" ? commission.realtorId : null;

  return (
    <>
      <tr className="hover:bg-customPurple-50/30">
        <td className="px-4 py-3.5">
          {commission.status === "approved" && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              className="h-4 w-4 rounded border-gray-300 accent-customPurple-600"
              aria-label={`Select commission ${commission._id}`}
            />
          )}
        </td>
        <td className="cursor-pointer px-4 py-3.5" onClick={() => setOpen((o) => !o)}>
          <p className="text-sm font-semibold text-customBlack-900">{commission.realtorName}</p>
          <p className="text-xs text-customBlack-400">{commission.realtorEmail}</p>
        </td>
        <td className="cursor-pointer px-4 py-3.5" onClick={() => setOpen((o) => !o)}>
          <p className="text-sm text-customBlack-700">{commission.estateName || "—"}</p>
          <p className="font-mono text-[10px] text-customBlack-400">{commission.referenceNumber || "—"}</p>
        </td>
        <td className="cursor-pointer px-4 py-3.5" onClick={() => setOpen((o) => !o)}>
          <Badge tone="purple">L{commission.level}</Badge>
        </td>
        <td className="cursor-pointer px-4 py-3.5" onClick={() => setOpen((o) => !o)}>
          <p className="text-sm font-black text-customPurple-700">{naira(commission.netAmount)}</p>
          <p className="text-[10px] text-customBlack-400">{commission.percent}% of {naira(commission.saleAmount)}</p>
        </td>
        <td className="cursor-pointer px-4 py-3.5" onClick={() => setOpen((o) => !o)}>
          <Badge tone={STATUS_TONE[commission.status]}>{statusLabel(commission.status)}</Badge>
        </td>
        <td className="cursor-pointer px-4 py-3.5 text-xs text-customBlack-400" onClick={() => setOpen((o) => !o)}>
          {fmtDate(commission.createdAt)}
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-1">
            {commission.status === "approved" && (
              <Button variant="ghost" size="sm" onClick={onMarkPaid}>
                Mark Paid
              </Button>
            )}
            <button onClick={() => setOpen((o) => !o)} className="p-1.5 text-customBlack-300" aria-label="Toggle details">
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={8} className="border-b border-customBlack-50 bg-customPurple-50/20 px-6 py-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {[
                ["Level", LEVEL_LABELS[commission.level]],
                ["Gross Commission", naira(commission.grossAmount)],
                ["WHT Deducted", naira(commission.whtAmount)],
                ["Net Payable", naira(commission.netAmount)],
                ["Clawback Window", commission.finalAt ? `Until ${fmtDate(commission.finalAt)}` : "—"],
                ["Paid On", commission.paidAt ? fmtDate(commission.paidAt) : "Not yet paid"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">{label}</p>
                  <p className="text-sm font-bold text-customBlack-900">{value}</p>
                </div>
              ))}
            </div>
            {realtor && (realtor.bank || realtor.accountNumber) && (
              <div className="mt-4 border-t border-customPurple-100 pt-4">
                <p className="mb-2 text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">Payout Account</p>
                <p className="text-sm text-customBlack-700">
                  {realtor.bank || "—"} · {realtor.accountName || "—"} · {realtor.accountNumber || "—"}
                </p>
              </div>
            )}
            {commission.paymentRef && (
              <p className="mt-2 text-xs text-customBlack-400">
                Payment ref: <span className="font-mono">{commission.paymentRef}</span>
                {commission.paidBy ? ` · marked paid by ${commission.paidBy}` : ""}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function LedgerSection({ initial, pageSize }: { initial: AdminCommissionListResponse | null; pageSize: number }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<CommissionStatus | "">("");
  const [level, setLevel] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [payTarget, setPayTarget] = useState<string[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ["commissions", page, status, level],
    queryFn: () => fetchCommissions(page, pageSize, status, level),
    initialData: page === 1 && !status && !level ? (initial ?? undefined) : undefined,
    placeholderData: keepPreviousData,
  });

  const commissions = data?.commissions ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const summary = data?.summary ?? { pendingAmount: 0, approvedAmount: 0, paidAmount: 0, clawedbackAmount: 0 };

  const selectedCommissions = commissions.filter((c) => selectedIds.includes(c._id));
  const selectedTotal = selectedCommissions.reduce((acc, c) => acc + c.netAmount, 0);
  const approvedOnPage = commissions.filter((c) => c.status === "approved");
  const allApprovedSelected = approvedOnPage.length > 0 && approvedOnPage.every((c) => selectedIds.includes(c._id));

  function toggleSelect(id: string) {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  function toggleSelectAllApproved() {
    if (allApprovedSelected) {
      setSelectedIds((ids) => ids.filter((id) => !approvedOnPage.some((c) => c._id === id)));
    } else {
      setSelectedIds((ids) => [...new Set([...ids, ...approvedOnPage.map((c) => c._id)])]);
    }
  }

  function goTo(p: number) {
    if (p < 1 || p > pages || p === page) return;
    setPage(p);
  }

  function handlePaySuccess() {
    setToast(payTarget && payTarget.length > 1 ? "Commissions marked as paid" : "Commission marked as paid");
    setSelectedIds((ids) => ids.filter((id) => !payTarget?.includes(id)));
    queryClient.invalidateQueries({ queryKey: ["commissions"] });
  }

  return (
    <div className="space-y-6">
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending" value={naira(summary.pendingAmount)} icon={Clock} tone="bg-amber-50 text-amber-600" />
        <StatCard label="Approved" value={naira(summary.approvedAmount)} icon={CheckCircle} tone="bg-green-50 text-green-600" />
        <StatCard label="Paid Out" value={naira(summary.paidAmount)} icon={Wallet} tone="bg-customPurple-50 text-customPurple-600" />
        <StatCard label="Clawed Back" value={naira(summary.clawedbackAmount)} icon={Undo2} tone="bg-red-50 text-red-600" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as CommissionStatus | "");
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {COMMISSION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </Select>
          <Select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All levels</option>
            {[1, 2, 3, 4].map((l) => (
              <option key={l} value={l}>
                Level {l}
              </option>
            ))}
          </Select>
        </div>

        {selectedIds.length > 0 && (
          <Button size="sm" onClick={() => setPayTarget(selectedIds)}>
            Pay Selected ({selectedIds.length}) — {naira(selectedTotal)}
          </Button>
        )}
      </div>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error.message}</p>}

      <TableShell>
        <thead>
          <tr className="bg-customBlack-50/50">
            <th className="px-4 py-4">
              {approvedOnPage.length > 0 && (
                <input
                  type="checkbox"
                  checked={allApprovedSelected}
                  onChange={toggleSelectAllApproved}
                  className="h-4 w-4 rounded border-gray-300 accent-customPurple-600"
                  aria-label="Select all approved commissions on this page"
                />
              )}
            </th>
            {HEADERS.slice(1).map((h) => (
              <th key={h} className="px-4 py-4 text-xs font-bold tracking-widest text-customBlack-400 uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <TableBody>
          {commissions.map((c) => (
            <CommissionRow
              key={c._id}
              commission={c}
              selected={selectedIds.includes(c._id)}
              onToggleSelect={() => toggleSelect(c._id)}
              onMarkPaid={() => setPayTarget([c._id])}
            />
          ))}
          {!isFetching && commissions.length === 0 && (
            <TableEmptyRow colSpan={8} message="No commissions match your filters." />
          )}
        </TableBody>
      </TableShell>

      <div className="flex items-center justify-between text-sm text-customBlack-500">
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

      {payTarget && (
        <MarkPaidModal
          commissionIds={payTarget}
          totalNet={commissions.filter((c) => payTarget.includes(c._id)).reduce((acc, c) => acc + c.netAmount, 0)}
          onClose={() => setPayTarget(null)}
          onSuccess={handlePaySuccess}
        />
      )}
    </div>
  );
}
