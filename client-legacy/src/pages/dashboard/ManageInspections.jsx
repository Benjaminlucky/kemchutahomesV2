import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  Calendar,
  Search,
  Eye,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Check,
  ChevronDown,
  Building2,
  User,
  Phone,
  Mail,
  Users,
  FileText,
  AlertTriangle,
  Filter,
  Download,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = () => localStorage.getItem("token");

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = ["pending", "confirmed", "cancelled", "completed"];

const STATUS_META = {
  pending: {
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.25)",
    icon: Clock,
    label: "Pending",
  },
  confirmed: {
    color: "#700CEB",
    bg: "rgba(112,12,235,0.1)",
    border: "rgba(112,12,235,0.25)",
    icon: CheckCircle2,
    label: "Confirmed",
  },
  cancelled: {
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.25)",
    icon: XCircle,
    label: "Cancelled",
  },
  completed: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    icon: Check,
    label: "Completed",
  },
};

// ── Fetcher ───────────────────────────────────────────────────────────────────
const fetcher = async (url) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to load inspections");
  return res.json();
};

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`,
      }}
    >
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

// ── Status Dropdown ────────────────────────────────────────────────────────────
function StatusDropdown({ current, onChange, loading }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[current] || STATUS_META.pending;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
        style={{
          background: meta.bg,
          color: meta.color,
          border: `1px solid ${meta.border}`,
        }}
      >
        {loading ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <meta.icon size={11} />
        )}
        {meta.label}
        <ChevronDown
          size={11}
          style={{
            opacity: 0.7,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute top-full mt-2 right-0 rounded-xl overflow-hidden z-50 min-w-[150px]"
            style={{
              background: "#fff",
              boxShadow:
                "0 12px 40px rgba(112,12,235,0.15), 0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid rgba(112,12,235,0.1)",
            }}
          >
            {STATUSES.map((s) => {
              const m = STATUS_META[s];
              const Icon = m.icon;
              return (
                <li
                  key={s}
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors"
                  style={{
                    color: s === current ? m.color : "#374151",
                    background: s === current ? m.bg : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (s !== current)
                      e.currentTarget.style.background =
                        "rgba(112,12,235,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (s !== current)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Icon size={12} style={{ color: m.color }} />
                  {m.label}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function InspectionDetailModal({ inspection, onClose, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState(inspection.notes || "");
  const [saving, setSaving] = useState(false);

  const dateStr = new Date(inspection.inspectionDate).toLocaleDateString(
    "en-NG",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      const res = await fetch(
        `${API_URL}/api/inspections/${inspection._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({ status }),
        },
      );
      if (!res.ok) throw new Error("Failed");
      onStatusChange(inspection._id, status);
    } catch {}
    setUpdating(false);
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${API_URL}/api/inspections/${inspection._id}/notes`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({ notes }),
        },
      );
      if (!res.ok) throw new Error("Failed");
    } catch {}
    setSaving(false);
  };

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div
      className="flex items-start gap-3 py-3"
      style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "rgba(112,12,235,0.08)" }}
      >
        <Icon size={14} style={{ color: "#700CEB" }} />
      </div>
      <div>
        <p
          style={{
            fontSize: 10,
            color: "#9ca3af",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: 14, color: "#0f0a1e", fontWeight: 600 }}>
          {value || "—"}
        </p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9995] flex items-center justify-center p-4"
      style={{ background: "rgba(8,4,20,0.75)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{
          background: "#fff",
          maxHeight: "90vh",
          boxShadow: "0 40px 100px rgba(112,12,235,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative px-7 py-6 shrink-0 overflow-hidden"
          style={{ background: "linear-gradient(135deg,#3F0C91,#700CEB)" }}
        >
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              background: "rgba(255,255,255,0.06)",
              borderRadius: "50%",
            }}
          />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Inspection Booking
              </p>
              <h2
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                {inspection.firstName} {inspection.lastName}
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 13,
                  marginTop: 3,
                }}
              >
                {inspection.estateName}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusDropdown
                current={inspection.status}
                onChange={handleStatusChange}
                loading={updating}
              />
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <DetailRow
                icon={Building2}
                label="Estate"
                value={inspection.estateName}
              />
              <DetailRow
                icon={Calendar}
                label="Inspection Date"
                value={dateStr}
              />
              <DetailRow
                icon={Users}
                label="Persons"
                value={`${inspection.persons} person${inspection.persons > 1 ? "s" : ""}`}
              />
            </div>
            <div>
              <DetailRow
                icon={User}
                label="Full Name"
                value={`${inspection.firstName} ${inspection.lastName}`}
              />
              <DetailRow icon={Mail} label="Email" value={inspection.email} />
              <DetailRow icon={Phone} label="Phone" value={inspection.phone} />
            </div>
          </div>

          {/* Notes */}
          <div className="mt-5">
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 8,
              }}
            >
              Admin Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this inspection..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{
                border: "1.5px solid rgba(112,12,235,0.15)",
                background: "#fafafa",
                color: "#0f0a1e",
                lineHeight: 1.7,
              }}
            />
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: "rgba(112,12,235,0.1)", color: "#700CEB" }}
            >
              {saving ? (
                <>
                  <Loader2 size={11} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check size={11} /> Save Notes
                </>
              )}
            </button>
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              {
                label: "Confirm",
                status: "confirmed",
                style: {
                  background: "rgba(112,12,235,0.08)",
                  color: "#700CEB",
                  border: "1px solid rgba(112,12,235,0.2)",
                },
              },
              {
                label: "Complete",
                status: "completed",
                style: {
                  background: "rgba(5,150,105,0.08)",
                  color: "#059669",
                  border: "1px solid rgba(5,150,105,0.2)",
                },
              },
              {
                label: "Cancel",
                status: "cancelled",
                style: {
                  background: "rgba(220,38,38,0.08)",
                  color: "#dc2626",
                  border: "1px solid rgba(220,38,38,0.2)",
                },
              },
              {
                label: "Pending",
                status: "pending",
                style: {
                  background: "rgba(217,119,6,0.08)",
                  color: "#d97706",
                  border: "1px solid rgba(217,119,6,0.2)",
                },
              },
            ]
              .filter((a) => a.status !== inspection.status)
              .slice(0, 2)
              .map((action) => (
                <button
                  key={action.status}
                  disabled={updating}
                  onClick={() => handleStatusChange(action.status)}
                  className="py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={action.style}
                >
                  {STATUS_META[action.status].icon &&
                    React.createElement(STATUS_META[action.status].icon, {
                      size: 14,
                    })}
                  Mark as {action.label}
                </button>
              ))}
          </div>

          {/* Meta */}
          <div
            className="mt-5 pt-4"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
              Booked on{" "}
              {new Date(inspection.createdAt).toLocaleDateString("en-NG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              at{" "}
              {new Date(inspection.createdAt).toLocaleTimeString("en-NG", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-5"
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <span
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: "#0f0a1e",
            letterSpacing: "-0.05em",
          }}
        >
          {value}
        </span>
      </div>
      <p
        style={{
          fontSize: 12,
          color: "#9ca3af",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </p>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ManageInspections() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewInspection, setViewInspection] = useState(null);
  const [updatingIds, setUpdatingIds] = useState(new Set());

  const limit = 12;

  const url = `${API_URL}/api/inspections?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`;

  const { data, error, mutate, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  const inspections = data?.inspections || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  // Compute stats from all data
  const { data: allData } = useSWR(
    `${API_URL}/api/inspections?limit=1000`,
    fetcher,
    { revalidateOnFocus: false },
  );
  const all = allData?.inspections || [];
  const stats = {
    total: all.length,
    pending: all.filter((i) => i.status === "pending").length,
    confirmed: all.filter((i) => i.status === "confirmed").length,
    completed: all.filter((i) => i.status === "completed").length,
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`${API_URL}/api/inspections/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      mutate(); // refresh list
      // Update viewed inspection if open
      if (viewInspection?._id === id) {
        setViewInspection((prev) => ({ ...prev, status }));
      }
    } catch {}
    setUpdatingIds((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  };

  const handleExport = () => {
    const rows = [
      ["Name", "Email", "Phone", "Estate", "Date", "Persons", "Status"],
      ...inspections.map((i) => [
        `${i.firstName} ${i.lastName}`,
        i.email,
        i.phone,
        i.estateName,
        new Date(i.inspectionDate).toLocaleDateString("en-NG"),
        i.persons,
        i.status,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv," + encodeURIComponent(csv);
    a.download = "inspections.csv";
    a.click();
  };

  return (
    <div className="space-y-6 mt-2">
      <AnimatePresence>
        {viewInspection && (
          <InspectionDetailModal
            inspection={viewInspection}
            onClose={() => setViewInspection(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#0f0a1e",
              letterSpacing: "-0.04em",
            }}
          >
            Manage Inspections
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>
            {total} booking{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm"
          style={{
            background: "rgba(112,12,235,0.08)",
            color: "#700CEB",
            border: "1px solid rgba(112,12,235,0.15)",
          }}
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={Calendar}
          color="#700CEB"
          delay={0}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="#d97706"
          delay={0.06}
        />
        <StatCard
          label="Confirmed"
          value={stats.confirmed}
          icon={CheckCircle2}
          color="#700CEB"
          delay={0.12}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={Check}
          color="#059669"
          delay={0.18}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-[200px]"
          style={{
            background: "#fff",
            border: "1.5px solid rgba(112,12,235,0.12)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Search size={14} style={{ color: "#700CEB" }} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, estate..."
            className="outline-none bg-transparent text-sm flex-1"
            style={{ color: "#0f0a1e" }}
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              <X size={14} style={{ color: "#9ca3af" }} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} style={{ color: "#9ca3af" }} />
          {["", ...STATUSES].map((s) => {
            const meta = s ? STATUS_META[s] : null;
            const active = statusFilter === s;
            return (
              <button
                key={s || "all"}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active
                    ? meta
                      ? meta.bg
                      : "rgba(112,12,235,0.1)"
                    : "#fff",
                  color: active ? (meta ? meta.color : "#700CEB") : "#6b7280",
                  border: active
                    ? `1.5px solid ${meta ? meta.border : "rgba(112,12,235,0.3)"}`
                    : "1.5px solid rgba(0,0,0,0.08)",
                }}
              >
                {s ? STATUS_META[s].label : "All"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2
            size={32}
            style={{ color: "#700CEB" }}
            className="animate-spin"
          />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <AlertTriangle size={32} style={{ color: "#dc2626" }} />
          <p style={{ color: "#dc2626", fontWeight: 600 }}>
            Failed to load inspections
          </p>
        </div>
      ) : inspections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(112,12,235,0.08)" }}
          >
            <Calendar size={28} style={{ color: "#700CEB" }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0f0a1e" }}>
            No inspections found
          </p>
          <p style={{ fontSize: 14, color: "#9ca3af" }}>
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div
            className="rounded-2xl overflow-hidden hidden md:block"
            style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            }}
          >
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(112,12,235,0.05),rgba(112,12,235,0.02))",
                    borderBottom: "1px solid rgba(112,12,235,0.08)",
                  }}
                >
                  {[
                    "Client",
                    "Estate",
                    "Date",
                    "Persons",
                    "Status",
                    "Booked",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left"
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#9ca3af",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inspections.map((ins, i) => {
                  const isUpdating = updatingIds.has(ins._id);
                  return (
                    <motion.tr
                      key={ins._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="group"
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(112,12,235,0.02)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td className="px-5 py-4">
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#0f0a1e",
                          }}
                        >
                          {ins.firstName} {ins.lastName}
                        </p>
                        <p style={{ fontSize: 12, color: "#6b7280" }}>
                          {ins.email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f0a1e",
                          }}
                          className="truncate max-w-[160px]"
                        >
                          {ins.estateName}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f0a1e",
                          }}
                        >
                          {new Date(ins.inspectionDate).toLocaleDateString(
                            "en-NG",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="flex items-center gap-1"
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f0a1e",
                          }}
                        >
                          <Users size={13} style={{ color: "#700CEB" }} />
                          {ins.persons}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusDropdown
                          current={ins.status}
                          onChange={(s) => handleStatusChange(ins._id, s)}
                          loading={isUpdating}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <p style={{ fontSize: 12, color: "#9ca3af" }}>
                          {new Date(ins.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setViewInspection(ins)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background: "rgba(112,12,235,0.08)",
                            color: "#700CEB",
                            border: "1px solid rgba(112,12,235,0.15)",
                          }}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {inspections.map((ins) => {
              const isUpdating = updatingIds.has(ins._id);
              return (
                <motion.div
                  key={ins._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-4"
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: "#0f0a1e",
                        }}
                      >
                        {ins.firstName} {ins.lastName}
                      </p>
                      <p style={{ fontSize: 12, color: "#6b7280" }}>
                        {ins.email}
                      </p>
                    </div>
                    <StatusBadge status={ins.status} />
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      <Building2
                        size={11}
                        style={{
                          display: "inline",
                          marginRight: 4,
                          color: "#700CEB",
                        }}
                      />
                      {ins.estateName}
                    </span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      <Calendar
                        size={11}
                        style={{
                          display: "inline",
                          marginRight: 4,
                          color: "#700CEB",
                        }}
                      />
                      {new Date(ins.inspectionDate).toLocaleDateString(
                        "en-NG",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      <Users
                        size={11}
                        style={{
                          display: "inline",
                          marginRight: 4,
                          color: "#700CEB",
                        }}
                      />
                      {ins.persons} person{ins.persons > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDropdown
                      current={ins.status}
                      onChange={(s) => handleStatusChange(ins._id, s)}
                      loading={isUpdating}
                    />
                    <button
                      onClick={() => setViewInspection(ins)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                      style={{
                        background: "rgba(112,12,235,0.08)",
                        color: "#700CEB",
                        border: "1px solid rgba(112,12,235,0.15)",
                      }}
                    >
                      <Eye size={13} /> Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span style={{ fontSize: 13, color: "#9ca3af" }}>
                Page {page} of {pages} — {total} total
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                  style={{
                    background: "#fff",
                    border: "1.5px solid rgba(112,12,235,0.12)",
                    color: "#700CEB",
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                  style={{ background: "#700CEB", color: "#fff" }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
