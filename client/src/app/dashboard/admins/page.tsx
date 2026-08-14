import { cookies } from "next/headers";
import AdminsTable from "@/components/dashboard/admins/AdminsTable";
import type { AdminListResponse } from "@/components/dashboard/admins/types";
import { requireAdminAccess } from "@/lib/requireAdminAccess";

export const PAGE_SIZE = 10;

// Superadmin-only — requireAdminAccess() with no permissionKey redirects
// any non-superadmin (including full "admin" role) back to /dashboard.
export default async function ManageAdminsPage() {
  const currentUser = await requireAdminAccess();
  const cookieHeader = (await cookies()).toString();
  let initial: AdminListResponse | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/admins?page=1&limit=${PAGE_SIZE}`,
      { headers: { Cookie: cookieHeader }, cache: "no-store" },
    );
    if (res.ok) initial = await res.json();
  } catch {
    initial = null;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">Manage Admins</h1>
      <AdminsTable initial={initial} pageSize={PAGE_SIZE} currentUserId={currentUser.id} />
    </div>
  );
}
