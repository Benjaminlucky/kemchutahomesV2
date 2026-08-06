"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Search, Eye, X, Mail, Building2, Layers } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge, TONES } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";
import {
  SUBSCRIPTION_STATUSES,
  EDITABLE_STATUSES,
  statusTone,
  statusLabel,
  type Subscription,
  type SubscriptionListResponse,
  type SubscriptionStatus,
} from "./types";

const PLOT_TYPES = ["Residential", "Commercial", "Investment"];
const HEADERS = ["Reference", "Client", "Estate", "Plot Type", "Amount", "Status", "Actions"];

function naira(n: number) {
  return `₦${Math.round(n || 0).toLocaleString()}`;
}

function fullName(sub: Pick<Subscription, "title" | "firstName" | "lastName">) {
  return `${sub.title} ${sub.firstName} ${sub.lastName}`;
}

async function fetchSubscriptions(
  page: number,
  limit: number,
  status: string,
  plotType: string,
  search: string,
): Promise<SubscriptionListResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) qs.set("status", status);
  if (plotType) qs.set("plotType", plotType);
  if (search) qs.set("search", search);
  const res = await dashboardFetch(`/api/subscriptions?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch subscriptions");
  return res.json();
}

export default function SubscriptionsTable({
  initial,
  pageSize,
}: {
  initial: SubscriptionListResponse | null;
  pageSize: number;
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [plotFilter, setPlotFilter] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Subscription | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ["subscriptions", page, statusFilter, plotFilter, search],
    queryFn: () => fetchSubscriptions(page, pageSize, statusFilter, plotFilter, search),
    initialData: page === 1 && !statusFilter && !plotFilter && !search ? (initial ?? undefined) : undefined,
    placeholderData: keepPreviousData,
  });

  const subscriptions = data?.subscriptions ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const isEmpty = !isFetching && subscriptions.length === 0;

  const statusMutation = useDashboardMutation<unknown, { sub: Subscription; status: SubscriptionStatus }>({
    mutationFn: async ({ sub, status }) => {
      const res = await dashboardFetch(`/api/subscriptions/${sub._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      return data;
    },
    onSuccess: (_data, { status }) => {
      setToast(`Status updated to ${statusLabel(status)}`);
      setActionError(null);
      setRejectTarget(null);
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : "Failed to update status");
      setRejectTarget(null);
    },
  });

  function handleStatusChange(sub: Subscription, status: SubscriptionStatus) {
    setActionError(null);
    // Rejecting triggers an irreversible client email + realtor commission
    // clawback — the only editable transition with real consequences, so it
    // gets a confirmation step instead of firing immediately like Pending/
    // Confirmed do.
    if (status === "rejected") {
      setRejectTarget(sub);
      return;
    }
    statusMutation.mutate({ sub, status });
  }

  function runSearch() {
    setPage(1);
    setSearch(searchDraft.trim());
    setActionError(null);
  }

  function clearFilters() {
    setPage(1);
    setSearchDraft("");
    setSearch("");
    setStatusFilter("");
    setPlotFilter("");
    setActionError(null);
  }

  function goTo(p: number) {
    if (p < 1 || p > pages || p === page) return;
    setPage(p);
  }

  const hasFilters = !!(search || statusFilter || plotFilter);

  return (
    <div>
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              icon={Search}
              aria-label="Search subscriptions"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search by name, email, reference…"
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
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {SUBSCRIPTION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by plot type"
            value={plotFilter}
            onChange={(e) => {
              setPlotFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All plot types</option>
            {PLOT_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
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
      </div>

      <p className="mb-4 text-sm text-customBlack-500">
        Page {page} of {pages} — <span className="font-semibold text-customBlack-700">{total}</span> subscription
        {total === 1 ? "" : "s"}
      </p>

      {error && <ErrorBanner className="mb-4">{error.message}</ErrorBanner>}
      {actionError && <ErrorBanner className="mb-4">{actionError}</ErrorBanner>}

      {/* ── Desktop / tablet: full table ─────────────────────────────────────── */}
      <TableShell className="hidden lg:block">
        <TableHeadRow headers={HEADERS} />
        <TableBody>
          {subscriptions.map((sub) => (
            <tr key={sub._id} className="hover:bg-customPurple-50/30">
              <td className="px-6 py-4 font-mono text-sm font-bold text-customBlack-900">
                {sub.referenceNumber || sub._id.slice(-8).toUpperCase()}
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-customBlack-900">{fullName(sub)}</p>
                <p className="text-xs break-all text-customBlack-400">{sub.email}</p>
              </td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{sub.estateName}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{sub.plotType}</td>
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-customPurple-700">{naira(sub.totalAmount)}</p>
                <p className="text-xs text-customBlack-400">{naira(sub.amountPaid)} paid</p>
              </td>
              <td className="px-6 py-4">
                <StatusControl sub={sub} busy={statusMutation.isPending} onChange={handleStatusChange} />
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/dashboard/subscriptions/${sub._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-customPurple-600 hover:underline"
                >
                  <Eye size={13} />
                  View
                </Link>
              </td>
            </tr>
          ))}
          {isEmpty && <TableEmptyRow colSpan={HEADERS.length} message="No subscriptions match your filters." />}
        </TableBody>
      </TableShell>

      {/* ── Mobile: one card per subscription ───────────────────────────────── */}
      <div className="space-y-3 lg:hidden">
        {subscriptions.map((sub, i) => (
          <article
            key={sub._id}
            style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}
            className="animate-enter-rise overflow-hidden rounded-2xl border border-customBlack-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-customBlack-900">{fullName(sub)}</p>
                <p className="mt-0.5 font-mono text-xs font-semibold text-customPurple-600">
                  {sub.referenceNumber || sub._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <StatusControl sub={sub} busy={statusMutation.isPending} onChange={handleStatusChange} />
            </div>

            <dl className="mt-4 space-y-2.5">
              <CardField icon={Mail} label="Email" value={sub.email} />
              <CardField icon={Building2} label="Estate" value={sub.estateName} />
              <CardField icon={Layers} label="Plot Type" value={sub.plotType} />
            </dl>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-customBlack-50/60 px-3 py-2.5">
              <div>
                <p className="text-sm font-bold text-customPurple-700">{naira(sub.totalAmount)}</p>
                <p className="text-xs text-customBlack-400">{naira(sub.amountPaid)} paid</p>
              </div>
              <Link
                href={`/dashboard/subscriptions/${sub._id}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-customPurple-600 shadow-sm hover:underline"
              >
                <Eye size={13} />
                View
              </Link>
            </div>
          </article>
        ))}
        {isEmpty && (
          <div className="rounded-2xl border border-customBlack-100 bg-white px-6 py-16 text-center text-sm text-gray-400">
            No subscriptions match your filters.
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-customBlack-500">
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

      <ConfirmDialog
        open={!!rejectTarget}
        onCancel={() => setRejectTarget(null)}
        onConfirm={() => rejectTarget && statusMutation.mutate({ sub: rejectTarget, status: "rejected" })}
        title="Reject Subscription?"
        description={
          <>
            Rejecting <span className="font-semibold text-gray-800">{rejectTarget && fullName(rejectTarget)}</span>
            &rsquo;s subscription sends them a rejection email immediately
            {rejectTarget?.amountPaid ? " and claws back any realtor commission already calculated" : ""}. This
            cannot be undone.
          </>
        }
        confirmLabel="Reject Subscription"
        loading={statusMutation.isPending}
      />
    </div>
  );
}

// The dropdown only ever offers the statuses an admin can legitimately set
// (see EDITABLE_STATUSES). Once a subscription has moved past that phase —
// a payment came in, an instalment was confirmed, a plot was allocated — the
// status can only change via those dedicated flows, so it's rendered here as
// a plain badge instead of a control that would silently reject every edit.
function StatusControl({
  sub,
  busy,
  onChange,
}: {
  sub: Subscription;
  busy: boolean;
  onChange: (sub: Subscription, status: SubscriptionStatus) => void;
}) {
  if (!EDITABLE_STATUSES.includes(sub.status)) {
    return (
      <span title="Set automatically by the payment or allocation workflow">
        <Badge tone={statusTone(sub.status)}>{statusLabel(sub.status)}</Badge>
      </span>
    );
  }

  return (
    <select
      value={sub.status}
      disabled={busy}
      aria-label={`Status for ${sub.firstName} ${sub.lastName}`}
      onChange={(e) => onChange(sub, e.target.value as SubscriptionStatus)}
      className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold disabled:opacity-50 ${TONES[statusTone(sub.status)]}`}
    >
      {EDITABLE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabel(s)}
        </option>
      ))}
    </select>
  );
}

function CardField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} className="mt-0.5 shrink-0 text-customBlack-300" />
      <dt className="sr-only">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm break-all text-customBlack-600">{value || "-"}</dd>
    </div>
  );
}
