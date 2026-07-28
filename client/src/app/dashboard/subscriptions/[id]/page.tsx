import { cookies } from "next/headers";
import SubscriptionProfile from "@/components/dashboard/subscriptions/SubscriptionProfile";
import type { SubscriptionDetail } from "@/components/dashboard/subscriptions/types";

export default async function SubscriptionProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieHeader = (await cookies()).toString();
  let initial: SubscriptionDetail | null = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscriptions/${id}`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) initial = await res.json();
  } catch {
    initial = null;
  }

  return <SubscriptionProfile initial={initial} />;
}
