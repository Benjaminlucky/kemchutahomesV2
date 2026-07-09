import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Building2,
  AlertTriangle,
  ArrowRight,
  Info,
  BarChart3,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PURPLE = "#700CEB";
const DARK = "#3F0C91";

// ── Helpers ───────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem("token");
const fmtNGN = (n = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  pending: {
    label: "Pending",
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.25)",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    icon: CheckCircle,
  },
  paid: {
    label: "Paid",
    color: "#700CEB",
    bg: "rgba(112,12,235,0.1)",
    border: "rgba(112,12,235,0.25)",
    icon: Wallet,
  },
  clawedback: {
    label: "Reversed",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.25)",
    icon: XCircle,
  },
};

const LEVEL_COLORS = ["", "#700CEB", "#059669", "#d97706", "#0891b2"];
const LEVEL_LABELS = [
  "",
  "Direct Sale (L1)",
  "Recruiter Override (L2)",
  "Upline Override (L3)",
  "Top Level (L4)",
];

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "22px 24px",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: "absolute",
          top: -16,
          right: -16,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `${color}10`,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          {label}
        </p>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${color}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: "#0f0a1e",
          letterSpacing: "-0.04em",
          margin: "0 0 4px",
        }}
      >
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{sub}</p>
      )}
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  const Icon = s.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      <Icon size={10} />
      {s.label}
    </span>
  );
}

function LevelBadge({ level }) {
  const color = LEVEL_COLORS[level] || PURPLE;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 800,
        background: `${color}12`,
        color,
        border: `1px solid ${color}22`,
      }}
    >
      L{level}
    </span>
  );
}

function CommissionRow({ commission, index }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.04 }}
        onClick={() => setOpen((o) => !o)}
        style={{ cursor: "pointer" }}
        className="hover:bg-purple-50/30 transition-colors"
      >
        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <Building2 size={13} style={{ color: "#9ca3af" }} />
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0f0a1e",
                  margin: 0,
                }}
              >
                {commission.estateName || "—"}
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  margin: 0,
                  fontFamily: "monospace",
                }}
              >
                {commission.referenceNumber || "—"}
              </p>
            </div>
          </div>
        </td>
        <td className="px-5 py-3">
          <LevelBadge level={commission.level} />
          <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
            {LEVEL_LABELS[commission.level] || ""}
          </p>
        </td>
        <td className="px-5 py-3">
          <p
            style={{ fontSize: 13, fontWeight: 800, color: PURPLE, margin: 0 }}
          >
            {fmtNGN(commission.netAmount)}
          </p>
          <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>
            {commission.percent}% of {fmtNGN(commission.saleAmount)}
          </p>
        </td>
        <td className="px-5 py-3">
          <StatusBadge status={commission.status} />
        </td>
        <td className="px-5 py-3 text-right">
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
            {fmtDate(commission.createdAt)}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 2,
            }}
          >
            {open ? (
              <ChevronUp size={13} style={{ color: "#9ca3af" }} />
            ) : (
              <ChevronDown size={13} style={{ color: "#9ca3af" }} />
            )}
          </div>
        </td>
      </motion.tr>

      {/* Expanded detail row */}
      <AnimatePresence>
        {open && (
          <tr>
            <td colSpan={5} style={{ padding: 0, borderBottom: "none" }}>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    margin: "0 16px 12px",
                    background: "rgba(112,12,235,0.03)",
                    border: "1px solid rgba(112,12,235,0.1)",
                    borderRadius: 12,
                    padding: "14px 18px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 12,
                  }}
                >
                  {[
                    ["Sale Amount", fmtNGN(commission.saleAmount)],
                    ["Gross Commission", fmtNGN(commission.grossAmount)],
                    ["WHT Deducted", fmtNGN(commission.whtAmount)],
                    ["Net Payable", fmtNGN(commission.netAmount)],
                    [
                      "Clawback Window",
                      commission.finalAt
                        ? `Until ${fmtDate(commission.finalAt)}`
                        : "—",
                    ],
                    [
                      "Paid On",
                      commission.paidAt
                        ? fmtDate(commission.paidAt)
                        : "Pending",
                    ],
                  ].map(([lbl, val]) => (
                    <div key={lbl}>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          margin: "0 0 2px",
                        }}
                      >
                        {lbl}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0f0a1e",
                          margin: 0,
                        }}
                      >
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ h = 16, w = "100%" }) {
  return (
    <div
      className="animate-pulse rounded-xl"
      style={{ height: h, width: w, background: "rgba(0,0,0,0.06)" }}
    />
  );
}

