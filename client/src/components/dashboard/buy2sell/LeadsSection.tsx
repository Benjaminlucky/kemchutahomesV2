"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, Eye, X, Mail, Clock, Wallet } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";
import LeadDetailModal from "./LeadDetailModal";
import { B2S_STATUSES, statusTone, statusLabel, type Lead, type LeadListResponse } from "./types";

const HEADERS = ["Reference", "Investor", "Duration", "Principal", "Expected Payout", "Status", "Actions"];

function naira(n: number) {
  return `₦${Math.round(n || 0).toLocaleString()}`;
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
  const isEmpty = !isFetching && leads.length === 0;
  const hasFilters = !!(search || statusFilter);

  function runSearch() {
    setPage(1);
    setSearch(searchDraft.trim());
  }

  function clearFilters() {
    setPage(1);
    setSearchDraft("");
    setSearch("");
    setStatusFilter("");
  }

  function goTo(p: number) {
    if (p < 1 || p > pages || p === page) return;
    setPage(p);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              icon={Search}
              aria-label="Search investments"
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
            {B2S_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
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
        Page {page} of {pages} — <span className="font-semibold text-customBlack-700">{total}</span> investment
        {total === 1 ? "" : "s"}
      </p>

      {error && <ErrorBanner className="mb-4">{error.message}</ErrorBanner>}

      {/* ── Desktop / tablet: full table ─────────────────────────────────────── */}
      <TableShell className="hidden lg:block">
        <TableHeadRow headers={HEADERS} />
        <TableBody>
          {leads.map((lead) => (
            <tr key={lead._id} className="hover:bg-customPurple-50/30">
              <td className="px-6 py-4 font-mono text-sm font-bold text-customBlack-900">
                {lead.referenceNumber || lead._id.slice(-8).toUpperCase()}
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-customBlack-900">{lead.fullName}</p>
                <p className="text-xs break-all text-customBlack-400">{lead.email}</p>
              </td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{lead.duration}</td>
              <td className="px-6 py-4 text-sm font-bold text-customPurple-700">{naira(lead.principalAmount)}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{naira(lead.expectedPayout)}</td>
              <td className="px-6 py-4">
                <Badge tone={statusTone(lead.status)}>{statusLabel(lead.status)}</Badge>
              </td>
              <td className="px-6 py-4">
                <Button variant="ghost" size="sm" onClick={() => setSelected(lead)}>
                  <Eye size={13} />
                  View
                </Button>
              </td>
            </tr>
          ))}
          {isEmpty && <TableEmptyRow colSpan={HEADERS.length} message="No investments match your filters." />}
        </TableBody>
      </TableShell>

      {/* ── Mobile: one card per investment ─────────────────────────────────── */}
      <div className="space-y-3 lg:hidden">
        {leads.map((lead, i) => (
          <article
            key={lead._id}
            style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}
            className="animate-enter-rise overflow-hidden rounded-2xl border border-customBlack-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-customBlack-900">{lead.fullName}</p>
                <p className="mt-0.5 font-mono text-xs font-semibold text-customPurple-600">
                  {lead.referenceNumber || lead._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <Badge tone={statusTone(lead.status)}>{statusLabel(lead.status)}</Badge>
            </div>

            <dl className="mt-4 space-y-2.5">
              <CardField icon={Mail} label="Email" value={lead.email} />
              <CardField icon={Clock} label="Duration" value={lead.duration} />
              <CardField icon={Wallet} label="Expected Payout" value={naira(lead.expectedPayout)} />
            </dl>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-customBlack-50/60 px-3 py-2.5">
              <div>
                <p className="text-sm font-bold text-customPurple-700">{naira(lead.principalAmount)}</p>
                <p className="text-xs text-customBlack-400">principal</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelected(lead)}>
                <Eye size={13} />
                View
              </Button>
            </div>
          </article>
        ))}
        {isEmpty && (
          <div className="rounded-2xl border border-customBlack-100 bg-white px-6 py-16 text-center text-sm text-gray-400">
            No investments match your filters.
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

      {/* Keyed by lead id so opening a different investment always starts the
          modal's payment/payout form state fresh instead of leaking whatever
          an admin was mid-typing into the previous record. */}
      <LeadDetailModal key={selected?._id} initialLead={selected} onClose={() => setSelected(null)} />
    </div>
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
