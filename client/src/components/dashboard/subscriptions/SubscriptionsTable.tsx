"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Search, Eye } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TONES } from "@/components/ui/Badge";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";
import {
  SUBSCRIPTION_STATUSES,
  STATUS_TONE,
  statusLabel,
  type Subscription,
  type SubscriptionListResponse,
  type SubscriptionStatus,
} from "./types";

const PLOT_TYPES = ["Residential", "Commercial", "Investment"];
const HEADERS = ["Reference", "Client", "Estate", "Plot Type", "Amount", "Status", ""];

function naira(n: number) {
  return `₦${Math.round(n).toLocaleString()}`;
}

async function fetchSubscriptions(page: number, limit: number, status: string, plotType: string, search: string): Promise<SubscriptionListResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) qs.set("status", status);
  if (plotType) qs.set("plotType", plotType);
  if (search) qs.set("search", search);
  const res = await dashboardFetch(`/api/subscriptions?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch subscriptions");
  return res.json();
}

export default function SubscriptionsTable({ initial, pageSize }: { initial: SubscriptionListResponse | null; pageSize: number }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [plotFilter, setPlotFilter] = useState("");

  const { data, isFetching, error } = useQuery({
    queryKey: ["subscriptions", page, statusFilter, plotFilter, search],
    queryFn: () => fetchSubscriptions(page, pageSize, statusFilter, plotFilter, search),
    initialData: page === 1 && !statusFilter && !plotFilter && !search ? (initial ?? undefined) : undefined,
    placeholderData: keepPreviousData,
  });

  const subscriptions = data?.subscriptions ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
  });

  function runSearch() {
    setPage(1);
    setSearch(searchDraft.trim());
  }

  function goTo(p: number) {
    if (p < 1 || p > pages || p === page) return;
    setPage(p);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex-1 sm:max-w-xs">
            <Input
              icon={Search}
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search by name, email, reference…"
            />
          </div>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {SUBSCRIPTION_STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </Select>
          <Select value={plotFilter} onChange={(e) => { setPlotFilter(e.target.value); setPage(1); }}>
            <option value="">All plot types</option>
            {PLOT_TYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <Button size="sm" onClick={runSearch}>Search</Button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error.message}</p>}

      <TableShell>
        <TableHeadRow headers={HEADERS} />
        <TableBody>
          {subscriptions.map((sub) => (
            <tr key={sub._id} className="hover:bg-customPurple-50/30">
              <td className="px-6 py-4 text-sm font-bold text-customBlack-900">
                {sub.referenceNumber || sub._id.slice(-8).toUpperCase()}
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-customBlack-900">{sub.title} {sub.firstName} {sub.lastName}</p>
                <p className="text-xs text-customBlack-400">{sub.email}</p>
              </td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{sub.estateName}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{sub.plotType}</td>
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-customPurple-700">{naira(sub.totalAmount)}</p>
                <p className="text-xs text-customBlack-400">{naira(sub.amountPaid)} paid</p>
              </td>
              <td className="px-6 py-4">
                <select
                  value={sub.status}
                  disabled={statusMutation.isPending && statusMutation.variables?.sub._id === sub._id}
                  onChange={(e) => statusMutation.mutate({ sub, status: e.target.value as SubscriptionStatus })}
                  className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold disabled:opacity-50 ${TONES[STATUS_TONE[sub.status]]}`}
                >
                  {SUBSCRIPTION_STATUSES.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4">
                <Link href={`/dashboard/subscriptions/${sub._id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-customPurple-600 hover:underline">
                  <Eye size={13} />
                  View
                </Link>
              </td>
            </tr>
          ))}
          {!isFetching && subscriptions.length === 0 && <TableEmptyRow colSpan={7} message="No subscriptions match your filters." />}
        </TableBody>
      </TableShell>

      <div className="mt-4 flex items-center justify-between text-sm text-customBlack-500">
        <span>Page {page} of {pages} — {total} total</span>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => goTo(page - 1)} disabled={page <= 1 || isFetching}>Prev</Button>
          <Button variant="secondary" size="sm" onClick={() => goTo(page + 1)} disabled={page >= pages || isFetching}>Next</Button>
        </div>
      </div>
    </div>
  );
}
