"use client";

import { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  BarChart3,
  Clock,
  CheckCircle,
  Wallet,
  Undo2,
  Receipt,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TableShell, TableBody, TableEmptyRow } from "@/components/ui/Table";
import MarkPaidModal from "./MarkPaidModal";
import {
  COMMISSION_STATUSES,
  SOURCE_TYPES,
  statusTone,
  statusLabel,
  sourceLabel,
  naira,
  fmtDate,
  LEVEL_LABELS,
  type AdminCommission,
  type AdminCommissionListResponse,
  type CommissionStatus,
  type SourceType,
} from "./types";

const HEADERS = ["", "Realtor", "Sale", "Level", "Commission", "Status", "Date", "Actions"];

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof BarChart3; tone: string }) {
  return (
    <div className="rounded-2xl border border-customBlack-100 bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">{label}</p>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-lg font-black tracking-tight break-all text-customBlack-900">{value}</p>
    </div>
  );
}

async function fetchCommissions(
  page: number,
  limit: number,
  status: string,
  level: string,
  sourceType: string,
  search: string,
): Promise<AdminCommissionListResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) qs.set("status", status);
  if (level) qs.set("level", level);
  if (sourceType) qs.set("sourceType", sourceType);
  if (search) qs.set("search", search);
  const res = await dashboardFetch(`/api/commissions?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch commissions");
  return res.json();
}

function DetailGrid({ commission }: { commission: AdminCommission }) {
  return (
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
          <p className="text-sm font-bold break-words text-customBlack-900">{value}</p>
        </div>
      ))}
    </div>
  );
}

function CommissionRow({
  commission,
  selected,
  onToggleSelect,
  onMarkPaid,
  onClawback,
}: {
  commission: AdminCommission;
  selected: boolean;
  onToggleSelect: () => void;
  onMarkPaid: () => void;
  onClawback: () => void;
}) {
  const [open, setOpen] = useState(false);
  const realtor = typeof commission.realtorId === "object" ? commission.realtorId : null;
  const canClawback = commission.status === "pending" || commission.status === "approved";

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
              aria-label={`Select commission for ${commission.realtorName}`}
            />
          )}
        </td>
        <td className="cursor-pointer px-4 py-3.5" onClick={() => setOpen((o) => !o)}>
          <p className="truncate text-sm font-semibold text-customBlack-900">{commission.realtorName}</p>
          <p className="truncate text-xs text-customBlack-400">{commission.realtorEmail}</p>
        </td>
        <td className="cursor-pointer px-4 py-3.5" onClick={() => setOpen((o) => !o)}>
          <Badge tone={commission.sourceType === "buy2sell" ? "purple" : "gray"} className="mb-1">
            {sourceLabel(commission.sourceType)}
          </Badge>
          <p className="truncate text-sm text-customBlack-700">{commission.saleLabel || commission.estateName || "—"}</p>
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
          <Badge tone={statusTone(commission.status)}>{statusLabel(commission.status)}</Badge>
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
            {canClawback && (
              <Button variant="danger" size="sm" onClick={onClawback}>
                Claw Back
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
            <DetailGrid commission={commission} />
            {realtor && (realtor.bank || realtor.accountNumber) && (
              <div className="mt-4 border-t border-customPurple-100 pt-4">
                <p className="mb-2 text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">Payout Account</p>
                <p className="text-sm break-words text-customBlack-700">
                  {realtor.bank || "—"} · {realtor.accountName || "—"} · {realtor.accountNumber || "—"}
                </p>
              </div>
            )}
            {commission.paymentRef && (
              <p className="mt-2 text-xs text-customBlack-400">
                Payment ref: <span className="font-mono break-all">{commission.paymentRef}</span>
                {commission.paidBy ? ` · marked paid by ${commission.paidBy}` : ""}
              </p>
            )}
            {commission.status === "clawedback" && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
                <p className="text-xs font-bold text-red-600">
                  Clawed back {commission.clawbackAt ? `on ${fmtDate(commission.clawbackAt)}` : ""}
                </p>
                {commission.clawbackReason && <p className="mt-0.5 text-xs text-red-500">{commission.clawbackReason}</p>}
              </div>
            )}
            {commission.notes && !commission.notes.startsWith("Clawed back by") && (
              <p className="mt-2 text-xs text-customBlack-400">Note: {commission.notes}</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function CommissionCard({
  commission,
  onMarkPaid,
  onClawback,
}: {
  commission: AdminCommission;
  onMarkPaid: () => void;
  onClawback: () => void;
}) {
  const [open, setOpen] = useState(false);
  const canClawback = commission.status === "pending" || commission.status === "approved";

  return (
    <article className="overflow-hidden rounded-2xl border border-customBlack-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-customBlack-900">{commission.realtorName}</p>
          <p className="truncate text-xs text-customBlack-400">{commission.realtorEmail}</p>
        </div>
        <Badge tone={statusTone(commission.status)}>{statusLabel(commission.status)}</Badge>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Badge tone={commission.sourceType === "buy2sell" ? "purple" : "gray"}>{sourceLabel(commission.sourceType)}</Badge>
        <Badge tone="purple">L{commission.level}</Badge>
        <span className="truncate font-mono text-[10px] text-customBlack-400">{commission.referenceNumber || "—"}</span>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-customBlack-50/60 px-3 py-2.5">
        <div>
          <p className="text-sm font-black text-customPurple-700">{naira(commission.netAmount)}</p>
          <p className="text-[10px] text-customBlack-400">{commission.percent}% of {naira(commission.saleAmount)}</p>
        </div>
        <span className="text-xs text-customBlack-400">{fmtDate(commission.createdAt)}</span>
      </div>

      {open && (
        <div className="mt-3 border-t border-customBlack-50 pt-3">
          <DetailGrid commission={commission} />
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-customBlack-50 pt-3">
        <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Details
        </Button>
        {commission.status === "approved" ? (
          <Button variant="ghost" size="sm" onClick={onMarkPaid}>
            Mark Paid
          </Button>
        ) : (
          <span />
        )}
        {canClawback ? (
          <Button variant="danger" size="sm" onClick={onClawback}>
            Claw Back
          </Button>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}

export default function LedgerSection({ initial, pageSize }: { initial: AdminCommissionListResponse | null; pageSize: number }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<CommissionStatus | "">("");
  const [level, setLevel] = useState("");
  const [sourceType, setSourceType] = useState<SourceType | "">("");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [payTarget, setPayTarget] = useState<string[] | null>(null);
  const [clawbackTarget, setClawbackTarget] = useState<AdminCommission | null>(null);
  const [clawbackReason, setClawbackReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ["commissions", page, status, level, sourceType, search],
    queryFn: () => fetchCommissions(page, pageSize, status, level, sourceType, search),
    initialData: page === 1 && !status && !level && !sourceType && !search ? (initial ?? undefined) : undefined,
    placeholderData: keepPreviousData,
  });

  const commissions = data?.commissions ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const isEmpty = !isFetching && commissions.length === 0;
  const summary = data?.summary ?? { pendingAmount: 0, approvedAmount: 0, paidAmount: 0, clawedbackAmount: 0, whtAmount: 0 };
  const hasFilters = !!(search || status || level || sourceType);

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

  // Selection is scoped to netAmount values from the currently-loaded page —
  // once the page or any filter changes, those rows (and their totals) are no
  // longer what's on screen, so a stale selection previously let "Pay
  // Selected (N) — ₦X" show a count from one page and an amount from another.
  // Clearing on any of these changes keeps the button/confirm-dialog total
  // always equal to what the server will actually pay.
  function resetSelection() {
    setSelectedIds([]);
    setActionError(null);
  }

  function goTo(p: number) {
    if (p < 1 || p > pages || p === page) return;
    setPage(p);
    resetSelection();
  }

  function runSearch() {
    setPage(1);
    setSearch(searchDraft.trim());
    resetSelection();
  }

  function clearFilters() {
    setPage(1);
    setSearchDraft("");
    setSearch("");
    setStatus("");
    setLevel("");
    setSourceType("");
    resetSelection();
  }

  function handlePaySuccess(message?: string) {
    setToast(message || (payTarget && payTarget.length > 1 ? "Commissions marked as paid" : "Commission marked as paid"));
    setSelectedIds((ids) => ids.filter((id) => !payTarget?.includes(id)));
    setActionError(null);
    queryClient.invalidateQueries({ queryKey: ["commissions"] });
  }

  const clawbackMutation = useDashboardMutation<unknown, { id: string; reason: string }>({
    mutationFn: async ({ id, reason }) => {
      const res = await dashboardFetch(`/api/commissions/${id}/clawback`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || "Failed to claw back commission");
      return responseData;
    },
    onSuccess: () => {
      setToast("Commission clawed back");
      setClawbackTarget(null);
      setClawbackReason("");
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : "Failed to claw back commission");
      setClawbackTarget(null);
    },
  });

  return (
    <div className="space-y-6">
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Pending" value={naira(summary.pendingAmount)} icon={Clock} tone="bg-amber-50 text-amber-600" />
        <StatCard label="Approved" value={naira(summary.approvedAmount)} icon={CheckCircle} tone="bg-green-50 text-green-600" />
        <StatCard label="Paid Out" value={naira(summary.paidAmount)} icon={Wallet} tone="bg-customPurple-50 text-customPurple-600" />
        <StatCard label="Clawed Back" value={naira(summary.clawedbackAmount)} icon={Undo2} tone="bg-red-50 text-red-600" />
        <StatCard label="WHT Withheld" value={naira(summary.whtAmount)} icon={Receipt} tone="bg-blue-50 text-blue-600" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              icon={Search}
              aria-label="Search by realtor or reference"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search realtor, email, reference…"
              className={searchDraft ? "pr-9" : undefined}
            />
            {searchDraft && (
              <button
                type="button"
                onClick={() => setSearchDraft("")}
                aria-label="Clear search text"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Select
            aria-label="Filter by product"
            value={sourceType}
            onChange={(e) => {
              setSourceType(e.target.value as SourceType | "");
              setPage(1);
              resetSelection();
            }}
          >
            <option value="">All products</option>
            {SOURCE_TYPES.map((s) => (
              <option key={s} value={s}>
                {sourceLabel(s)}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as CommissionStatus | "");
              setPage(1);
              resetSelection();
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
            aria-label="Filter by level"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(1);
              resetSelection();
            }}
          >
            <option value="">All levels</option>
            {[1, 2, 3, 4].map((l) => (
              <option key={l} value={l}>
                Level {l}
              </option>
            ))}
          </Select>
          <Button size="sm" onClick={runSearch}>
            Search
          </Button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full bg-customPurple-50/60 px-2.5 py-1 text-xs font-semibold text-customPurple-700 transition-colors hover:bg-customPurple-50"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        {selectedIds.length > 0 && (
          <Button size="sm" onClick={() => setPayTarget(selectedIds)}>
            Pay Selected ({selectedIds.length}) — {naira(selectedTotal)}
          </Button>
        )}
      </div>

      <p className="text-sm text-customBlack-500">
        Page {page} of {pages} — <span className="font-semibold text-customBlack-700">{total}</span> commission
        {total === 1 ? "" : "s"}
      </p>

      {error && <ErrorBanner>{error.message}</ErrorBanner>}
      {actionError && <ErrorBanner>{actionError}</ErrorBanner>}

      {/* ── Desktop / tablet: full table ─────────────────────────────────────── */}
      <TableShell className="hidden lg:block">
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
              onClawback={() => setClawbackTarget(c)}
            />
          ))}
          {isEmpty && <TableEmptyRow colSpan={8} message="No commissions match your filters." />}
        </TableBody>
      </TableShell>

      {/* ── Mobile: one card per commission ─────────────────────────────────── */}
      <div className="space-y-3 lg:hidden">
        {commissions.map((c) => (
          <CommissionCard
            key={c._id}
            commission={c}
            onMarkPaid={() => setPayTarget([c._id])}
            onClawback={() => setClawbackTarget(c)}
          />
        ))}
        {isEmpty && (
          <div className="rounded-2xl border border-customBlack-100 bg-white px-6 py-16 text-center text-sm text-gray-400">
            No commissions match your filters.
          </div>
        )}
      </div>

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
          key={payTarget.join(",")}
          commissionIds={payTarget}
          totalNet={commissions.filter((c) => payTarget.includes(c._id)).reduce((acc, c) => acc + c.netAmount, 0)}
          onClose={() => setPayTarget(null)}
          onSuccess={handlePaySuccess}
        />
      )}

      <ConfirmDialog
        open={!!clawbackTarget}
        onCancel={() => {
          setClawbackTarget(null);
          setClawbackReason("");
        }}
        onConfirm={() => clawbackTarget && clawbackMutation.mutate({ id: clawbackTarget._id, reason: clawbackReason })}
        title="Claw Back Commission?"
        description={
          <div className="text-left">
            <p>
              Reverses <span className="font-semibold text-gray-800">{naira(clawbackTarget?.netAmount ?? 0)}</span> owed
              to <span className="font-semibold text-gray-800">{clawbackTarget?.realtorName}</span>. This cannot be
              undone.
            </p>
            <textarea
              value={clawbackReason}
              onChange={(e) => setClawbackReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={2}
              className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-customPurple-500"
            />
          </div>
        }
        confirmLabel="Claw Back"
        icon={Undo2}
        loading={clawbackMutation.isPending}
      />
    </div>
  );
}
