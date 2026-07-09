import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

type CurrentUser = {
  role: "admin" | "realtor";
  email: string;
  firstName?: string;
  lastName?: string;
};

// Server Component — forwards the incoming request's cookies to
// GET /api/auth/me (protect() resolves Admin-or-Realtor generically; see
// server/controllers/auth.controller.js) to determine which sidebar to
// render. proxy.ts only checks that a cookie is present; this is the real
// verification, matching the pattern already used for /client/portal.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/login");
  }

  const user: CurrentUser = await res.json();

  return <DashboardShell role={user.role === "admin" ? "admin" : "realtor"}>{children}</DashboardShell>;
}
