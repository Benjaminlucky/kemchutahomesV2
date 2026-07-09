import { cookies } from "next/headers";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

type Recruit = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  referralCode: string;
  createdAt: string;
};

// Server Component only — read-only list, no client interactivity needed, so
// no JS ships for this route. GET /api/realtors/my-recruits already existed
// server-side but the legacy dashboard never wired a real UI to it (Recruits.jsx
// was a static "Recruits Page" placeholder) — this is a genuine first build,
// not a port of prior behavior.
export default async function RecruitsPage() {
  const cookieHeader = (await cookies()).toString();
  let recruits: Recruit[] = [];
  let loadError = false;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/realtors/my-recruits`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    recruits = data.recruits ?? [];
  } catch {
    loadError = true;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-customBlack-900">My Recruits</h1>
      {loadError ? (
        <ErrorBanner>Couldn&rsquo;t load your recruits right now — please refresh.</ErrorBanner>
      ) : (
        <TableShell>
          <TableHeadRow headers={["Name", "Email", "Phone", "Referral Code", "Joined"]} />
          <TableBody>
            {recruits.map((r) => (
              <tr key={r._id} className="hover:bg-customPurple-50/30">
                <td className="px-6 py-4 text-sm font-bold text-customBlack-900">{r.firstName} {r.lastName}</td>
                <td className="px-6 py-4 text-sm text-customBlack-600">{r.email}</td>
                <td className="px-6 py-4 text-sm text-customBlack-600">{r.phone || "-"}</td>
                <td className="px-6 py-4 text-sm text-customBlack-600">{r.referralCode}</td>
                <td className="px-6 py-4 text-sm text-customBlack-600">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {recruits.length === 0 && (
              <TableEmptyRow colSpan={5} message="No recruits yet — share your referral link to get started." />
            )}
          </TableBody>
        </TableShell>
      )}
    </div>
  );
}
