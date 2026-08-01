import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminOverview from "@/components/dashboard/AdminOverview";
import RealtorOverview from "@/components/dashboard/RealtorOverview";
import type { Analytics } from "@/components/dashboard/overview/types";

type CurrentUser = { role: "admin" | "realtor"; email: string };

// Role-based landing (PRD Phase 6 foundation). Admin sees the analytics
// summary already computed server-side (GET /api/admin/analytics); realtor
// sees their own recruit/referral summary (GET /api/realtors/dashboard).
// Full estate/subscription/inspection/etc. management pages are separate
// follow-ups — this proves the dashboard shell + role split end to end.
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const meRes = await fetch(`${apiBase}/api/auth/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!meRes.ok) redirect("/login");
  const me: CurrentUser = await meRes.json();

  if (me.role === "admin") {
    const res = await fetch(`${apiBase}/api/admin/analytics`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    const analytics: Analytics | null = res.ok ? await res.json() : null;

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

  const res = await fetch(`${apiBase}/api/realtors/dashboard`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  const summary = res.ok ? await res.json() : null;

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
