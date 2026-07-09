import { cookies } from "next/headers";
import type { Estate } from "@/lib/api";
import EstatesTable from "@/components/dashboard/estates/EstatesTable";

type EstateListResponse = { estates: Estate[]; total: number; pages: number };

const PAGE_SIZE = 100; // estateQuerySchema caps limit at 100

async function fetchEstatesPage(cookieHeader: string, page: number): Promise<EstateListResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/estates?active=all&limit=${PAGE_SIZE}&page=${page}`,
    { headers: { Cookie: cookieHeader }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Failed to fetch estates (page ${page}): HTTP ${res.status}`);
  return res.json();
}

// Server Component — always fetches fresh (no-store), unlike the public
// site's cached getEstates(): an admin managing estates needs to see their
// own writes immediately and needs inactive estates too (active=all),
// neither of which the public cache is meant to serve. Fetches every page
// (the schema caps a single request at 100) rather than truncating the
// list once the catalogue grows past that.
export default async function ManageEstatesPage() {
  const cookieHeader = (await cookies()).toString();
  let estates: Estate[] = [];
  let loadError = false;

  try {
    const first = await fetchEstatesPage(cookieHeader, 1);
    estates = first.estates;
    if (first.pages > 1) {
      const rest = await Promise.all(
        Array.from({ length: first.pages - 1 }, (_, i) => fetchEstatesPage(cookieHeader, i + 2)),
      );
      estates = estates.concat(...rest.map((r) => r.estates));
    }
  } catch {
    loadError = true;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">Manage Estates</h1>
      {loadError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Couldn&rsquo;t load estates right now — please refresh.
        </p>
      ) : (
        <EstatesTable initialEstates={estates} />
      )}
    </div>
  );
}
