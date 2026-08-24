import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

type CurrentUser = {
  role: "admin" | "superadmin" | "realtor";
  email: string;
  firstName?: string;
  lastName?: string;
  permissions?: string[];
};

// Server Component — forwards the incoming request's cookies to
// GET /api/auth/me (protect() resolves Admin-or-Realtor generically; see
// server/controllers/auth.controller.js) to determine which sidebar to
// render. proxy.ts only checks that a cookie is present; this is the real
// verification, matching the pattern already used for /client/portal.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  // A thrown fetch (network hiccup, DNS blip) or a non-JSON response body
  // used to be uncaught here, crashing the whole route to app/error.tsx
  // instead of just sending the visitor back to /login. Treat any failure
  // the same as "not authenticated."
  let user: CurrentUser | null = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (res.ok) {
      user = await res.json();
    }
  } catch (err) {
    console.error("DashboardLayout: failed to verify session:", err);
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell role={user.role} permissions={user.permissions}>
      {children}
    </DashboardShell>
  );
}
