"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Landmark, Star } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import type { BankAccount, BankAccountFormInput } from "./types";

const EMPTY_FORM: BankAccountFormInput = { bankName: "", accountName: "", accountNumber: "", sortCode: "", note: "" };

async function fetchAccounts(): Promise<BankAccount[]> {
  const res = await dashboardFetch("/api/bank-accounts");
  if (!res.ok) throw new Error("Failed to fetch bank accounts");
  return res.json();
}

export default function BankAccountsPanel({ initial }: { initial: BankAccount[] }) {
  const queryClient = useQueryClient();
  const [formTarget, setFormTarget] = useState<"new" | BankAccount | null>(null);
  const [form, setForm] = useState<BankAccountFormInput>(EMPTY_FORM);
  const [setPrimaryOnCreate, setSetPrimaryOnCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: accounts = [],
    isError: fetchFailed,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: fetchAccounts,
    initialData: initial,
  });

  // The server always seeds a default account, so a successful fetch can
  // never legitimately return zero — an empty list here only ever means the
  // page.tsx SSR fetch (or this client-side one) failed and silently fell
  // back to []. Treat it as a load failure, not "no accounts exist yet", so
  // an admin never mistakes "we couldn't reach the server" for "there is
  // nothing to see here".
  const loadFailed = fetchFailed || accounts.length === 0;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
  }

  const createMutation = useDashboardMutation<unknown, BankAccountFormInput & { isPrimary: boolean }>({
    mutationFn: async (body) => {
      const res = await dashboardFetch("/api/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create bank account");
      return data;
    },
    onSuccess: () => {
      setToast("Bank account added");
      setFormTarget(null);
      invalidate();
    },
    onError: (err) => setFormError(err.message || "Failed to create bank account"),
  });

  const updateMutation = useDashboardMutation<unknown, { id: string; body: Partial<BankAccount> }>({
    mutationFn: async ({ id, body }) => {
      const res = await dashboardFetch(`/api/bank-accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update bank account");
      return data;
    },
    onSuccess: (_data, { body }) => {
      if (body.bankName !== undefined) {
        setToast("Bank account updated");
        setFormTarget(null);
      }
      invalidate();
    },
    onError: (err, { body }) => {
      const message = err.message || "Failed to update bank account";
      // The modal form only ever sends bankName among its fields — anything
      // else (the inline isActive checkbox, the Make Primary button) has no
      // modal open to show an ErrorBanner in, so it needs the page-level one.
      if (body.bankName !== undefined) setFormError(message);
      else setPageError(message);
    },
  });

  const deleteMutation = useDashboardMutation<unknown, BankAccount>({
    mutationFn: async (account) => {
      const res = await dashboardFetch(`/api/bank-accounts/${account._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete bank account");
      return data;
    },
    onSuccess: () => {
      setToast("Bank account deleted");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (err) => setDeleteError(err.message || "Failed to delete bank account"),
  });

  function openNew() {
    setForm(EMPTY_FORM);
    setSetPrimaryOnCreate(false);
    setFormError(null);
    setFormTarget("new");
  }

  function openEdit(account: BankAccount) {
    setForm({
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      sortCode: account.sortCode ?? "",
      note: account.note ?? "",
    });
    setFormError(null);
    setFormTarget(account);
  }

  function submitForm() {
    if (formTarget === "new") {
      createMutation.mutate({ ...form, isPrimary: setPrimaryOnCreate });
    } else if (formTarget) {
      updateMutation.mutate({ id: formTarget._id, body: form });
    }
  }

  const sorted = [...accounts].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <Toast message={toast} onClose={() => setToast(null)} />

      {loadFailed && (
        <ErrorBanner className="mb-4 flex items-center justify-between gap-3">
          <span>Failed to load bank accounts.</span>
          <Button variant="secondary" size="sm" loading={isFetching} onClick={() => refetch()}>
            Retry
          </Button>
        </ErrorBanner>
      )}
      {pageError && (
        <ErrorBanner className="mb-4 flex items-center justify-between gap-3">
          <span>{pageError}</span>
          <button
            onClick={() => setPageError(null)}
            className="text-xs font-bold text-red-700 hover:underline"
            aria-label="Dismiss"
          >
            Dismiss
          </button>
        </ErrorBanner>
      )}

      <div className="mb-6 flex justify-end">
        <Button onClick={openNew}>
          <Plus size={16} />
          Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sorted.map((account) => (
          <Card key={account._id} radius="3xl" className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-customPurple-50">
                  <Landmark size={20} className="text-customPurple-600" />
                </div>
                <div>
                  <p className="font-bold text-customBlack-900">{account.bankName}</p>
                  <p className="text-sm text-customBlack-500">{account.accountName}</p>
                </div>
              </div>
              {account.isPrimary ? (
                <span className="flex items-center gap-1 rounded-full bg-customPurple-100 px-2.5 py-1 text-xs font-bold text-customPurple-700">
                  <Star size={12} fill="currentColor" />
                  Primary
                </span>
              ) : account.isActive ? (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={
                    updateMutation.isPending &&
                    updateMutation.variables?.id === account._id &&
                    updateMutation.variables?.body.isPrimary === true
                  }
                  onClick={() => {
                    setPageError(null);
                    updateMutation.mutate({ id: account._id, body: { isPrimary: true } });
                  }}
                >
                  Make Primary
                </Button>
              ) : (
                <span
                  className="rounded-full bg-customBlack-50 px-2.5 py-1 text-xs font-medium text-customBlack-400"
                  title="Activate this account before it can be made primary"
                >
                  Inactive
                </span>
              )}
            </div>

            <p className="mb-1 font-mono text-lg font-bold text-customBlack-900">{account.accountNumber}</p>
            {account.sortCode && <p className="mb-1 text-xs text-customBlack-400">Sort code: {account.sortCode}</p>}
            {account.note && <p className="mb-4 text-sm text-customBlack-500">{account.note}</p>}

            <div className="flex items-center justify-between border-t border-customBlack-50 pt-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={account.isActive}
                  onChange={(e) => {
                    setPageError(null);
                    updateMutation.mutate({ id: account._id, body: { isActive: e.target.checked } });
                  }}
                  className="h-4 w-4 accent-customPurple-500"
                />
                <span className={account.isActive ? "text-green-700" : "text-customBlack-400"}>
                  {account.isActive ? "Active" : "Inactive"}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(account)}>
                  <Pencil size={15} />
                </Button>
                <Button
                  variant="danger"
                  size="icon"
                  aria-label="Delete"
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteTarget(account);
                  }}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={formTarget !== null}
        onClose={() => setFormTarget(null)}
        title={formTarget === "new" ? "Add Bank Account" : "Edit Bank Account"}
      >
        <div className="space-y-4">
          {formError && <ErrorBanner>{formError}</ErrorBanner>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Bank Name">
              <input
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className={textInputClass()}
              />
            </FormField>
            <FormField label="Account Name">
              <input
                value={form.accountName}
                onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                className={textInputClass()}
              />
            </FormField>
            <FormField label="Account Number">
              <input
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                className={textInputClass()}
                placeholder="Digits only"
              />
            </FormField>
            <FormField label="Sort Code (optional)">
              <input
                value={form.sortCode}
                onChange={(e) => setForm({ ...form, sortCode: e.target.value })}
                className={textInputClass()}
              />
            </FormField>
          </div>
          <FormField label="Note (optional)">
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className={textInputClass()}
              placeholder="e.g. For property payments only"
            />
          </FormField>
          {formTarget === "new" && (
            <label className="flex items-center gap-2 text-sm font-medium text-customBlack-700">
              <input
                type="checkbox"
                checked={setPrimaryOnCreate}
                onChange={(e) => setSetPrimaryOnCreate(e.target.checked)}
                className="h-4 w-4 accent-customPurple-500"
              />
              Set as primary account
            </label>
          )}
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button variant="secondary" size="md" className="rounded-lg" onClick={() => setFormTarget(null)}>
              Cancel
            </Button>
            <Button
              size="md"
              className="rounded-lg"
              loading={saving}
              disabled={!form.bankName.trim() || !form.accountName.trim() || !form.accountNumber.trim()}
              onClick={submitForm}
            >
              {formTarget === "new" ? "Add Account" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete Bank Account?"
        description={
          <>
            Delete <span className="font-semibold text-gray-800">{deleteTarget?.bankName}</span> ({deleteTarget?.accountNumber})? This cannot be undone.
            {deleteError && <ErrorBanner className="mt-3 text-left">{deleteError}</ErrorBanner>}
          </>
        }
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
