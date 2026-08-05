"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  X,
  ImageOff,
  MapPin,
  Building2,
  ExternalLink,
  Video,
} from "lucide-react";
import type { Estate } from "@/lib/api";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { TableShell, TableHeadRow, TableBody, TableEmptyRow } from "@/components/ui/Table";
import EstateForm from "./EstateForm";

const LOCATIONS = ["Lagos", "Asaba", "Anambra", "Abuja"];
const PURPOSES = ["Residential", "Commercial", "Investment"];
const HEADERS = ["Estate", "Location", "Purpose", "Price", "Status", "Actions"];

const PUBLIC_SITE = "https://kemchutahomesltd.com";

export default function EstatesTable({ initialEstates }: { initialEstates: Estate[] }) {
  const [estates, setEstates] = useState(initialEstates);
  const [lastServerEstates, setLastServerEstates] = useState(initialEstates);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("");

  const [viewEstate, setViewEstate] = useState<Estate | null>(null);
  const [editEstate, setEditEstate] = useState<Estate | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Estate | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // The list is fetched by a Server Component (app/dashboard/estates/page.tsx,
  // cache: "no-store"), so the router.refresh() EstateForm fires after a save
  // re-runs that fetch and arrives here as a *new prop* — React keeps this
  // component's state across the refresh, so without this the table would keep
  // rendering the pre-edit rows until a full navigation.
  //
  // Adjusted during render, not in an effect: an effect would render the stale
  // rows once before correcting them, and React explicitly recommends this
  // shape for state that has to follow a prop
  // (react.dev/reference/react/useState#storing-information-from-previous-renders).
  // Server data is authoritative, so it also (correctly) supersedes any
  // optimistic toggle/delete edits made to `estates` before it arrived.
  if (lastServerEstates !== initialEstates) {
    setLastServerEstates(initialEstates);
    setEstates(initialEstates);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return estates.filter((e) => {
      if (location && e.location !== location) return false;
      if (purpose && e.purpose !== purpose) return false;
      if (q && !e.estate.toLowerCase().includes(q) && !e.address.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [estates, search, location, purpose]);

  const activeCount = useMemo(() => estates.filter((e) => e.isActive).length, [estates]);
  const isFiltered = Boolean(search.trim() || location || purpose);

  const toggleMutation = useDashboardMutation<{ isActive: boolean }, Estate>({
    mutationFn: async (estate) => {
      const res = await dashboardFetch(`/api/estates/${estate._id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      return data;
    },
    onSuccess: (data, estate) => {
      setEstates((prev) => prev.map((e) => (e._id === estate._id ? { ...e, isActive: data.isActive } : e)));
      // Keep an open View modal in step with the row behind it.
      setViewEstate((prev) => (prev && prev._id === estate._id ? { ...prev, isActive: data.isActive } : prev));
      setToast(`“${estate.estate}” is now ${data.isActive ? "active" : "inactive"}`);
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
      setDeleteTarget(null);
      setToast(`“${estate.estate}” deleted`);
    },
  });

  function isBusy(estateId: string) {
    return (
      (toggleMutation.isPending && toggleMutation.variables?._id === estateId) ||
      (deleteMutation.isPending && deleteMutation.variables?._id === estateId)
    );
  }

  function clearFilters() {
    setSearch("");
    setLocation("");
    setPurpose("");
  }

  return (
    <div>
      <Toast message={toast} onClose={() => setToast(null)} />

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Input
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search estates…"
              aria-label="Search estates by name or address"
              className={search ? "pr-9" : undefined}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Filter by location"
              className="flex-1 sm:flex-initial"
            >
              <option value="">All locations</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
            <Select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              aria-label="Filter by purpose"
              className="flex-1 sm:flex-initial"
            >
              <option value="">All purposes</option>
              {PURPOSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
        </div>
        <Button
          onClick={() => setCreating(true)}
          className="w-full bg-gradient-to-r from-customPurple-600 to-customPurple-500 shadow-lg shadow-customPurple-500/25 hover:from-customPurple-700 hover:to-customPurple-600 lg:w-auto"
        >
          <Plus size={16} />
          New Estate
        </Button>
      </div>

      {/* ── Result summary ───────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-customPurple-50 px-3 py-1.5 text-customPurple-700">
          {filtered.length} {filtered.length === 1 ? "estate" : "estates"}
          {isFiltered && ` of ${estates.length}`}
        </span>
        <span className="rounded-full bg-green-50 px-3 py-1.5 text-green-700">{activeCount} active</span>
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600">
          {estates.length - activeCount} inactive
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-customPurple-600 transition-colors hover:bg-customPurple-50"
          >
            <X size={12} />
            Clear filters
          </button>
        )}
      </div>

      {/* ── Desktop: the full table ──────────────────────────────────────────
          Switches at `lg`, one step later than the realtors table's `md`: the
          Estate column here carries a 56px thumbnail plus two lines of text,
          so six columns need ~900px. At 768 the table still fitted only the
          first two columns and pushed the Actions column — the whole point of
          this screen — off-canvas, which is exactly the condition the cards
          below exist to avoid. */}
      <TableShell className="hidden shadow-sm lg:block">
        <TableHeadRow headers={HEADERS} />
        <TableBody>
          {filtered.map((estate) => (
            <tr key={estate._id} className="transition-colors hover:bg-customPurple-50/30">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Thumb estate={estate} size={56} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-customBlack-900">{estate.estate}</p>
                    <p className="truncate text-xs text-customBlack-400">{estate.address}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{estate.location}</td>
              <td className="px-6 py-4 text-sm text-customBlack-600">{estate.purpose}</td>
              <td className="px-6 py-4 text-sm font-bold whitespace-nowrap text-customPurple-700">
                ₦{estate.price}
              </td>
              <td className="px-6 py-4">
                <StatusToggle
                  estate={estate}
                  disabled={isBusy(estate._id)}
                  onToggle={() => toggleMutation.mutate(estate)}
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" aria-label="View" onClick={() => setViewEstate(estate)}>
                    <Eye size={15} />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditEstate(estate)}>
                    <Pencil size={15} />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    aria-label="Delete"
                    onClick={() => setDeleteTarget(estate)}
                    disabled={isBusy(estate._id)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <TableEmptyRow colSpan={HEADERS.length} message="No estates match your filters." />
          )}
        </TableBody>
      </TableShell>

      {/* ── Mobile / tablet: one card per estate ──────────────────────────────
          Cards keep every field and every action reachable without the page
          ever scrolling sideways. The entrance animation is CSS, not
          framer-motion: rAF never fires in a hidden document, which left
          cards permanently invisible when this was tried on the realtors
          page (see .animate-enter-rise in globals.css). */}
      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {filtered.map((estate, i) => (
          <article
            key={estate._id}
            style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}
            className="animate-enter-rise flex flex-col overflow-hidden rounded-2xl border border-customBlack-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <Thumb estate={estate} size={64} />
              <div className="min-w-0 flex-1">
                <p className="text-base leading-snug font-bold break-words text-customBlack-900">
                  {estate.estate}
                </p>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-customBlack-400">
                  <MapPin size={12} className="mt-0.5 shrink-0" />
                  <span className="min-w-0 break-words">{estate.address}</span>
                </p>
              </div>
            </div>

            <dl className="mt-4 mb-4 grid grid-cols-2 gap-3">
              <CardField label="Location" value={estate.location} />
              <CardField label="Purpose" value={estate.purpose} />
              <CardField label="Price" value={`₦${estate.price}`} accent />
              <CardField label="Size" value={estate.sqm} />
            </dl>

            {/* mt-auto keeps the action row flush with the bottom of every
                card in a row, whatever the name/address above wraps to. */}
            <div className="mt-auto flex items-center justify-between gap-3 border-t border-customBlack-50 pt-3">
              <StatusToggle
                estate={estate}
                disabled={isBusy(estate._id)}
                onToggle={() => toggleMutation.mutate(estate)}
              />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="View" onClick={() => setViewEstate(estate)}>
                  <Eye size={16} />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditEstate(estate)}>
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="danger"
                  size="icon"
                  aria-label="Delete"
                  onClick={() => setDeleteTarget(estate)}
                  disabled={isBusy(estate._id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div
            role="status"
            className="rounded-2xl border border-customBlack-100 bg-white px-6 py-16 text-center text-sm text-gray-400 sm:col-span-2"
          >
            No estates match your filters.
          </div>
        )}
      </div>

      {/* ── View details ─────────────────────────────────────────────────── */}
      <Modal
        open={!!viewEstate}
        onClose={() => setViewEstate(null)}
        title="Estate Details"
        maxWidth="max-w-3xl"
      >
        {viewEstate && <EstateDetails estate={viewEstate} />}
      </Modal>

      {/* ── Create / edit ─────────────────────────────────────────────────────
          Both host the same EstateForm rather than a /new and /[id]/edit page
          each, so the form's field logic can only ever live in one place. */}
      <Modal open={creating} onClose={() => setCreating(false)} title="New Estate" maxWidth="max-w-3xl">
        <EstateForm
          onSuccess={() => {
            setCreating(false);
            setToast("Estate created successfully");
          }}
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <Modal
        open={!!editEstate}
        onClose={() => setEditEstate(null)}
        title="Edit Estate"
        maxWidth="max-w-3xl"
      >
        {editEstate && (
          <EstateForm
            // Remount on a different estate so the form's useState initialisers
            // re-read the new estate's values instead of keeping the last one's.
            key={editEstate._id}
            estate={editEstate}
            onSuccess={() => {
              setEditEstate(null);
              setToast("Estate updated successfully");
            }}
            onCancel={() => setEditEstate(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete Estate?"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">{deleteTarget?.estate}</span>? Its images are
            removed from Cloudinary too. This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        icon={Trash2}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

// next/image throws on an empty src, and a Cloudinary asset deleted out from
// under a document renders as a broken image — both end up as the same
// placeholder here rather than a hole in the row.
function Thumb({ estate, size }: { estate: Estate; size: number }) {
  const [failed, setFailed] = useState(false);

  if (!estate.img || failed) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-xl bg-customPurple-50 text-customPurple-300"
        aria-hidden
      >
        <ImageOff size={Math.round(size / 3)} />
      </div>
    );
  }

  return (
    <Image
      src={estate.img}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-xl border border-customBlack-100 object-cover"
    />
  );
}

function StatusToggle({
  estate,
  disabled,
  onToggle,
}: {
  estate: Estate;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title={estate.isActive ? "Deactivate — hides it from the public site" : "Activate"}
      aria-label={`${estate.isActive ? "Deactivate" : "Activate"} ${estate.estate}`}
      className="rounded-full transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      <Badge tone={estate.isActive ? "green" : "gray"}>{estate.isActive ? "Active" : "Inactive"}</Badge>
    </button>
  );
}

function CardField({ label, value, accent }: { label: string; value?: string; accent?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold tracking-wider text-customBlack-300 uppercase">{label}</dt>
      <dd
        className={`mt-0.5 text-sm font-semibold break-words ${accent ? "text-customPurple-700" : "text-customBlack-700"}`}
      >
        {value || "-"}
      </dd>
    </div>
  );
}

function EstateDetails({ estate }: { estate: Estate }) {
  const publicUrl = `${PUBLIC_SITE}/estate/${estate.slug}`;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-customBlack-100 bg-customBlack-50">
        <Cover estate={estate} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={estate.isActive ? "green" : "gray"}>{estate.isActive ? "Active" : "Inactive"}</Badge>
        <Badge tone="purple">{estate.purpose}</Badge>
        {estate.category && <Badge tone="amber">{estate.category}</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailItem label="Estate Name" value={estate.estate} />
        <DetailItem label="Address" value={estate.address} />
        <DetailItem label="Location" value={estate.location} />
        <DetailItem label="Purpose" value={estate.purpose} />
        <DetailItem label="Title" value={estate.title} />
        <DetailItem label="Price" value={`₦${estate.price}`} />
        <DetailItem label="Size" value={estate.sqm} />
        <DetailItem label="Category" value={estate.category} />
        <DetailItem label="Deposit" value={estate.depositPercentage} />
        <DetailItem label="Slug" value={estate.slug} />
        <DetailItem
          label="Created"
          value={estate.createdAt ? new Date(estate.createdAt).toLocaleString() : undefined}
        />
        <DetailItem
          label="Last Updated"
          value={estate.updatedAt ? new Date(estate.updatedAt).toLocaleString() : undefined}
        />
      </div>

      <Section title="Description">
        <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">{estate.desc || "-"}</p>
      </Section>

      {estate.gallery?.length > 0 && (
        <Section title={`Gallery (${estate.gallery.length})`}>
          <div className="flex flex-wrap gap-3">
            {estate.gallery.map((img) => (
              <GalleryThumb key={img.publicId} url={img.url} />
            ))}
          </div>
        </Section>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Section title="Amenities">
          <TagList items={(estate.amenities ?? []).map((a) => a.name)} />
        </Section>
        <Section title="Neighborhood">
          <TagList items={(estate.neighborhood ?? []).map((n) => n.name)} />
        </Section>
      </div>

      <Section title="Payment Plans">
        {estate.paymentPlan?.length ? (
          // Its own overflow container — a wide plan table must scroll inside
          // the modal, never widen the modal (or the page) itself.
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Plot", "Outright", "Initial Deposit"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-xs font-bold tracking-wider text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estate.paymentPlan.map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap text-gray-900">{p.plot}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-700">{p.outright}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-700">{p.initialDeposit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyNote>No payment plans set.</EmptyNote>
        )}
      </Section>

      {estate.videos?.length > 0 && (
        <Section title="Videos">
          <ul className="space-y-2">
            {estate.videos.map((v) => (
              <li key={v.videoId}>
                <a
                  href={`https://www.youtube.com/watch?v=${v.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-2 text-sm font-medium break-all text-customPurple-700 hover:underline"
                >
                  <Video size={16} className="shrink-0 text-red-500" />
                  {v.title || v.videoId}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="border-t border-customBlack-100 pt-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <ExternalLink size={16} className="text-customPurple-600" />
          Live page
        </label>
        {/* A wrapping block rather than a single-line input: a long slug would
            otherwise scroll out of sight with no visible scrollbar. text-gray-900
            is explicit so it can't inherit dark mode's near-white foreground
            onto this light panel. */}
        <div className="mt-3 flex items-start gap-2">
          <p className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm break-all text-gray-900">
            {publicUrl}
          </p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open the live estate page in a new tab"
            className="shrink-0 rounded-lg bg-customPurple-600 p-3 text-white shadow-md transition-colors hover:bg-customPurple-700"
          >
            <ExternalLink size={20} />
          </a>
        </div>
        {!estate.isActive && (
          <p className="mt-2 text-xs text-amber-600">
            This estate is inactive, so the public page currently 404s.
          </p>
        )}
      </div>
    </div>
  );
}

function Cover({ estate }: { estate: Estate }) {
  const [failed, setFailed] = useState(false);

  if (!estate.img || failed) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center text-customBlack-200">
        <Building2 size={48} />
      </div>
    );
  }

  return (
    <Image
      src={estate.img}
      alt={estate.estate}
      width={1200}
      height={675}
      onError={() => setFailed(true)}
      className="aspect-[16/9] w-full object-cover"
    />
  );
}

function GalleryThumb({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-[70px] w-[90px] items-center justify-center rounded-lg bg-customPurple-50 text-customPurple-300">
        <ImageOff size={20} />
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt=""
      width={90}
      height={70}
      onError={() => setFailed(true)}
      className="h-[70px] w-[90px] rounded-lg border border-customBlack-100 object-cover"
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-customBlack-900">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-customPurple-500 to-customPurple-700" />
        {title}
      </h4>
      {children}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <label className="text-xs font-semibold tracking-wider text-gray-600 uppercase">{label}</label>
      <p className="mt-2 font-medium break-words text-gray-900">{value || "-"}</p>
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  if (!items.length) return <EmptyNote>None listed.</EmptyNote>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-customPurple-50 px-3 py-1.5 text-xs font-semibold text-customPurple-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400">{children}</p>;
}
