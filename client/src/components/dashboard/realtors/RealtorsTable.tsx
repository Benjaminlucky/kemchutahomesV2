"use client";

import { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  Eye,
  Edit2,
  Trash2,
  Download,
  Copy,
  ExternalLink,
  Search,
  X,
  Mail,
  Phone as PhoneIcon,
  Landmark,
  Hash,
} from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Avatar } from "@/components/ui/Avatar";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import type { Realtor, RealtorListResponse, RealtorUpdateInput } from "./types";

const HEADERS = ["Realtor", "Referral Code", "Email", "Phone", "Bank", "Account No.", "Actions"];

// Singular/plural so the toast reads "1 email copied", not "1 emails copied".
const EXPORT_LABELS = {
  email: { one: "email", many: "emails" },
  phone: { one: "phone number", many: "phone numbers" },
} as const;

type ExportField = keyof typeof EXPORT_LABELS;

function fullName(realtor: Pick<Realtor, "firstName" | "lastName" | "name">) {
  return [realtor.firstName, realtor.lastName].filter(Boolean).join(" ").trim() || realtor.name || "-";
}

function referralLink(referralCode: string) {
  return `https://kemchutahomesltd.com/signup?ref=${referralCode}`;
}

async function fetchRealtors(page: number, limit: number, search: string): Promise<RealtorListResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit), search });
  const res = await dashboardFetch(`/api/realtors?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch realtors");
  return res.json();
}

async function fetchRealtorById(id: string): Promise<Realtor> {
  const res = await dashboardFetch(`/api/realtors/${id}`);
  if (!res.ok) throw new Error("Failed to fetch realtor details");
  return res.json();
}

export default function RealtorsTable({
  initial,
  pageSize,
}: {
  initial: RealtorListResponse | null;
  pageSize: number;
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [viewRealtor, setViewRealtor] = useState<Realtor | null>(null);
  const [editRealtor, setEditRealtor] = useState<Realtor | null>(null);
  const [editForm, setEditForm] = useState<RealtorUpdateInput | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Realtor | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportField | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ["realtors", page, search],
    queryFn: () => fetchRealtors(page, pageSize, search),
    initialData: page === 1 && search === "" ? (initial ?? undefined) : undefined,
    placeholderData: keepPreviousData,
  });

  const realtors = data?.docs ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const isEmpty = !isFetching && realtors.length === 0;

  function goTo(p: number) {
    if (p < 1 || p > pages || p === page) return;
    setPage(p);
  }

  // actionError is reset alongside the filter: an "export failed" / "no
  // emails for this search" banner describes the *previous* result set, so
  // leaving it up next to different rows is actively misleading.
  function runSearch() {
    setPage(1);
    setSearch(searchDraft.trim());
    setActionError(null);
  }

  function clearSearch() {
    setPage(1);
    setSearchDraft("");
    setSearch("");
    setActionError(null);
  }

  async function openView(id: string) {
    setActionError(null);
    try {
      setViewRealtor(await fetchRealtorById(id));
    } catch {
      setActionError("Failed to fetch realtor details");
    }
  }

  async function openEdit(id: string) {
    setActionError(null);
    try {
      const realtor = await fetchRealtorById(id);
      setEditRealtor(realtor);
      setEditForm({
        firstName: realtor.firstName,
        lastName: realtor.lastName,
        email: realtor.email,
        phone: realtor.phone ?? "",
        state: realtor.state ?? "",
        bank: realtor.bank ?? "",
        accountName: realtor.accountName ?? "",
        accountNumber: realtor.accountNumber ?? "",
      });
    } catch {
      setActionError("Failed to fetch realtor details");
    }
  }

  async function copyReferralLink(link: string) {
    setActionError(null);
    if (!(await copyToClipboard(link))) {
      setActionError("The browser blocked clipboard access. Check the page has focus and try again.");
      return;
    }
    setToast("Referral link copied to clipboard!");
  }

  const editMutation = useDashboardMutation<unknown, { id: string; body: RealtorUpdateInput }>({
    mutationFn: async ({ id, body }) => {
      const res = await dashboardFetch(`/api/realtors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      return data;
    },
    onSuccess: () => {
      setToast("Realtor updated successfully");
      setEditRealtor(null);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["realtors"] });
    },
  });

  const deleteMutation = useDashboardMutation<unknown, Realtor>({
    mutationFn: async (realtor) => {
      const res = await dashboardFetch(`/api/realtors/${realtor._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");
      return data;
    },
    onSuccess: () => {
      setToast("Realtor deleted successfully");
      setDeleteTarget(null);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["realtors"] });
    },
  });

  // Exports every realtor matching the *current search*, not the page on
  // screen: this used to read the paginated `realtors` array, so an admin with
  // 200 realtors clicked "Export Emails" and silently got 10. The count in the
  // toast is the server's, so it can never over-report what reached the
  // clipboard (blank/missing values are dropped server-side).
  async function exportField(field: ExportField) {
    setExporting(field);
    setActionError(null);
    try {
      const qs = new URLSearchParams({ field, search });
      const res = await dashboardFetch(`/api/realtors/export?${qs}`);
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Failed to export");

      const labels = EXPORT_LABELS[field];
      if (!payload.total) {
        setActionError(
          search
            ? `No ${labels.many} to export for “${search}”.`
            : `No ${labels.many} to export.`,
        );
        return;
      }

      const copied = await copyToClipboard(payload.values.join(", "));
      if (!copied) {
        setActionError(
          `Found ${payload.total} ${payload.total === 1 ? labels.one : labels.many}, but the browser blocked clipboard access. Check the page has focus and try again.`,
        );
        return;
      }
      setToast(
        `${payload.total} ${payload.total === 1 ? labels.one : labels.many} copied to clipboard!`,
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to export");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div>
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              icon={Search}
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search by name, email, referral code…"
              className={searchDraft ? "pr-9" : undefined}
            />
            {(searchDraft || search) && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button size="sm" onClick={runSearch}>
            Search
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 sm:flex-initial"
            loading={exporting === "email"}
            disabled={!!exporting}
            onClick={() => exportField("email")}
          >
            <Download size={14} />
            Export Emails
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 sm:flex-initial"
            loading={exporting === "phone"}
            disabled={!!exporting}
            onClick={() => exportField("phone")}
          >
            <Download size={14} />
            Export Phones
          </Button>
        </div>
      </div>

      {search && (
        <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-customBlack-500">
          <span>
            Showing results for <span className="font-semibold text-customBlack-700">“{search}”</span>
          </span>
          <button
            type="button"
            onClick={clearSearch}
            className="inline-flex items-center gap-1 rounded-full bg-customPurple-50/60 px-2.5 py-1 text-xs font-semibold text-customPurple-700 transition-colors hover:bg-customPurple-50"
          >
            <X size={12} />
            Clear
          </button>
        </p>
      )}

      {error && <ErrorBanner className="mb-4">{error.message}</ErrorBanner>}
      {actionError && <ErrorBanner className="mb-4">{actionError}</ErrorBanner>}

      {/* ── Desktop / tablet: the full 7-column table ───────────────────── */}
      <TableShell className="hidden md:block">
        <TableHeadRow headers={HEADERS} />
        <TableBody>
          {realtors.map((r) => (
            <tr key={r._id} className="hover:bg-customPurple-50/30">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    firstName={r.firstName}
                    lastName={r.lastName}
                    avatar={r.avatar}
                    size={40}
                  />
                  <span className="text-sm font-semibold text-customBlack-900">{fullName(r)}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-customBlack-900">{r.referralCode || "-"}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{r.email || "-"}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{r.phone || "-"}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{r.bank || "-"}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{r.accountNumber || "-"}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" aria-label="View" onClick={() => openView(r._id)}>
                    <Eye size={15} />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(r._id)}>
                    <Edit2 size={15} />
                  </Button>
                  <Button variant="danger" size="icon" aria-label="Delete" onClick={() => setDeleteTarget(r)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {isEmpty && <TableEmptyRow colSpan={HEADERS.length} message="No realtors found." />}
        </TableBody>
      </TableShell>

      {/* ── Mobile: one card per realtor ────────────────────────────────────
          The table has seven columns; below `md` that's a horizontal-scroll
          trap where the actions column — the whole point of the screen — sits
          off-canvas. Cards keep every field and every action reachable
          without the page itself ever scrolling sideways. */}
      <div className="space-y-3 md:hidden">
        {realtors.map((r, i) => (
          <article
            key={r._id}
            // Staggered, but capped: past ~6 cards the delay stops growing so a
            // full page never feels like it's loading in slowly.
            style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}
            className="animate-enter-rise overflow-hidden rounded-2xl border border-customBlack-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Avatar firstName={r.firstName} lastName={r.lastName} avatar={r.avatar} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-customBlack-900">{fullName(r)}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-customPurple-600">
                  <Hash size={11} className="shrink-0" />
                  <span className="truncate font-mono">{r.referralCode || "-"}</span>
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-2.5">
              <CardField icon={Mail} label="Email" value={r.email} />
              <CardField icon={PhoneIcon} label="Phone" value={r.phone} />
              <CardField
                icon={Landmark}
                label="Bank"
                value={[r.bank, r.accountNumber].filter(Boolean).join(" • ")}
              />
            </dl>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-customBlack-50 pt-3">
              <Button variant="ghost" size="sm" onClick={() => openView(r._id)}>
                <Eye size={14} />
                View
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEdit(r._id)}>
                <Edit2 size={14} />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteTarget(r)}>
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          </article>
        ))}
        {isEmpty && (
          <div className="rounded-2xl border border-customBlack-100 bg-white px-6 py-16 text-center text-sm text-gray-400">
            No realtors found.
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

      <Modal open={!!viewRealtor} onClose={() => setViewRealtor(null)} title="Realtor Details">
        {viewRealtor && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Avatar
                firstName={viewRealtor.firstName}
                lastName={viewRealtor.lastName}
                avatar={viewRealtor.avatar}
                size={128}
                className="border-4 border-customPurple-200 shadow-lg"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem label="First Name" value={viewRealtor.firstName} />
              <DetailItem label="Last Name" value={viewRealtor.lastName} />
              <DetailItem label="Email" value={viewRealtor.email} />
              <DetailItem label="Phone" value={viewRealtor.phone} />
              <DetailItem
                label="Birth Date"
                value={viewRealtor.birthDate ? new Date(viewRealtor.birthDate).toLocaleDateString() : undefined}
              />
              <DetailItem label="State" value={viewRealtor.state} />
              <DetailItem label="Bank" value={viewRealtor.bank} />
              <DetailItem label="Account Name" value={viewRealtor.accountName} />
              <DetailItem label="Account Number" value={viewRealtor.accountNumber} />
              <DetailItem label="Referral Code" value={viewRealtor.referralCode} />
              <DetailItem label="Recruited By" value={viewRealtor.recruitedByName ?? "Direct"} />
              <DetailItem
                label="Created At"
                value={viewRealtor.createdAt ? new Date(viewRealtor.createdAt).toLocaleString() : undefined}
              />
            </div>
            <div className="border-t border-customBlack-100 pt-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ExternalLink size={16} className="text-customPurple-600" />
                Referral Link
              </label>
              <div className="mt-3 flex items-start gap-2">
                {/* A single-line <input> scrolls its overflow out of sight with
                    no visible scrollbar, so on a narrow screen (or with a long
                    referral code) the admin simply cannot see the whole link.
                    A wrapping block with break-all always shows all of it, the
                    same reasoning as the email field in CardField below.
                    text-gray-900 is explicit: inheriting body's --foreground
                    flips this to near-white under prefers-color-scheme: dark
                    while the panel stays light — the invisible-text bug again. */}
                <p className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm break-all text-gray-900">
                  {referralLink(viewRealtor.referralCode)}
                </p>
                <button
                  type="button"
                  onClick={() => copyReferralLink(referralLink(viewRealtor.referralCode))}
                  aria-label="Copy referral link"
                  className="shrink-0 rounded-lg border border-gray-300 bg-white p-3 text-customPurple-600 shadow-sm transition-colors hover:bg-customPurple-50"
                >
                  <Copy size={20} />
                </button>
                <a
                  href={referralLink(viewRealtor.referralCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open referral link in a new tab"
                  className="shrink-0 rounded-lg bg-customPurple-600 p-3 text-white shadow-md transition-colors hover:bg-customPurple-700"
                >
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!editRealtor} onClose={() => setEditRealtor(null)} title="Edit Realtor">
        {editForm && editRealtor && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="First Name">
                <input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className={textInputClass()}
                />
              </FormField>
              <FormField label="Last Name">
                <input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className={textInputClass()}
                />
              </FormField>
              <FormField label="Email">
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={textInputClass()}
                />
              </FormField>
              <FormField label="Phone">
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className={textInputClass()}
                />
              </FormField>
              <FormField label="State">
                <input
                  value={editForm.state}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  className={textInputClass()}
                />
              </FormField>
              <FormField label="Bank">
                <input
                  value={editForm.bank}
                  onChange={(e) => setEditForm({ ...editForm, bank: e.target.value })}
                  className={textInputClass()}
                />
              </FormField>
              <FormField label="Account Name">
                <input
                  value={editForm.accountName}
                  onChange={(e) => setEditForm({ ...editForm, accountName: e.target.value })}
                  className={textInputClass()}
                />
              </FormField>
              <FormField label="Account Number">
                <input
                  value={editForm.accountNumber}
                  onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                  className={textInputClass()}
                />
              </FormField>
            </div>
            <div className="flex justify-end gap-3 border-t border-customBlack-100 pt-6">
              <Button variant="secondary" size="md" className="rounded-lg" onClick={() => setEditRealtor(null)}>
                Cancel
              </Button>
              <Button
                size="md"
                className="rounded-lg"
                loading={editMutation.isPending}
                onClick={() => editMutation.mutate({ id: editRealtor._id, body: editForm })}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete Realtor?"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">
              {deleteTarget?.firstName} {deleteTarget?.lastName}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        icon={Trash2}
        loading={deleteMutation.isPending}
      />
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
      {/* break-all rather than truncate: a long email is the thing an admin
          most often needs to read in full, and it must wrap instead of
          widening the card past the viewport. */}
      <dd className="min-w-0 flex-1 text-sm break-all text-customBlack-600">{value || "-"}</dd>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <label className="text-xs font-semibold tracking-wider text-gray-600 uppercase">{label}</label>
      <p className="mt-2 font-medium break-words text-gray-900">{value || "-"}</p>
    </div>
  );
}
