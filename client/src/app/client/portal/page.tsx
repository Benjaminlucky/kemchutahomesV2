import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import LogoutButton from "@/components/client-auth/LogoutButton";
import OverviewSection from "@/components/client-portal/OverviewSection";
import type { ClientDashboard } from "@/components/client-portal/types";

export const metadata = buildMetadata({
  title: "My Portal",
  description: "Your Kemchuta Homes client portal.",
  path: "/client/portal",
});

type ClientProfile = {
  firstName: string;
  lastName: string;
  email: string;
};

// Server Component — forwards the incoming request's cookies to the API
// (which reads them via protectClient's cookie fallback, PRD FR-4) rather
// than fetching client-side, so the portal renders authenticated content
// in the initial HTML instead of flashing an empty/loading state first.
//
// proxy.ts guards this route optimistically (cookie present or not); this
// page does the real verification (session actually valid) and renders the
// dashboard overview. Subscription list/detail, inspections, and documents
// are separate follow-ups — this covers the Overview section only.
export default async function ClientPortalPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [profileRes, dashboardRes] = await Promise.all([
    fetch(`${apiBase}/api/clients/me`, { headers: { Cookie: cookieHeader }, cache: "no-store" }),
    fetch(`${apiBase}/api/clients/dashboard`, { headers: { Cookie: cookieHeader }, cache: "no-store" }),
  ]);

  if (!profileRes.ok) {
    // proxy.ts only checked that a cookie was present, not that it's still
    // valid (expired access token, revoked session, etc.) — this is the
    // real verification, and an invalid session sends the user back to
    // login rather than rendering an error.
    redirect("/client/login");
  }

  const client: ClientProfile = await profileRes.json();
  const dashboard: ClientDashboard | null = dashboardRes.ok ? await dashboardRes.json() : null;

  return (
    <div className="mx-auto w-11/12 max-w-5xl py-16 lg:w-10/12">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-widest text-customPurple-500 uppercase">Client Portal</p>
          <h1 className="mt-1 text-3xl font-bold text-customBlack-900">Welcome back, {client.firstName}</h1>
          <p className="mt-1 text-sm text-gray-500">{client.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/client/portal/inspections"
            className="inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold text-customPurple-600 transition-colors hover:bg-customPurple-50"
            style={{ borderColor: "rgba(112,12,235,0.35)" }}
          >
            <CalendarCheck size={15} />
            My Inspections
          </Link>
          <LogoutButton />
        </div>
      </div>

      {dashboard ? (
        <OverviewSection dashboard={dashboard} />
      ) : (
        <div className="rounded-2xl border border-customBlack-100 bg-white p-8 text-center text-gray-600">
          Couldn&rsquo;t load your dashboard right now — please refresh the page.
        </div>
      )}
    </div>
  );
}
