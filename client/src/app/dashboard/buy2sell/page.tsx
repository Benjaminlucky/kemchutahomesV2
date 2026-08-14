import { cookies } from "next/headers";
import Buy2SellPanel from "@/components/dashboard/buy2sell/Buy2SellPanel";
import type { LeadListResponse, ROISettings } from "@/components/dashboard/buy2sell/types";
import { requireAdminAccess } from "@/lib/requireAdminAccess";

export const PAGE_SIZE = 20;

export default async function ManageBuy2SellPage() {
  await requireAdminAccess("buy2sell");
  const cookieHeader = (await cookies()).toString();
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  let initialLeads: LeadListResponse | null = null;
  let initialRoi: ROISettings | null = null;

  try {
    const [leadsRes, roiRes] = await Promise.all([
      fetch(`${base}/api/buy2sell/leads?page=1&limit=${PAGE_SIZE}`, { headers: { Cookie: cookieHeader }, cache: "no-store" }),
      fetch(`${base}/api/buy2sell/roi`, { headers: { Cookie: cookieHeader }, cache: "no-store" }),
    ]);
    if (leadsRes.ok) initialLeads = await leadsRes.json();
    if (roiRes.ok) initialRoi = await roiRes.json();
  } catch {
    initialLeads = null;
    initialRoi = null;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">Buy2Sell — Investments & ROI</h1>
      <Buy2SellPanel initialLeads={initialLeads} initialRoi={initialRoi} pageSize={PAGE_SIZE} />
    </div>
  );
}
