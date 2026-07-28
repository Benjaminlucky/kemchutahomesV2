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

// GET /api/subscriptions/my is already scoped server-side to req.user.email
// (see server/controllers/subscription.controller.js), so finding by id in
// that list — rather than needing a dedicated single-subscription client
// endpoint — is also the ownership check: a subscription belonging to
// another client simply won't appear in this array.
export default async function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const res = await fetch(`${apiBase}/api/subscriptions/my`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/client/login");
  }

  const subscriptions: SubscriptionDetail[] = await res.json();
  const sub = subscriptions.find((s) => s._id === id);

  if (!sub) {
    notFound();
  }

  return (
    <div className="mx-auto w-11/12 max-w-3xl py-16 lg:w-10/12">
      <SubscriptionDetailView sub={sub} />
    </div>
  );
}
