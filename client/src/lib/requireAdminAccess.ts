import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Server-only guard for admin-section Server Component pages. The sidebar
// already hides links an admin can't use, but that alone doesn't stop
// direct URL navigation — this is the actual gate, mirroring the
// GET /api/auth/me check dashboard/layout.tsx already does.
export async function requireAdminAccess(permissionKey?: string) {
  const cookieHeader = (await cookies()).toString();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) redirect("/login");

  const user = await res.json();

  if (user.role === "superadmin") return user;
  if (permissionKey && user.role === "admin" && user.permissions?.includes(permissionKey)) {
    return user;
  }

  redirect("/dashboard");
}
