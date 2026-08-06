"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Building2,
  Calendar,
  Users,
  Mail,
  Phone as PhoneIcon,
  StickyNote,
} from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { fmtDate } from "@/components/client-portal/portalFormat";
import type { Estate } from "@/lib/api";
import type { Inspection, InspectionFormInput, InspectionStatus } from "./types";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { TONES, type BadgeTone } from "@/components/ui/Badge";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";
import { FormField, textInputClass } from "@/components/client-auth/FormField";

const STATUSES: InspectionStatus[] = ["pending", "confirmed", "cancelled", "completed"];
const HEADERS = ["Estate", "Client", "Date", "Persons", "Status", "Actions"];

const STATUS_TONE: Record<InspectionStatus, BadgeTone> = {
  pending: "amber",
  confirmed: "purple",
  completed: "green",
  cancelled: "red",
};

function emptyForm(): InspectionFormInput {
  return {
    estateName: "",
    estateId: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    inspectionDate: "",
    persons: 1,
    status: "pending",
    notes: "",
  };
}

function toFormInput(insp: Inspection): InspectionFormInput {
  return {
    estateName: insp.estateName,
    estateId: insp.estateId ?? null,
    firstName: insp.firstName,
    lastName: insp.lastName,
    email: insp.email,
    phone: insp.phone,
    // Stored as an ISO datetime — a date <input> needs just the YYYY-MM-DD prefix.
    inspectionDate: insp.inspectionDate ? insp.inspectionDate.slice(0, 10) : "",
    persons: insp.persons,
    status: insp.status,
    notes: insp.notes || "",
  };
}

// Surfaces the zod field-level messages from validate.js's 400 response
// instead of the generic "Validation failed" — an admin fixing a form needs
// to know *which* field is wrong.
function extractErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const d = data as { message?: string; errors?: { message: string }[] };
    if (Array.isArray(d.errors) && d.errors.length) {
      return d.errors.map((e) => e.message).join(" ");
    }
    if (d.message) return d.message;
  }
  return fallback;
}

