import Link from "next/link";
import { ArrowLeft, Calendar, CalendarCheck } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { fmtDate } from "./portalFormat";
import type { PortalInspectionListResponse } from "./types";

const STATUSES = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

function buildHref(status: string, page: number) {
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (page > 1) qs.set("page", String(page));
  const query = qs.toString();
  return `/client/portal/inspections${query ? `?${query}` : ""}`;
}

export default function InspectionsSection({
  data,
  status,
  page,
}: {
  data: PortalInspectionListResponse;
  status: string;
  page: number;
}) {
  const { inspections, pages } = data;

  return (
    <div className="space-y-6">
      <Link
        href="/client/portal"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-customPurple-600 hover:text-customPurple-700"
      >
        <ArrowLeft size={16} /> Back to portal
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-customBlack-900">Inspection Bookings</h1>
          <p className="mt-1 text-sm text-customBlack-400">Your site visit schedule</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((s) => (
            <Link
              key={s.value || "all"}
              href={buildHref(s.value, 1)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                status === s.value ? "bg-customPurple-500 text-white shadow-md" : "bg-customBlack-50 text-customBlack-500 hover:bg-customPurple-50"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-customBlack-100 bg-white shadow-sm">
        {inspections.length === 0 ? (
          <div className="py-20 text-center">
            <CalendarCheck size={40} className="mx-auto mb-4 text-customBlack-200" />
            <p className="font-bold text-customBlack-500">No inspections found</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-customBlack-50/50">
                    {["Estate", "Date", "Persons", "Status", "Booked On"].map((h) => (
                      <th key={h} className="px-6 py-4 text-xs font-bold tracking-widest text-customBlack-400 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-customBlack-50">
                  {inspections.map((insp) => (
                    <tr key={insp._id} className="transition-colors hover:bg-customPurple-50/30">
                      <td className="px-6 py-4 text-sm font-bold text-customBlack-900">{insp.estateName}</td>
                      <td className="px-6 py-4 text-sm text-customBlack-600">
                        {new Date(insp.inspectionDate).toLocaleDateString("en-NG", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-customBlack-600">
                        {insp.persons} person{insp.persons > 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={insp.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-customBlack-400">{fmtDate(insp.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-customBlack-50 sm:hidden">
              {inspections.map((insp) => (
                <div key={insp._id} className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <p className="text-sm font-bold text-customBlack-900">{insp.estateName}</p>
                    <StatusBadge status={insp.status} />
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-customBlack-400">
                    <Calendar size={11} />
                    {new Date(insp.inspectionDate).toLocaleDateString("en-NG", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {insp.persons} person{insp.persons > 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 border-t border-customBlack-50 p-6">
                <Link
                  href={buildHref(status, Math.max(1, page - 1))}
                  aria-disabled={page <= 1}
                  className={`rounded-xl bg-customBlack-50 px-4 py-2 text-sm font-bold text-customBlack-500 transition hover:bg-customPurple-50 ${
                    page <= 1 ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  Previous
                </Link>
                <span className="text-sm text-customBlack-500">
                  Page {page} of {pages}
                </span>
                <Link
                  href={buildHref(status, Math.min(pages, page + 1))}
                  aria-disabled={page >= pages}
                  className={`rounded-xl bg-customBlack-50 px-4 py-2 text-sm font-bold text-customBlack-500 transition hover:bg-customPurple-50 ${
                    page >= pages ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
