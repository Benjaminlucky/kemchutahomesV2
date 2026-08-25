import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Server-only guard for admin-section Server Component pages. The sidebar
// already hides links an admin can't use, but that alone doesn't stop
// direct URL navigation — this is the actual gate, mirroring the
// GET /api/auth/me check dashboard/layout.tsx already does.
export async function requireAdminAccess(permissionKey?: string) {
  const cookieHeader = (await cookies()).toString();

  // A thrown fetch (network hiccup) or non-JSON response used to be
  // uncaught here, crashing every page that calls this guard (12 of the
  // admin dashboard's pages) straight to app/error.tsx instead of just
  // sending the visitor back to /login — the same failure mode fixed in
  // dashboard/layout.tsx.
  let user: { id: string; role: string; permissions?: string[] } | null = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) user = await res.json();
  } catch {
    user = null;
  }
  if (!user) redirect("/login");

  if (user.role === "superadmin") return user;
  if (permissionKey && user.role === "admin" && user.permissions?.includes(permissionKey)) {
    return user;
  }

  redirect("/dashboard");
}
