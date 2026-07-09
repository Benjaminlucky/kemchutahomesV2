"use client";

import { Fragment, useMemo, useState } from "react";
import { Search, MessageSquare, Save } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { fmtDate } from "@/components/client-portal/portalFormat";
import type { Inspection } from "./types";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { TONES, type BadgeTone } from "@/components/ui/Badge";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";

const STATUSES: Inspection["status"][] = ["pending", "confirmed", "cancelled", "completed"];

const STATUS_TONE: Record<Inspection["status"], BadgeTone> = {
  pending: "amber",
  confirmed: "purple",
  completed: "green",
  cancelled: "red",
};

export default function InspectionsTable({ initialInspections }: { initialInspections: Inspection[] }) {
  const [inspections, setInspections] = useState(initialInspections);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [notesOpenId, setNotesOpenId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inspections.filter((i) => {
      if (statusFilter && i.status !== statusFilter) return false;
      if (q) {
        const haystack = `${i.estateName} ${i.firstName} ${i.lastName} ${i.email}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [inspections, search, statusFilter]);

  const statusMutation = useDashboardMutation<unknown, { inspection: Inspection; status: Inspection["status"] }>({
    mutationFn: async ({ inspection, status }) => {
      const res = await dashboardFetch(`/api/inspections/${inspection._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      return data;
    },
    onSuccess: (_data, { inspection, status }) => {
      setInspections((prev) => prev.map((i) => (i._id === inspection._id ? { ...i, status } : i)));
    },
  });

  const notesMutation = useDashboardMutation<unknown, { inspection: Inspection; notes: string }>({
    mutationFn: async ({ inspection, notes }) => {
      const res = await dashboardFetch(`/api/inspections/${inspection._id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update notes");
      return data;
    },
    onSuccess: (_data, { inspection, notes }) => {
      setInspections((prev) => prev.map((i) => (i._id === inspection._id ? { ...i, notes } : i)));
      setNotesOpenId(null);
    },
  });

  function openNotes(inspection: Inspection) {
    setNotesOpenId(inspection._id);
    setNotesDraft(inspection.notes);
  }

  function isBusy(inspectionId: string) {
    return (
      (statusMutation.isPending && statusMutation.variables?.inspection._id === inspectionId) ||
      (notesMutation.isPending && notesMutation.variables?.inspection._id === inspectionId)
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex-1 sm:max-w-xs">
          <Input
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inspections…"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </Select>
      </div>

      <TableShell>
        <TableHeadRow headers={["Estate", "Client", "Date", "Persons", "Status", "Notes"]} />
        <TableBody>
          {filtered.map((insp) => (
            <Fragment key={insp._id}>
              <tr className="hover:bg-customPurple-50/30">
                <td className="px-6 py-4 text-sm font-bold text-customBlack-900">{insp.estateName}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-customBlack-900">{insp.firstName} {insp.lastName}</p>
                  <p className="text-xs text-customBlack-400">{insp.email} · {insp.phone}</p>
                </td>
                <td className="px-6 py-4 text-sm text-customBlack-600">{fmtDate(insp.inspectionDate)}</td>
                <td className="px-6 py-4 text-sm text-customBlack-600">{insp.persons}</td>
                <td className="px-6 py-4">
                  <select
                    value={insp.status}
                    disabled={isBusy(insp._id)}
                    onChange={(e) =>
                      statusMutation.mutate({ inspection: insp, status: e.target.value as Inspection["status"] })
                    }
                    className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold disabled:opacity-50 ${TONES[STATUS_TONE[insp.status]]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => openNotes(insp)}
                    className="flex items-center gap-1.5 text-xs font-bold text-customPurple-600 hover:underline"
                  >
                    <MessageSquare size={13} />
                    {insp.notes ? "Edit" : "Add"}
                  </button>
                </td>
              </tr>
              {notesOpenId === insp._id && (
                <tr>
                  <td colSpan={6} className="bg-customPurple-50/40 px-6 pt-0 pb-4">
                    <div className="flex items-start gap-3 pt-3">
                      <Textarea
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => notesMutation.mutate({ inspection: insp, notes: notesDraft })}
                        disabled={isBusy(insp._id)}
                      >
                        <Save size={13} />
                        Save
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {filtered.length === 0 && <TableEmptyRow colSpan={6} message="No inspections match your filters." />}
        </TableBody>
      </TableShell>
    </div>
  );
}
