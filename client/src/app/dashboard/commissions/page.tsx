import { cookies } from "next/headers";
import CommissionsPanel from "@/components/dashboard/commissions/CommissionsPanel";
import type { AdminCommissionListResponse, CommissionTierSettings } from "@/components/dashboard/commissions/types";

export const PAGE_SIZE = 20;

export default async function ManageCommissionsPage() {
  const cookieHeader = (await cookies()).toString();
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  let initialLedger: AdminCommissionListResponse | null = null;
  let initialTiers: CommissionTierSettings | null = null;

  try {
    const [ledgerRes, tiersRes] = await Promise.all([
      fetch(`${base}/api/commissions?page=1&limit=${PAGE_SIZE}`, { headers: { Cookie: cookieHeader }, cache: "no-store" }),
      fetch(`${base}/api/commissions/tiers`, { headers: { Cookie: cookieHeader }, cache: "no-store" }),
    ]);
    if (ledgerRes.ok) initialLedger = await ledgerRes.json();
    if (tiersRes.ok) initialTiers = await tiersRes.json();
  } catch {
    initialLedger = null;
    initialTiers = null;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">Commissions</h1>
      <CommissionsPanel initialLedger={initialLedger} initialTiers={initialTiers} pageSize={PAGE_SIZE} />
    </div>
  );
}
