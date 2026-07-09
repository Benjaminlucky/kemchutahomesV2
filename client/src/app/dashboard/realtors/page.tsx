import { cookies } from "next/headers";
import RealtorsTable from "@/components/dashboard/realtors/RealtorsTable";
import type { RealtorListResponse } from "@/components/dashboard/realtors/types";

export const PAGE_SIZE = 10;

// Server Component — fetches page 1 with no search so RealtorsTable's first
// paint has data without a loading flash; subsequent page/search changes are
// handled entirely client-side via TanStack Query (see RealtorsTable).
export default async function ManageRealtorsPage() {
  const cookieHeader = (await cookies()).toString();
  let initial: RealtorListResponse | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/realtors?page=1&limit=${PAGE_SIZE}`,
      { headers: { Cookie: cookieHeader }, cache: "no-store" },
    );
    if (res.ok) initial = await res.json();
  } catch {
    initial = null;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">Manage Realtors</h1>
      <RealtorsTable initial={initial} pageSize={PAGE_SIZE} />
    </div>
  );
}
