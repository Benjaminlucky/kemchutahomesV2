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

  const res = await fetch(`${apiBase}/api/subscriptions/my`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/client/login");
  }

  const subscriptions: PortalSubscription[] = await res.json();

  return (
    <div className="mx-auto w-11/12 max-w-4xl py-16 lg:w-10/12">
      <SubscriptionsListSection subscriptions={subscriptions} />
    </div>
  );
}
