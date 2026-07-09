"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, MapPin, ShieldCheck } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import TagListInput from "@/components/dashboard/estates/TagListInput";
import { EMPTY_BRANCH_FORM, type Branch, type BranchFormInput } from "./types";

async function fetchBranches(): Promise<Branch[]> {
  const res = await dashboardFetch("/api/branches");
  if (!res.ok) throw new Error("Failed to fetch branches");
  return res.json();
}

export default function BranchesPanel({ initial }: { initial: Branch[] }) {
  const queryClient = useQueryClient();
  const [formTarget, setFormTarget] = useState<"new" | Branch | null>(null);
  const [form, setForm] = useState<BranchFormInput>(EMPTY_BRANCH_FORM);
  const [newBranchId, setNewBranchId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    initialData: initial,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["branches"] });
  }

  const createMutation = useDashboardMutation<unknown, { branchId: string } & BranchFormInput>({
    mutationFn: async (body) => {
      const res = await dashboardFetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create branch");
      return data;
    },
    onSuccess: () => { setToast("Branch created"); setFormTarget(null); invalidate(); },
  });

  const updateMutation = useDashboardMutation<unknown, { branchId: string; body: Partial<Branch> }>({
    mutationFn: async ({ branchId, body }) => {
      const res = await dashboardFetch(`/api/branches/${branchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update branch");
      return data;
    },
    onSuccess: (_data, { body }) => {
      if (body.label !== undefined) { setToast("Branch updated"); setFormTarget(null); }
      invalidate();
    },
  });

  const deleteMutation = useDashboardMutation<unknown, Branch>({
    mutationFn: async (branch) => {
      const res = await dashboardFetch(`/api/branches/${branch.branchId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete branch");
      return data;
    },
    onSuccess: () => { setToast("Branch deleted"); setDeleteTarget(null); invalidate(); },
  });

  function openNew() {
    setForm(EMPTY_BRANCH_FORM);
    setNewBranchId("");
    setFormTarget("new");
  }

  function openEdit(branch: Branch) {
    setForm({
      label: branch.label,
      address: branch.address,
      mapEmbedUrl: branch.mapEmbedUrl,
      mapLink: branch.mapLink,
      phones: branch.phones ?? [],
      emails: branch.emails ?? [],
      hours: branch.hours ?? { weekdays: "", saturday: "", sunday: "" },
      social: branch.social ?? {},
    });
    setFormTarget(branch);
  }

  function submit() {
    if (formTarget === "new") createMutation.mutate({ branchId: newBranchId.trim().toLowerCase(), ...form });
    else if (formTarget) updateMutation.mutate({ branchId: formTarget.branchId, body: form });
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex justify-end">
        <Button onClick={openNew}>
          <Plus size={16} />
          Add Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {branches.map((branch) => (
          <Card key={branch.branchId} radius="3xl" className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-customPurple-50">
                  <MapPin size={20} className="text-customPurple-600" />
                </div>
                <div>
                  <p className="flex items-center gap-1.5 font-bold text-customBlack-900">
                    {branch.label}
                    {branch.isHQ && <ShieldCheck size={14} className="text-customPurple-600" />}
                  </p>
                  <p className="text-sm text-customBlack-500">{branch.address || "No address set"}</p>
                </div>
              </div>
              {branch.isHQ && (
                <span className="rounded-full bg-customPurple-100 px-2.5 py-1 text-xs font-bold text-customPurple-700">
                  HQ
                </span>
              )}
            </div>

            <div className="mb-4 space-y-1 text-sm text-customBlack-600">
              <p>{branch.phones?.join(", ") || "No phone numbers"}</p>
              <p>{branch.emails?.join(", ") || "No emails"}</p>
            </div>

            <div className="flex items-center justify-between border-t border-customBlack-50 pt-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={branch.isActive}
                  onChange={(e) => updateMutation.mutate({ branchId: branch.branchId, body: { isActive: e.target.checked } })}
                  className="h-4 w-4 accent-customPurple-500"
                />
                <span className={branch.isActive ? "text-green-700" : "text-customBlack-400"}>
                  {branch.isActive ? "Active" : "Inactive"}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(branch)}>
                  <Pencil size={15} />
                </Button>
                <Button
                  variant="danger"
                  size="icon"
                  aria-label="Delete"
                  disabled={branch.isHQ}
                  title={branch.isHQ ? "Cannot delete the headquarters branch" : "Delete"}
                  onClick={() => setDeleteTarget(branch)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {branches.length === 0 && (
          <p className="col-span-2 py-16 text-center text-sm text-customBlack-400">No branches yet.</p>
        )}
      </div>

      <Modal
        open={formTarget !== null}
        onClose={() => setFormTarget(null)}
        title={formTarget === "new" ? "Add Branch" : "Edit Branch"}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {formTarget === "new" && (
              <FormField label="Branch ID (e.g. ph)">
                <input value={newBranchId} onChange={(e) => setNewBranchId(e.target.value)} className={textInputClass()} />
              </FormField>
            )}
            <FormField label="Label">
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={textInputClass()} />
            </FormField>
            <FormField label="Address">
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={textInputClass()} />
            </FormField>
            <FormField label="Map Embed URL">
              <input value={form.mapEmbedUrl} onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })} className={textInputClass()} />
            </FormField>
            <FormField label="Map Link">
              <input value={form.mapLink} onChange={(e) => setForm({ ...form, mapLink: e.target.value })} className={textInputClass()} />
            </FormField>
          </div>

          <TagListInput label="Phone Numbers" values={form.phones} onChange={(phones) => setForm({ ...form, phones })} placeholder="+234 800 000 0000" />
          <TagListInput label="Emails" values={form.emails} onChange={(emails) => setForm({ ...form, emails })} placeholder="branch@kemchutahomesltd.com" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Weekday Hours">
              <input
                value={form.hours.weekdays}
                onChange={(e) => setForm({ ...form, hours: { ...form.hours, weekdays: e.target.value } })}
                className={textInputClass()}
              />
            </FormField>
            <FormField label="Saturday Hours">
              <input
                value={form.hours.saturday}
                onChange={(e) => setForm({ ...form, hours: { ...form.hours, saturday: e.target.value } })}
                className={textInputClass()}
              />
            </FormField>
            <FormField label="Sunday Hours">
              <input
                value={form.hours.sunday}
                onChange={(e) => setForm({ ...form, hours: { ...form.hours, sunday: e.target.value } })}
                className={textInputClass()}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(["instagram", "facebook", "twitter", "whatsapp", "youtube"] as const).map((key) => (
              <FormField key={key} label={key[0].toUpperCase() + key.slice(1)}>
                <input
                  value={form.social[key] ?? ""}
                  onChange={(e) => setForm({ ...form, social: { ...form.social, [key]: e.target.value } })}
                  className={textInputClass()}
                />
              </FormField>
            ))}
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Button variant="secondary" size="md" className="rounded-lg" onClick={() => setFormTarget(null)}>Cancel</Button>
            <Button
              size="md"
              className="rounded-lg"
              loading={saving}
              disabled={!form.label.trim() || (formTarget === "new" && !newBranchId.trim())}
              onClick={submit}
            >
              {formTarget === "new" ? "Add Branch" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete Branch?"
        description={<>Delete <span className="font-semibold text-gray-800">{deleteTarget?.label}</span>? This cannot be undone.</>}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
