import { cookies } from "next/headers";
import InspectionsTable from "@/components/dashboard/inspections/InspectionsTable";
import type { Inspection } from "@/components/dashboard/inspections/types";

type InspectionListResponse = { inspections: Inspection[]; total: number; pages: number };

const PAGE_SIZE = 100;

async function fetchInspectionsPage(cookieHeader: string, page: number): Promise<InspectionListResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inspections?limit=${PAGE_SIZE}&page=${page}`,
    { headers: { Cookie: cookieHeader }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Failed to fetch inspections (page ${page}): HTTP ${res.status}`);
  return res.json();
}

export default async function ManageInspectionsPage() {
  const cookieHeader = (await cookies()).toString();
  let inspections: Inspection[] = [];
  let loadError = false;

  try {
    const first = await fetchInspectionsPage(cookieHeader, 1);
    inspections = first.inspections;
    if (first.pages > 1) {
      const rest = await Promise.all(
        Array.from({ length: first.pages - 1 }, (_, i) => fetchInspectionsPage(cookieHeader, i + 2)),
      );
      inspections = inspections.concat(...rest.map((r) => r.inspections));
    }
  } catch {
    loadError = true;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-customBlack-900">Manage Inspections</h1>
        <p className="mt-1.5 text-sm text-customBlack-500">
          Log, track and confirm every site visit request from one place.
        </p>
      </header>
      {loadError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Couldn&rsquo;t load inspections right now — please refresh.
        </p>
      ) : (
        <InspectionsTable initialInspections={inspections} />
      )}
    </div>
  );
}