// ── Main Earnings Page ────────────────────────────────────────────────────────
export default function Earnings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (status) params.set("status", status);

      const res = await axios.get(`${BASE_URL}/api/commissions/my?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load earnings");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived totals from the `totals` aggregate array ──────────────────────
  const byStatus = (key) => {
    if (!data?.totals) return 0;
    const row = data.totals.find((t) => t._id === key);
    return row?.totalNet || 0;
  };
  const totalEarned = (data?.totals || []).reduce(
    (acc, t) => acc + (t.totalNet || 0),
    0,
  );
  const pendingAmount = byStatus("pending");
  const approvedAmount = byStatus("approved");
  const paidAmount = byStatus("paid");
  const totalCount = data?.total || 0;

  // ── Level breakdown from commission records ────────────────────────────────
  const levelBreakdown = [1, 2, 3, 4]
    .map((lvl) => {
      const rows = (data?.commissions || []).filter((c) => c.level === lvl);
      const total = rows.reduce((acc, c) => acc + c.netAmount, 0);
      return { level: lvl, count: rows.length, total };
    })
    .filter((l) => l.count > 0);

  const STATUS_FILTERS = [
    { key: "", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "paid", label: "Paid" },
    { key: "clawedback", label: "Reversed" },
  ];

  return (
    <div className="space-y-6 mt-4 sm:mt-8 pb-10">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-7 rounded-full"
            style={{
              background: `linear-gradient(to bottom,${DARK},${PURPLE})`,
            }}
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              My Earnings
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Commission earned from your property sales
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setPage(1);
            load();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ── Error state ───────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* ── KPI stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: 24,
                border: "1px solid rgba(0,0,0,0.07)",
              }}
            >
              <Skeleton h={10} w="60%" />
              <div style={{ marginTop: 14 }}>
                <Skeleton h={28} w="80%" />
              </div>
              <div style={{ marginTop: 8 }}>
                <Skeleton h={10} w="50%" />
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="Total Earned"
              value={fmtNGN(totalEarned)}
              icon={BarChart3}
              color={PURPLE}
              sub={`${totalCount} commission${totalCount !== 1 ? "s" : ""}`}
              delay={0}
            />
            <StatCard
              label="Pending"
              value={fmtNGN(pendingAmount)}
              icon={Clock}
              color="#d97706"
              sub="Awaiting clawback window"
              delay={0.06}
            />
            <StatCard
              label="Approved"
              value={fmtNGN(approvedAmount)}
              icon={CheckCircle}
              color="#059669"
              sub="Ready for payout"
              delay={0.12}
            />
            <StatCard
              label="Paid Out"
              value={fmtNGN(paidAmount)}
              icon={Wallet}
              color={PURPLE}
              sub="Received in full"
              delay={0.18}
            />
          </>
        )}
      </div>

      {/* ── How commissions work info box ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: "rgba(112,12,235,0.04)",
          border: "1px solid rgba(112,12,235,0.12)",
          borderRadius: 16,
          padding: "14px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <Info
          size={16}
          style={{ color: PURPLE, flexShrink: 0, marginTop: 1 }}
        />
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: DARK,
              margin: "0 0 3px",
            }}
          >
            How Your Commissions Work
          </p>
          <p
            style={{
              fontSize: 11,
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            You earn <strong>10%</strong> on every direct sale you close (Level
            1). You also earn override commissions when realtors you recruited
            make sales —<strong> 5%</strong> (L2), <strong>3%</strong> (L3),{" "}
            <strong>2%</strong> (L4). WHT of <strong>5%</strong> is deducted
            before payout. Commissions are held for a <strong>90-day</strong>{" "}
            clawback window then auto-approved.
          </p>
        </div>
      </motion.div>

      {/* ── Level breakdown (only shows if there are commissions) ─────── */}
      {!loading && levelBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "20px 24px",
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.09em",
              margin: "0 0 14px",
            }}
          >
            Earnings by Commission Level
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {levelBreakdown.map(({ level, count, total }) => {
              const maxTotal = Math.max(
                ...levelBreakdown.map((l) => l.total),
                1,
              );
              const pct = Math.round((total / maxTotal) * 100);
              const color = LEVEL_COLORS[level];
              return (
                <div key={level}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <LevelBadge level={level} />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        {LEVEL_LABELS[level]}
                      </span>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        ({count} sale{count !== 1 ? "s" : ""})
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color }}>
                      {fmtNGN(total)}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "#f3f4f6",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        height: "100%",
                        borderRadius: 6,
                        background: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Commission table ───────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        {/* Table header + filters */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#0f0a1e",
                  margin: 0,
                }}
              >
                Transaction History
              </p>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
                {totalCount} commission records
              </p>
            </div>
          </div>
          {/* Status filter pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUS_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setStatus(key);
                  setPage(1);
                }}
                style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  background: status === key ? PURPLE : "#f3f4f6",
                  color: status === key ? "#fff" : "#6b7280",
                  transition: "all 0.2s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table body */}
        {loading ? (
          <div style={{ padding: 24 }} className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} h={44} />
            ))}
          </div>
        ) : !data?.commissions?.length ? (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <Wallet
              size={40}
              style={{ color: "#e5e7eb", margin: "0 auto 12px" }}
            />
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#9ca3af",
                margin: "0 0 6px",
              }}
            >
              {status
                ? `No ${STATUS[status]?.label || status} commissions`
                : "No commissions yet"}
            </p>
            <p style={{ fontSize: 13, color: "#d1d5db", margin: 0 }}>
              {status
                ? "Try a different filter above"
                : "Your earnings will appear here once you close your first sale."}
            </p>
            {!status && (
              <div style={{ marginTop: 20 }}>
                <a
                  href="/developments"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 20px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                    textDecoration: "none",
                  }}
                >
                  View Available Estates <ArrowRight size={14} />
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9f9fb" }}>
                  {[
                    "Estate / Reference",
                    "Level",
                    "Commission",
                    "Status",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 20px",
                        textAlign: "left",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                {data.commissions.map((c, i) => (
                  <CommissionRow key={c._id} commission={c} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {(data?.pages || 0) > 1 && (
          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Page {page} of {data.pages}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: "#fff",
                  color: "#6b7280",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  opacity: page === 1 ? 0.4 : 1,
                }}
              >
                ← Prev
              </button>
              <button
                disabled={page === data.pages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: "#fff",
                  color: "#6b7280",
                  cursor: page === data.pages ? "not-allowed" : "pointer",
                  opacity: page === data.pages ? 0.4 : 1,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Payout note ───────────────────────────────────────────────── */}
      <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
        Payout requests are processed by the admin team. Contact{" "}
        <a
          href="mailto:info@kemchutahomesltd.com"
          style={{ color: PURPLE, fontWeight: 700 }}
        >
          info@kemchutahomesltd.com
        </a>{" "}
        to request your approved earnings.
      </p>
    </div>
  );
}
