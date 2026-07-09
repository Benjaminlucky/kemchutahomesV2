"use client";

import { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Eye, Edit2, Trash2, Download, ExternalLink, Search } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import type { Realtor, RealtorListResponse, RealtorUpdateInput } from "./types";

const HEADERS = ["Referral Code", "First Name", "Last Name", "Email", "Phone", "Bank", "Account No.", "Actions"];

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

  const { data, isFetching, error } = useQuery({
    queryKey: ["realtors", page, search],
    queryFn: () => fetchRealtors(page, pageSize, search),
    initialData: page === 1 && search === "" ? (initial ?? undefined) : undefined,
    placeholderData: keepPreviousData,
  });

  const realtors = data?.docs ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  function goTo(p: number) {
    if (p < 1 || p > pages || p === page) return;
    setPage(p);
  }

  function runSearch() {
    setPage(1);
    setSearch(searchDraft.trim());
  }

  async function openView(id: string) {
    try {
      setViewRealtor(await fetchRealtorById(id));
    } catch {
      alert("Failed to fetch realtor details");
    }
  }

  async function openEdit(id: string) {
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
      alert("Failed to fetch realtor details");
    }
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
      queryClient.invalidateQueries({ queryKey: ["realtors"] });
    },
  });

  // Only exports the currently loaded page, not the full result set — same
  // scope the legacy admin tool had; widening this to "all matching realtors"
  // would need a dedicated export endpoint rather than the paginated list one.
  function exportField(field: "email" | "phone") {
    const values = realtors.map((r) => r[field]).join(", ");
    navigator.clipboard.writeText(values);
    setToast(field === "email" ? "Emails copied to clipboard!" : "Phone numbers copied to clipboard!");
  }

  return (
    <div>
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex-1 sm:max-w-xs">
            <Input
              icon={Search}
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search by name, email, referral code…"
            />
          </div>
          <Button size="sm" onClick={runSearch}>Search</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportField("email")}>
            <Download size={14} />
            Export Emails
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportField("phone")}>
            <Download size={14} />
            Export Phones
          </Button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error.message}</p>}

      <TableShell>
        <TableHeadRow headers={HEADERS} />
        <TableBody>
          {realtors.map((r) => (
            <tr key={r._id} className="hover:bg-customPurple-50/30">
              <td className="px-6 py-4 text-sm font-bold text-customBlack-900">{r.referralCode || "-"}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{r.firstName || "-"}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{r.lastName || "-"}</td>
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
          {!isFetching && realtors.length === 0 && <TableEmptyRow colSpan={8} message="No realtors found." />}
        </TableBody>
      </TableShell>

      <div className="mt-4 flex items-center justify-between text-sm text-customBlack-500">
        <span>Page {page} of {pages} — {total} total</span>
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
              <img
                src={viewRealtor.avatar || "https://ui-avatars.com/api/?name=User"}
                alt="Avatar"
                className="h-32 w-32 rounded-full border-4 border-customPurple-200 object-cover shadow-lg"
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
            <div className="border-t pt-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ExternalLink size={16} className="text-customPurple-600" />
                Referral Link
              </label>
              <div className="mt-3 flex items-center gap-2">
                <input
                  readOnly
                  value={`https://kemchutahomesltd.com/signup?ref=${viewRealtor.referralCode}`}
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm"
                />
                <a
                  href={`https://kemchutahomesltd.com/signup?ref=${viewRealtor.referralCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-customPurple-600 p-3 text-white shadow-md transition-colors hover:bg-customPurple-700"
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
            <div className="flex justify-end gap-3 border-t pt-6">
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

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <label className="text-xs font-semibold tracking-wider text-gray-600 uppercase">{label}</label>
      <p className="mt-2 font-medium text-gray-900">{value || "-"}</p>
    </div>
  );
}
