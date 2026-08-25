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
  //
  // TEMPORARY DIAGNOSTIC (remove once the realtor-login-loop bug is found):
  // a valid-looking access_token cookie is still landing here as "not
  // authenticated" for at least one real account, with nothing in the
  // Netlify function logs — because a normal non-2xx response never hit the
  // catch block below. Surface the real status/body on the /login redirect
  // itself instead of requiring log access.
  let user: CurrentUser | null = null;
  let failReason = "";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (res.ok) {
      user = await res.json();
    } else {
      const body = await res.text().catch(() => "");
      failReason = `status_${res.status}:${body.slice(0, 120)}`;
      console.error("DashboardLayout: /api/auth/me not ok:", res.status, body);
    }
  } catch (err) {
    failReason = `throw:${err instanceof Error ? err.message : String(err)}`;
    console.error("DashboardLayout: failed to verify session:", err);
  }

  if (!user) {
    redirect(`/login?authFailed=${encodeURIComponent(failReason)}`);
  }

  return (
    <DashboardShell role={user.role} permissions={user.permissions}>
      {children}
    </DashboardShell>
  );
}
