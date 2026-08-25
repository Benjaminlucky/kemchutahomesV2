import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import SubscriptionDetailView from "@/components/client-portal/SubscriptionDetailView";
import type { SubscriptionDetail } from "@/components/client-portal/types";

export const metadata = buildMetadata({
  title: "Subscription Details",
  description: "View your Kemchuta Homes land subscription — payment progress, schedule, and documents.",
  path: "/client/portal",
});

// GET /api/subscriptions/my/:id is scoped server-side to {_id, email:
// req.user.email} (see server/controllers/subscription.controller.js), so a
// 404 there also serves as the ownership check — a subscription belonging
// to another client 404s exactly like one that doesn't exist at all.
export default async function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  // A thrown fetch (network hiccup) used to be uncaught here, crashing the
  // page to app/error.tsx instead of just sending the visitor back to
  // /client/login — treat it the same as a failed/expired session below.
  let res: Response;
  try {
    res = await fetch(`${apiBase}/api/subscriptions/my/${id}`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
  } catch {
    redirect("/client/login");
  }

  if (res.status === 401) {
    redirect("/client/login");
  }
  // 400 (malformed id) and 404 (not found / not owned by this client) both
  // mean "there's no such subscription to show" from this page's point of
  // view — same outcome a bad URL always had before this endpoint existed.
  if (res.status === 400 || res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    redirect("/client/login");
  }

  // A non-JSON body on an ok response is equally unexpected — fail the
  // same way rather than crashing the page.
  let sub: SubscriptionDetail | null = null;
  try {
    sub = await res.json();
  } catch {
    sub = null;
  }
  if (!sub) {
    redirect("/client/login");
  }

  return (
    <div className="mx-auto w-11/12 max-w-3xl py-16 lg:w-10/12">
      <SubscriptionDetailView sub={sub} />
    </div>
  );
}
