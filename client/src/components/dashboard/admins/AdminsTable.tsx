"use client";

import { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Edit2, Trash2, Mail, UserPlus, ShieldCheck } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Badge } from "@/components/ui/Badge";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import type {
  AdminUser,
  AdminListResponse,
  PermissionOption,
  InviteAdminInput,
  UpdateAdminInput,
} from "./types";

const HEADERS = ["Admin", "Email", "Role", "Status", "Permissions", "Actions"];

function fullName(admin: Pick<AdminUser, "firstName" | "lastName" | "email">) {
  return [admin.firstName, admin.lastName].filter(Boolean).join(" ").trim() || admin.email;
}

const EMPTY_INVITE_FORM: InviteAdminInput = {
  email: "",
  firstName: "",
  lastName: "",
  role: "admin",
  permissions: [],
};

async function fetchAdmins(page: number, limit: number): Promise<AdminListResponse> {
  const res = await dashboardFetch(`/api/admin/admins?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch admins");
  return res.json();
}

async function fetchPermissionCatalog(): Promise<PermissionOption[]> {
  const res = await dashboardFetch(`/api/admin/permissions`);
  if (!res.ok) throw new Error("Failed to fetch permission catalog");
  return res.json();
}

export default function AdminsTable({
  initial,
  pageSize,
  currentUserId,
}: {
  initial: AdminListResponse | null;
  pageSize: number;
  currentUserId: string;
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteAdminInput>(EMPTY_INVITE_FORM);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<UpdateAdminInput | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ["admins", page],
    queryFn: () => fetchAdmins(page, pageSize),
    initialData: page === 1 ? (initial ?? undefined) : undefined,
    placeholderData: keepPreviousData,
  });

  const { data: permissionCatalog = [] } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: fetchPermissionCatalog,
  });

  const admins = data?.docs ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const isEmpty = !isFetching && admins.length === 0;
  const superadminCount = admins.filter((a) => a.role === "superadmin").length;

  function goTo(p: number) {
    if (p < 1 || p > pages || p === page) return;
    setPage(p);
  }

  function openEdit(admin: AdminUser) {
    setActionError(null);
    setEditAdmin(admin);
    setEditForm({
      firstName: admin.firstName ?? "",
      lastName: admin.lastName ?? "",
      role: admin.role,
      permissions: admin.permissions,
    });
  }

  function togglePermission(list: string[], key: string): string[] {
    return list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
  }

  const inviteMutation = useDashboardMutation<unknown, InviteAdminInput>({
    mutationFn: async (body) => {
      const res = await dashboardFetch(`/api/admin/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to invite admin");
      return data;
    },
    onSuccess: () => {
      setToast("Invite sent");
      setInviteOpen(false);
      setInviteForm(EMPTY_INVITE_FORM);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  const editMutation = useDashboardMutation<unknown, { id: string; body: UpdateAdminInput }>({
    mutationFn: async ({ id, body }) => {
      const res = await dashboardFetch(`/api/admin/admins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update admin");
      return data;
    },
    onSuccess: () => {
      setToast("Admin updated");
      setEditAdmin(null);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  const deleteMutation = useDashboardMutation<unknown, AdminUser>({
    mutationFn: async (admin) => {
      const res = await dashboardFetch(`/api/admin/admins/${admin._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete admin");
      return data;
    },
    onSuccess: () => {
      setToast("Admin deleted");
      setDeleteTarget(null);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  const resendMutation = useDashboardMutation<unknown, string>({
    mutationFn: async (id) => {
      const res = await dashboardFetch(`/api/admin/admins/${id}/resend-invite`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend invite");
      return data;
    },
    onSuccess: () => {
      setToast("Invite resent");
      setActionError(null);
    },
  });

  return (
    <div>
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex justify-end">
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus size={14} />
          Invite Admin
        </Button>
      </div>

      {error && <ErrorBanner className="mb-4">{error.message}</ErrorBanner>}
      {actionError && <ErrorBanner className="mb-4">{actionError}</ErrorBanner>}

      <TableShell>
        <TableHeadRow headers={HEADERS} />
        <TableBody>
          {admins.map((a) => {
            const isSelf = a._id === currentUserId;
            const isLastSuperadmin = a.role === "superadmin" && superadminCount <= 1;
            return (
              <tr key={a._id} className="hover:bg-customPurple-50/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-customBlack-900">{fullName(a)}</span>
                    {a.role === "superadmin" && <ShieldCheck size={14} className="text-customPurple-600" />}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-customBlack-600">{a.email}</td>
                <td className="px-6 py-4">
                  <Badge tone={a.role === "superadmin" ? "purple" : "gray"}>
                    {a.role === "superadmin" ? "Superadmin" : "Admin"}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    tone={a.status === "active" ? "green" : a.status === "pending" ? "amber" : "red"}
                  >
                    {a.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-xs text-customBlack-500">
                  {a.role === "superadmin"
                    ? "All sections"
                    : a.permissions.length
                      ? `${a.permissions.length} section${a.permissions.length > 1 ? "s" : ""}`
                      : "None granted"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(a)}>
                      <Edit2 size={15} />
                    </Button>
                    {a.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Resend invite"
                        loading={resendMutation.isPending && resendMutation.variables === a._id}
                        onClick={() => resendMutation.mutate(a._id)}
                      >
                        <Mail size={15} />
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="icon"
                      aria-label="Delete"
                      disabled={isSelf || isLastSuperadmin}
                      title={
                        isSelf
                          ? "You cannot delete your own account"
                          : isLastSuperadmin
                            ? "Cannot delete the last superadmin"
                            : undefined
                      }
                      onClick={() => setDeleteTarget(a)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
          {isEmpty && <TableEmptyRow colSpan={HEADERS.length} message="No admins found." />}
        </TableBody>
      </TableShell>

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

      {/* ── Invite modal ─────────────────────────────────────────────── */}
      <Modal
        open={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          setInviteForm(EMPTY_INVITE_FORM);
        }}
        title="Invite Admin"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="First Name">
              <input
                value={inviteForm.firstName}
                onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                className={textInputClass()}
              />
            </FormField>
            <FormField label="Last Name">
              <input
                value={inviteForm.lastName}
                onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                className={textInputClass()}
              />
            </FormField>
          </div>
          <FormField label="Email">
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className={textInputClass()}
            />
          </FormField>
          <FormField label="Role">
            <select
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, role: e.target.value as InviteAdminInput["role"] })
              }
              className={textInputClass()}
            >
              <option value="admin">Admin (section-limited)</option>
              <option value="superadmin">Superadmin (full access)</option>
            </select>
          </FormField>
          {inviteForm.role === "admin" && (
            <FormField label="Permissions">
              <div className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-2">
                {permissionCatalog.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={inviteForm.permissions.includes(p.key)}
                      onChange={() =>
                        setInviteForm({
                          ...inviteForm,
                          permissions: togglePermission(inviteForm.permissions, p.key),
                        })
                      }
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </FormField>
          )}
          <div className="flex justify-end gap-3 border-t border-customBlack-100 pt-6">
            <Button variant="secondary" size="md" className="rounded-lg" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              size="md"
              className="rounded-lg"
              loading={inviteMutation.isPending}
              disabled={!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName}
              onClick={() => inviteMutation.mutate(inviteForm)}
            >
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Edit modal ───────────────────────────────────────────────── */}
      <Modal open={!!editAdmin} onClose={() => setEditAdmin(null)} title="Edit Admin">
        {editForm && editAdmin && (
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
            </div>
            <FormField label="Role">
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UpdateAdminInput["role"] })}
                disabled={editAdmin._id === currentUserId}
                className={textInputClass()}
              >
                <option value="admin">Admin (section-limited)</option>
                <option value="superadmin">Superadmin (full access)</option>
              </select>
            </FormField>
            {editForm.role === "admin" && (
              <FormField label="Permissions">
                <div className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-2">
                  {permissionCatalog.map((p) => (
                    <label key={p.key} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={editForm.permissions.includes(p.key)}
                        onChange={() =>
                          setEditForm({
                            ...editForm,
                            permissions: togglePermission(editForm.permissions, p.key),
                          })
                        }
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </FormField>
            )}
            <div className="flex justify-end gap-3 border-t border-customBlack-100 pt-6">
              <Button variant="secondary" size="md" className="rounded-lg" onClick={() => setEditAdmin(null)}>
                Cancel
              </Button>
              <Button
                size="md"
                className="rounded-lg"
                loading={editMutation.isPending}
                onClick={() => editMutation.mutate({ id: editAdmin._id, body: editForm })}
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
        title="Delete Admin?"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">{deleteTarget ? fullName(deleteTarget) : ""}</span>?
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        icon={Trash2}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