async function fetchEstatesForPicker(): Promise<Estate[]> {
  try {
    const res = await dashboardFetch(`/api/estates?active=all&limit=100`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.estates ?? [];
  } catch {
    return [];
  }
}

export default function InspectionsTable({ initialInspections }: { initialInspections: Inspection[] }) {
  const [inspections, setInspections] = useState(initialInspections);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [toast, setToast] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [viewTarget, setViewTarget] = useState<Inspection | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<InspectionFormInput>(emptyForm());
  const [editTarget, setEditTarget] = useState<Inspection | null>(null);
  const [editForm, setEditForm] = useState<InspectionFormInput | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Inspection | null>(null);

  const createFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchEstatesForPicker().then(setEstates);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inspections.filter((i) => {
      if (statusFilter && i.status !== statusFilter) return false;
      if (q) {
        const haystack = `${i.estateName} ${i.firstName} ${i.lastName} ${i.email} ${i.phone}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [inspections, search, statusFilter]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
  }

  function openCreate() {
    setFormError(null);
    setCreateForm(emptyForm());
    setCreateOpen(true);
  }

  function closeCreate() {
    setCreateOpen(false);
    setFormError(null);
  }

  function openEdit(insp: Inspection) {
    setFormError(null);
    setEditTarget(insp);
    setEditForm(toFormInput(insp));
  }

  function closeEdit() {
    setEditTarget(null);
    setEditForm(null);
    setFormError(null);
  }

  const statusMutation = useDashboardMutation<unknown, { inspection: Inspection; status: InspectionStatus }>({
    mutationFn: async ({ inspection, status }) => {
      const res = await dashboardFetch(`/api/inspections/${inspection._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractErrorMessage(data, "Failed to update status"));
      return data;
    },
    onSuccess: (_data, { inspection, status }) => {
      setInspections((prev) => prev.map((i) => (i._id === inspection._id ? { ...i, status } : i)));
    },
  });

  const createMutation = useDashboardMutation<{ inspection: Inspection }, InspectionFormInput>({
    mutationFn: async (form) => {
      const res = await dashboardFetch(`/api/inspections/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractErrorMessage(data, "Failed to create inspection"));
      return data;
    },
    onSuccess: (data) => {
      setInspections((prev) => [data.inspection, ...prev]);
      setToast("Inspection created successfully");
      closeCreate();
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : "Failed to create inspection");
      createFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  });

  const editMutation = useDashboardMutation<{ inspection: Inspection }, { id: string; body: InspectionFormInput }>({
    mutationFn: async ({ id, body }) => {
      const res = await dashboardFetch(`/api/inspections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractErrorMessage(data, "Failed to update inspection"));
      return data;
    },
    onSuccess: (data) => {
      setInspections((prev) => prev.map((i) => (i._id === data.inspection._id ? data.inspection : i)));
      setToast("Inspection updated successfully");
      closeEdit();
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : "Failed to update inspection");
      editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  });

  const deleteMutation = useDashboardMutation<unknown, Inspection>({
    mutationFn: async (insp) => {
      const res = await dashboardFetch(`/api/inspections/${insp._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(extractErrorMessage(data, "Failed to delete inspection"));
      return data;
    },
    onSuccess: (_data, insp) => {
      setInspections((prev) => prev.filter((i) => i._id !== insp._id));
      setToast("Inspection deleted successfully");
      setDeleteTarget(null);
      setActionError(null);
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : "Failed to delete inspection");
      setDeleteTarget(null);
    },
  });

  function isBusy(inspectionId: string) {
    return statusMutation.isPending && statusMutation.variables?.inspection._id === inspectionId;
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    createMutation.mutate(createForm);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget || !editForm) return;
    setFormError(null);
    editMutation.mutate({ id: editTarget._id, body: editForm });
  }

  return (
    <div>
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inspections…"
              className={search ? "pr-9" : undefined}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </Select>
          {(search || statusFilter) && (
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
        <Button size="md" className="rounded-full shrink-0" onClick={openCreate}>
          <Plus size={16} />
          New Inspection
        </Button>
      </div>

      <p className="mb-4 text-sm text-customBlack-500">
        Showing <span className="font-semibold text-customBlack-700">{filtered.length}</span> of{" "}
        {inspections.length} inspection{inspections.length === 1 ? "" : "s"}
      </p>

      {actionError && <ErrorBanner className="mb-4">{actionError}</ErrorBanner>}

      {/* ── Desktop / tablet: full table ────────────────────────────────────── */}
      <TableShell className="hidden md:block">
        <TableHeadRow headers={HEADERS} />
        <TableBody>
          {filtered.map((insp) => (
            <tr key={insp._id} className="hover:bg-customPurple-50/30">
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-customBlack-900">{insp.estateName}</p>
                {insp.notes && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-customBlack-400">
                    <StickyNote size={11} className="shrink-0" />
                    <span className="max-w-[16rem] truncate">{insp.notes}</span>
                  </p>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar firstName={insp.firstName} lastName={insp.lastName} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-customBlack-900">
                      {insp.firstName} {insp.lastName}
                    </p>
                    <p className="truncate text-xs text-customBlack-400">{insp.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{fmtDate(insp.inspectionDate)}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{insp.persons}</td>
              <td className="px-6 py-4">
                <select
                  value={insp.status}
                  disabled={isBusy(insp._id)}
                  onChange={(e) =>
                    statusMutation.mutate({ inspection: insp, status: e.target.value as InspectionStatus })
                  }
                  className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold disabled:opacity-50 ${TONES[STATUS_TONE[insp.status]]}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" aria-label="View" onClick={() => setViewTarget(insp)}>
                    <Eye size={15} />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(insp)}>
                    <Edit2 size={15} />
                  </Button>
                  <Button variant="danger" size="icon" aria-label="Delete" onClick={() => setDeleteTarget(insp)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && <TableEmptyRow colSpan={HEADERS.length} message="No inspections match your filters." />}
        </TableBody>
      </TableShell>

      {/* ── Mobile: one card per inspection ─────────────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {filtered.map((insp, i) => (
          <article
            key={insp._id}
            style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}
            className="animate-enter-rise overflow-hidden rounded-2xl border border-customBlack-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar firstName={insp.firstName} lastName={insp.lastName} size={44} />
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-customBlack-900">
                    {insp.firstName} {insp.lastName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-customPurple-600">
                    <Building2 size={11} className="shrink-0" />
                    <span className="truncate">{insp.estateName}</span>
                  </p>
                </div>
              </div>
              <select
                value={insp.status}
                disabled={isBusy(insp._id)}
                onChange={(e) =>
                  statusMutation.mutate({ inspection: insp, status: e.target.value as InspectionStatus })
                }
                className={`shrink-0 rounded-full border-0 px-2.5 py-1 text-xs font-bold disabled:opacity-50 ${TONES[STATUS_TONE[insp.status]]}`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <dl className="mt-4 space-y-2.5">
              <CardField icon={Calendar} label="Date" value={fmtDate(insp.inspectionDate)} />
              <CardField icon={Users} label="Persons" value={String(insp.persons)} />
              <CardField icon={Mail} label="Email" value={insp.email} />
              <CardField icon={PhoneIcon} label="Phone" value={insp.phone} />
            </dl>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-customBlack-50 pt-3">
              <Button variant="ghost" size="sm" onClick={() => setViewTarget(insp)}>
                <Eye size={14} />
                View
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEdit(insp)}>
                <Edit2 size={14} />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteTarget(insp)}>
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-customBlack-100 bg-white px-6 py-16 text-center text-sm text-gray-400">
            No inspections match your filters.
          </div>
        )}
      </div>

      {/* ── View modal ───────────────────────────────────────────────────────── */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Inspection Details">
        {viewTarget && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar firstName={viewTarget.firstName} lastName={viewTarget.lastName} size={96} className="border-4 border-customPurple-200 shadow-lg" />
              <div className="text-center">
                <p className="text-lg font-bold text-customBlack-900">
                  {viewTarget.firstName} {viewTarget.lastName}
                </p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${TONES[STATUS_TONE[viewTarget.status]]}`}>
                  {viewTarget.status[0].toUpperCase() + viewTarget.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem label="Estate" value={viewTarget.estateName} />
              <DetailItem label="Persons" value={String(viewTarget.persons)} />
              <DetailItem label="Email" value={viewTarget.email} />
              <DetailItem label="Phone" value={viewTarget.phone} />
              <DetailItem label="Inspection Date" value={fmtDate(viewTarget.inspectionDate)} />
              <DetailItem label="Requested" value={viewTarget.createdAt ? new Date(viewTarget.createdAt).toLocaleString() : undefined} />
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <label className="text-xs font-semibold tracking-wider text-gray-600 uppercase">Notes</label>
              <p className="mt-2 font-medium break-words text-gray-900">{viewTarget.notes || "No notes yet."}</p>
            </div>
            <div className="flex justify-end gap-3 border-t border-customBlack-100 pt-6">
              <Button
                variant="secondary"
                size="md"
                className="rounded-lg"
                onClick={() => {
                  const insp = viewTarget;
                  setViewTarget(null);
                  openEdit(insp);
                }}
              >
                <Edit2 size={14} />
                Edit
              </Button>
              <Button size="md" className="rounded-lg" onClick={() => setViewTarget(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Create modal ─────────────────────────────────────────────────────── */}
      <Modal open={createOpen} onClose={closeCreate} title="New Inspection">
        <form ref={createFormRef} onSubmit={handleCreateSubmit} className="space-y-6">
          {formError && <ErrorBanner>{formError}</ErrorBanner>}
          <InspectionFormFields form={createForm} setForm={setCreateForm} estates={estates} />
          <div className="flex justify-end gap-3 border-t border-customBlack-100 pt-6">
            <Button type="button" variant="secondary" size="md" className="rounded-lg" onClick={closeCreate}>
              Cancel
            </Button>
            <Button type="submit" size="md" className="rounded-lg" loading={createMutation.isPending}>
              <Plus size={14} />
              Create Inspection
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit modal ───────────────────────────────────────────────────────── */}
      <Modal open={!!editTarget} onClose={closeEdit} title="Edit Inspection">
        {editForm && editTarget && (
          <form ref={editFormRef} onSubmit={handleEditSubmit} className="space-y-6">
            {formError && <ErrorBanner>{formError}</ErrorBanner>}
            <InspectionFormFields form={editForm} setForm={setEditForm as React.Dispatch<React.SetStateAction<InspectionFormInput>>} estates={estates} />
            <div className="flex justify-end gap-3 border-t border-customBlack-100 pt-6">
              <Button type="button" variant="secondary" size="md" className="rounded-lg" onClick={closeEdit}>
                Cancel
              </Button>
              <Button type="submit" size="md" className="rounded-lg" loading={editMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete Inspection?"
        description={
          <>
            Are you sure you want to delete the inspection for{" "}
            <span className="font-semibold text-gray-800">
              {deleteTarget?.firstName} {deleteTarget?.lastName}
            </span>{" "}
            at <span className="font-semibold text-gray-800">{deleteTarget?.estateName}</span>? This action cannot be
            undone.
          </>
        }
        confirmLabel="Delete"
        icon={Trash2}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function InspectionFormFields({
  form,
  setForm,
  estates,
}: {
  form: InspectionFormInput;
  setForm: React.Dispatch<React.SetStateAction<InspectionFormInput>>;
  estates: Estate[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Link to an Estate (optional)">
          <select
            value={form.estateId ?? ""}
            onChange={(e) => {
              const id = e.target.value || null;
              const picked = estates.find((es) => es._id === id);
              setForm((f) => ({ ...f, estateId: id, estateName: picked ? picked.estate : f.estateName }));
            }}
            className={textInputClass()}
          >
            <option value="">— Not linked / type name manually —</option>
            {estates.map((es) => (
              <option key={es._id} value={es._id}>
                {es.estate}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Estate Name">
          <input
            required
            value={form.estateName}
            onChange={(e) => setForm((f) => ({ ...f, estateName: e.target.value }))}
            className={textInputClass()}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="First Name">
          <input
            required
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            className={textInputClass()}
          />
        </FormField>
        <FormField label="Last Name">
          <input
            required
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            className={textInputClass()}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={textInputClass()}
          />
        </FormField>
        <FormField label="Phone">
          <input
            required
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={textInputClass()}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField label="Inspection Date">
          <input
            type="date"
            required
            value={form.inspectionDate}
            onChange={(e) => setForm((f) => ({ ...f, inspectionDate: e.target.value }))}
            className={textInputClass()}
          />
        </FormField>
        <FormField label="Persons">
          <input
            type="number"
            min={1}
            required
            value={form.persons}
            onChange={(e) => setForm((f) => ({ ...f, persons: Math.max(1, Number(e.target.value) || 1) }))}
            className={textInputClass()}
          />
        </FormField>
        <FormField label="Status">
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as InspectionStatus }))}
            className={textInputClass()}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Notes">
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className={textInputClass()}
        />
      </FormField>
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

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <label className="text-xs font-semibold tracking-wider text-gray-600 uppercase">{label}</label>
      <p className="mt-2 font-medium break-words text-gray-900">{value || "-"}</p>
    </div>
  );
}
