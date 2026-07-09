"use client";

import { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Search, Eye } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TONES } from "@/components/ui/Badge";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";
import LeadDetailModal from "./LeadDetailModal";
import { B2S_STATUSES, STATUS_TONE, statusLabel, type Lead, type LeadListResponse, type B2SStatus } from "./types";

const HEADERS = ["Reference", "Investor", "Duration", "Principal", "Expected Payout", "Status", ""];

function naira(n: number) {
  return `₦${Math.round(n).toLocaleString()}`;
}

async function fetchLeads(page: number, limit: number, status: string, search: string): Promise<LeadListResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) qs.set("status", status);
  if (search) qs.set("search", search);
  const res = await dashboardFetch(`/api/buy2sell/leads?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch investments");
  return res.json();
}

export default function LeadsSection({ initial, pageSize }: { initial: LeadListResponse | null; pageSize: number }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ["buy2sell-leads", page, statusFilter, search],
    queryFn: () => fetchLeads(page, pageSize, statusFilter, search),
    initialData: page === 1 && !statusFilter && !search ? (initial ?? undefined) : undefined,
    placeholderData: keepPreviousData,
  });

  const leads = data?.leads ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const statusMutation = useDashboardMutation<unknown, { lead: Lead; status: B2SStatus }>({
    mutationFn: async ({ lead, status }) => {
      const res = await dashboardFetch(`/api/buy2sell/leads/${lead._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["buy2sell-leads"] }),
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
            {B2S_STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </Select>
          <Button size="sm" onClick={runSearch}>Search</Button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error.message}</p>}

      <TableShell>
        <TableHeadRow headers={HEADERS} />
        <TableBody>
          {leads.map((lead) => (
            <tr key={lead._id} className="hover:bg-customPurple-50/30">
              <td className="px-6 py-4 text-sm font-bold text-customBlack-900">{lead.referenceNumber || lead._id.slice(-8).toUpperCase()}</td>
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-customBlack-900">{lead.fullName}</p>
                <p className="text-xs text-customBlack-400">{lead.email}</p>
              </td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{lead.duration}</td>
              <td className="px-6 py-4 text-sm font-bold text-customPurple-700">{naira(lead.principalAmount)}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{naira(lead.expectedPayout)}</td>
              <td className="px-6 py-4">
                <select
                  value={lead.status}
                  disabled={statusMutation.isPending && statusMutation.variables?.lead._id === lead._id}
                  onChange={(e) => statusMutation.mutate({ lead, status: e.target.value as B2SStatus })}
                  className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold disabled:opacity-50 ${TONES[STATUS_TONE[lead.status]]}`}
                >
                  {B2S_STATUSES.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4">
                <Button variant="ghost" size="sm" onClick={() => setSelected(lead)}>
                  <Eye size={13} />
                  View
                </Button>
              </td>
            </tr>
          ))}
          {!isFetching && leads.length === 0 && <TableEmptyRow colSpan={7} message="No investments match your filters." />}
        </TableBody>
      </TableShell>

      <div className="mt-4 flex items-center justify-between text-sm text-customBlack-500">
        <span>Page {page} of {pages} — {total} total</span>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => goTo(page - 1)} disabled={page <= 1 || isFetching}>Prev</Button>
          <Button variant="secondary" size="sm" onClick={() => goTo(page + 1)} disabled={page >= pages || isFetching}>Next</Button>
        </div>
      </div>

      <LeadDetailModal initialLead={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
