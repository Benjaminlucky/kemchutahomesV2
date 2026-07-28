import { cookies } from "next/headers";
import EarningsPanel from "@/components/dashboard/earnings/EarningsPanel";
import type { MyCommissionsResponse } from "@/components/dashboard/earnings/types";

export const PAGE_SIZE = 15;

export default async function EarningsPage() {
  const cookieHeader = (await cookies()).toString();
  let initial: MyCommissionsResponse | null = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/commissions/my?page=1&limit=${PAGE_SIZE}`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) initial = await res.json();
  } catch {
    initial = null;
  }

  return <EarningsPanel initial={initial} pageSize={PAGE_SIZE} />;
}
