"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import type { Estate } from "@/lib/api";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";

const LOCATIONS = ["Lagos", "Asaba", "Anambra", "Abuja"];
const PURPOSES = ["Residential", "Commercial", "Investment"];

export default function EstatesTable({ initialEstates }: { initialEstates: Estate[] }) {
  const router = useRouter();
  const [estates, setEstates] = useState(initialEstates);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return estates.filter((e) => {
      if (location && e.location !== location) return false;
      if (purpose && e.purpose !== purpose) return false;
      if (q && !e.estate.toLowerCase().includes(q) && !e.address.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [estates, search, location, purpose]);

  const toggleMutation = useDashboardMutation<{ isActive: boolean }, Estate>({
    mutationFn: async (estate) => {
      const res = await dashboardFetch(`/api/estates/${estate._id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      return data;
    },
    onSuccess: (data, estate) => {
      setEstates((prev) => prev.map((e) => (e._id === estate._id ? { ...e, isActive: data.isActive } : e)));
    },
  });

  const deleteMutation = useDashboardMutation<unknown, Estate>({
    mutationFn: async (estate) => {
      const res = await dashboardFetch(`/api/estates/${estate._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete estate");
      return data;
    },
    onSuccess: (_data, estate) => {
      setEstates((prev) => prev.filter((e) => e._id !== estate._id));
    },
  });

  function handleDelete(estate: Estate) {
    if (!confirm(`Delete "${estate.estate}"? This cannot be undone.`)) return;
    deleteMutation.mutate(estate);
  }

  function isBusy(estateId: string) {
    return (
      (toggleMutation.isPending && toggleMutation.variables?._id === estateId) ||
      (deleteMutation.isPending && deleteMutation.variables?._id === estateId)
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex-1 sm:max-w-xs">
            <Input
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search estates…"
            />
          </div>
          <Select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All locations</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
          <Select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            <option value="">All purposes</option>
            {PURPOSES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>
        <Link href="/dashboard/estates/new" className={buttonClasses()}>
          <Plus size={16} />
          New Estate
        </Link>
      </div>

      <TableShell>
        <TableHeadRow headers={["Estate", "Location", "Purpose", "Price", "Status", ""]} />
        <TableBody>
          {filtered.map((estate) => (
            <tr key={estate._id} className="hover:bg-customPurple-50/30">
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-customBlack-900">{estate.estate}</p>
                <p className="text-xs text-customBlack-400">{estate.address}</p>
              </td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{estate.location}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{estate.purpose}</td>
              <td className="px-6 py-4 text-sm font-bold text-customPurple-700">₦{estate.price}</td>
              <td className="px-6 py-4">
                <button
                  onClick={() => toggleMutation.mutate(estate)}
                  disabled={isBusy(estate._id)}
                  className="disabled:opacity-50"
                >
                  <Badge tone={estate.isActive ? "green" : "gray"}>
                    {estate.isActive ? "Active" : "Inactive"}
                  </Badge>
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/estates/${estate._id}/edit`)}
                    aria-label="Edit"
                  >
                    <Pencil size={15} />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={() => handleDelete(estate)}
                    disabled={isBusy(estate._id)}
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && <TableEmptyRow colSpan={6} message="No estates match your filters." />}
        </TableBody>
      </TableShell>
    </div>
  );
}
