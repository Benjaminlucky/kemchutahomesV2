import { cookies } from "next/headers";
import SubscriptionsTable from "@/components/dashboard/subscriptions/SubscriptionsTable";
import type { SubscriptionListResponse } from "@/components/dashboard/subscriptions/types";
import { requireAdminAccess } from "@/lib/requireAdminAccess";

export const PAGE_SIZE = 20;

export default async function ManageSubscriptionsPage() {
  await requireAdminAccess("manage_subscriptions");
  const cookieHeader = (await cookies()).toString();
  let initial: SubscriptionListResponse | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscriptions?page=1&limit=${PAGE_SIZE}`,
      { headers: { Cookie: cookieHeader }, cache: "no-store" },
    );
    if (res.ok) initial = await res.json();
  } catch {
    initial = null;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">Manage Subscriptions</h1>
      <SubscriptionsTable initial={initial} pageSize={PAGE_SIZE} />
    </div>
  );
}
