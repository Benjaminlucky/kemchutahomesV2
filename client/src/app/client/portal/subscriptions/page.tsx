import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import SubscriptionsListSection from "@/components/client-portal/SubscriptionsListSection";
import type { PortalSubscription } from "@/components/client-portal/types";

export const metadata = buildMetadata({
  title: "My Subscriptions",
  description: "Track your Kemchuta Homes land subscription applications.",
  path: "/client/portal/subscriptions",
});

export default async function ClientSubscriptionsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  // A thrown fetch (network hiccup) or non-JSON response used to be
  // uncaught here, crashing the page to app/error.tsx instead of just
  // sending the visitor back to /client/login.
  let subscriptions: PortalSubscription[] | null = null;
  try {
    const res = await fetch(`${apiBase}/api/subscriptions/my`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) subscriptions = await res.json();
  } catch {
    subscriptions = null;
  }

  if (!subscriptions) {
    redirect("/client/login");
  }

  return (
    <div className="mx-auto w-11/12 max-w-4xl py-16 lg:w-10/12">
      <SubscriptionsListSection subscriptions={subscriptions} />
    </div>
  );
}
