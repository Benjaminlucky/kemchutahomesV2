import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminOverview from "@/components/dashboard/AdminOverview";
import RealtorOverview from "@/components/dashboard/RealtorOverview";
import type { Analytics } from "@/components/dashboard/overview/types";

type CurrentUser = { role: "admin" | "superadmin" | "realtor"; email: string };

// Role-based landing (PRD Phase 6 foundation). Admin sees the analytics
// summary already computed server-side (GET /api/admin/analytics); realtor
// sees their own recruit/referral summary (GET /api/realtors/dashboard).
// Full estate/subscription/inspection/etc. management pages are separate
// follow-ups — this proves the dashboard shell + role split end to end.
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  // A thrown fetch or non-JSON response used to be uncaught here, crashing
  // the whole route to app/error.tsx instead of just sending the visitor
  // back to /login (see the matching fix in dashboard/layout.tsx).
  //
  // TEMPORARY DIAGNOSTIC (remove once the realtor-login-loop bug is found):
  // dashboard/layout.tsx's own /api/auth/me check already passed by the
  // time this runs (otherwise it would have redirected first) — so if
  // *this* redundant check still fails, it's failing independently of
  // layout.tsx's. Surface why on the /login redirect itself.
  let me: CurrentUser | null = null;
  let failReason = "";
  try {
    const meRes = await fetch(`${apiBase}/api/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (meRes.ok) {
      me = await meRes.json();
    } else {
      const body = await meRes.text().catch(() => "");
      failReason = `page_status_${meRes.status}:${body.slice(0, 1000)}`;
      console.error("DashboardPage: /api/auth/me not ok:", meRes.status, body);
    }
  } catch (err) {
    failReason = `page_throw:${err instanceof Error ? err.message : String(err)}`;
    console.error("DashboardPage: failed to verify session:", err);
  }
  if (!me) redirect(`/login?authFailed=${encodeURIComponent(failReason)}`);

  if (me.role === "admin" || me.role === "superadmin") {
    let analytics: Analytics | null = null;
    try {
      const res = await fetch(`${apiBase}/api/admin/analytics`, {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      });
      if (res.ok) analytics = await res.json();
    } catch (err) {
      console.error("DashboardPage: failed to load admin analytics:", err);
    }

    return (
      <div>
        <h1 className="mb-1 text-2xl font-bold text-customBlack-900 sm:text-3xl">Admin Overview</h1>
        <p className="mb-7 text-sm text-customBlack-400">
          Network, revenue and pipeline health across Kemchuta Homes.
        </p>
        {analytics ? (
          <AdminOverview analytics={analytics} />
        ) : (
          <p className="text-gray-500">Couldn&rsquo;t load analytics right now — please refresh.</p>
        )}
      </div>
    );
  }

  let summary = null;
  try {
    const res = await fetch(`${apiBase}/api/realtors/dashboard`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) summary = await res.json();
  } catch (err) {
    console.error("DashboardPage: failed to load realtor dashboard summary:", err);
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">
        Welcome back{summary ? `, ${summary.name}` : ""}
      </h1>
      {summary ? (
        <RealtorOverview summary={summary} />
      ) : (
        <p className="text-gray-500">Couldn&rsquo;t load your dashboard right now — please refresh.</p>
      )}
    </div>
  );
}
