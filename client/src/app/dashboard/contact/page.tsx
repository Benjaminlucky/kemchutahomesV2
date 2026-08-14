import { cookies } from "next/headers";
import BranchesPanel from "@/components/dashboard/branches/BranchesPanel";
import type { Branch } from "@/components/dashboard/branches/types";
import { requireAdminAccess } from "@/lib/requireAdminAccess";

// Nav label is "Contact Info" but the underlying resource is branch offices
// (server: /api/branches) — the public /contact page reads the same data.
export default async function ManageContactPage() {
  await requireAdminAccess("contact_info");
  const cookieHeader = (await cookies()).toString();
  let initial: Branch[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branches`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) initial = await res.json();
  } catch {
    initial = [];
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">Contact Info / Branches</h1>
      <BranchesPanel initial={initial} />
    </div>
  );
}
