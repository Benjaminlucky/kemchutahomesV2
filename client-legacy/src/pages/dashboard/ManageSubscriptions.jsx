import React, { useState } from "react";
import SubscriptionProfile from "./SubscriptionProfile";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  Search,
  Eye,
  X,
  ChevronDown,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Users,
  Download,
  Loader2,
  AlertTriangle,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Check,
  TrendingUp,
  Calendar,
  CreditCard,
  Home,
  BarChart3,
  Printer,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const token = () => localStorage.getItem("token");

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = [
  "pending",
  "confirmed",
  "partial_paid",
  "outright_paid",
  "inst_1_paid",
  "inst_2_paid",
  "inst_3_paid",
  "inst_4_paid",
  "inst_5_paid",
  "inst_6_paid",
  "completed",
  "allocated",
  "rejected",
];

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
  partial_paid: {
    color: "#0284c7",
    bg: "rgba(2,132,199,0.1)",
    border: "rgba(2,132,199,0.25)",
    icon: CreditCard,
    label: "Partial Paid",
  },
  outright_paid: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    icon: Check,
    label: "Outright Paid",
  },
  inst_1_paid: {
    color: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    border: "rgba(8,145,178,0.25)",
    icon: CreditCard,
    label: "Inst 1 Paid",
  },
  inst_2_paid: {
    color: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    border: "rgba(8,145,178,0.25)",
    icon: CreditCard,
    label: "Inst 2 Paid",
  },
  inst_3_paid: {
    color: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    border: "rgba(8,145,178,0.25)",
    icon: CreditCard,
    label: "Inst 3 Paid",
  },
  inst_4_paid: {
    color: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    border: "rgba(8,145,178,0.25)",
    icon: CreditCard,
    label: "Inst 4 Paid",
  },
  inst_5_paid: {
    color: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    border: "rgba(8,145,178,0.25)",
    icon: CreditCard,
    label: "Inst 5 Paid",
  },
  inst_6_paid: {
    color: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    border: "rgba(8,145,178,0.25)",
    icon: CreditCard,
    label: "Inst 6 Paid",
  },
  completed: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    icon: CheckCircle2,
    label: "Completed",
  },
  allocated: {
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.25)",
    icon: Home,
    label: "Allocated",
  },
  rejected: {
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.25)",
    icon: XCircle,
    label: "Rejected",
  },
};

const PLOT_TYPE_COLOR = {
  Residential: { bg: "rgba(112,12,235,0.08)", color: "#700CEB", icon: Home },
  Commercial: { bg: "rgba(234,88,12,0.08)", color: "#ea580c", icon: Building2 },
  Investment: {
    bg: "rgba(5,150,105,0.08)",
    color: "#059669",
    icon: TrendingUp,
  },
};

const formatCurrency = (num) =>
  num
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
      }).format(num)
    : "—";

const formatDate = (d, opts = {}) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...opts,
      })
    : "—";

// ── Fetcher ───────────────────────────────────────────────────────────────────
const fetcher = async (url) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to load subscriptions");
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
      <Icon size={11} /> {meta.label}
    </span>
  );
}

// ── Inline Status Dropdown ────────────────────────────────────────────────────
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
              boxShadow: "0 12px 40px rgba(112,12,235,0.15)",
              border: "1px solid rgba(112,12,235,0.1)",
            }}
          >
            {STATUSES.map((s) => {
              const m = STATUS_META[s];
              return (
                <li
                  key={s}
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer"
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
                  <m.icon size={12} style={{ color: m.color }} /> {m.label}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub, delay = 0 }) {
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
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
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
      {sub && (
        <p style={{ fontSize: 11, color, fontWeight: 600, marginTop: 3 }}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}

// ── Detail Section Header ─────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-1">
      <div style={{ flex: 1, height: 1, background: "rgba(112,12,235,0.1)" }} />
      <div className="flex items-center gap-1.5">
        <Icon size={12} style={{ color: "#700CEB" }} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#700CEB",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          {children}
        </span>
      </div>
      <div style={{ flex: 1, height: 1, background: "rgba(112,12,235,0.1)" }} />
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div
      className="flex justify-between items-start py-2.5"
      style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
    >
      <span
        style={{
          fontSize: 12,
          color: "#9ca3af",
          fontWeight: 600,
          minWidth: 120,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "#0f0a1e",
          fontWeight: 700,
          textAlign: "right",
          maxWidth: 220,
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Print / Export single subscription ───────────────────────────────────────
function printSubscription(sub) {
  const w = window.open("", "_blank");
  const dateStr = formatDate(sub.inspectionDate);
  w.document.write(`
    <html><head><title>Subscription — ${sub.firstName} ${sub.lastName}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #0f0a1e; max-width: 720px; margin: 0 auto; }
      h1 { color: #700CEB; margin-bottom: 4px; } .sub { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      th { background: #700CEB; color: #fff; padding: 8px 12px; text-align: left; font-size: 12px; letter-spacing: 0.06em; }
      td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
      td:first-child { color: #6b7280; width: 40%; } td:last-child { font-weight: 600; }
      .amount { font-size: 20px; font-weight: 900; color: #700CEB; }
      .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
        background: ${STATUS_META[sub.status]?.bg || "#f3f4f6"}; color: ${STATUS_META[sub.status]?.color || "#6b7280"}; }
    </style></head><body>
    <h1>Kemchuta Homes Ltd</h1>
    <p class="sub">Estate Subscription Form — Generated ${new Date().toLocaleDateString("en-NG")}</p>
    <table>
      <tr><th colspan="2">Personal Information</th></tr>
      <tr><td>Title & Name</td><td>${sub.title} ${sub.firstName} ${sub.lastName}</td></tr>
      <tr><td>Date of Birth</td><td>${formatDate(sub.dateOfBirth)}</td></tr>
      <tr><td>Gender</td><td>${sub.gender}</td></tr>
      <tr><td>Marital Status</td><td>${sub.maritalStatus}</td></tr>
      ${sub.spouseFirstName ? `<tr><td>Spouse</td><td>${sub.spouseFirstName} ${sub.spouseLastName}</td></tr>` : ""}
      <tr><td>Nationality</td><td>${sub.nationality}</td></tr>
      <tr><td>Employer</td><td>${sub.employerName || "—"}</td></tr>
      <tr><th colspan="2">Contact & Address</th></tr>
      <tr><td>Email</td><td>${sub.email}</td></tr>
      <tr><td>Phone</td><td>${sub.phone}</td></tr>
      <tr><td>Address</td><td>${sub.residentialAddress}, ${sub.cityTown}, ${sub.lga}, ${sub.state}</td></tr>
      <tr><td>Country</td><td>${sub.countryOfResidence}</td></tr>
      <tr><th colspan="2">Subscription Details</th></tr>
      <tr><td>Estate</td><td>${sub.estateName}</td></tr>
      <tr><td>Plot Type</td><td>${sub.plotType}</td></tr>
      <tr><td>Plot Size</td><td>${sub.plotSize}</td></tr>
      <tr><td>No. of Plots</td><td>${sub.numberOfPlots}</td></tr>
      <tr><td>Payment Plan</td><td>${sub.paymentPlan}</td></tr>
      <tr><td>Survey Type</td><td>${sub.surveyType}</td></tr>
      <tr><td>Total Amount</td><td class="amount">${formatCurrency(sub.totalAmount)}</td></tr>
      <tr><td>Status</td><td><span class="status">${STATUS_META[sub.status]?.label || sub.status}</span></td></tr>
      <tr><th colspan="2">Next of Kin</th></tr>
      <tr><td>Name</td><td>${sub.kinFirstName} ${sub.kinLastName}</td></tr>
      <tr><td>Phone</td><td>${sub.kinPhone}</td></tr>
      <tr><td>Address</td><td>${sub.kinAddress}${sub.kinCity ? `, ${sub.kinCity}` : ""}${sub.kinLga ? `, ${sub.kinLga}` : ""}</td></tr>
    </table>
    <p style="font-size:11px;color:#9ca3af;margin-top:32px;">Kemchuta Homes Ltd · Automated Document</p>
    </body></html>
  `);
  w.document.close();
  w.print();
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
export default function ManageSubscriptions() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [plotFilter, setPlotFilter] = useState("");
  const [viewSub, setViewSub] = useState(null);
  const [updatingIds, setUpdatingIds] = useState(new Set());

  const limit = 12;

  const buildUrl = (overrides = {}) => {
    const p = {
      page,
      limit,
      search,
      status: statusFilter,
      plotType: plotFilter,
      ...overrides,
    };
    const q = new URLSearchParams();
    if (p.page) q.set("page", p.page);
    if (p.limit) q.set("limit", p.limit);
    if (p.search) q.set("search", p.search);
    if (p.status) q.set("status", p.status);
    if (p.plotType) q.set("plotType", p.plotType);
    return `${API_URL}/api/subscriptions?${q.toString()}`;
  };

  const { data, error, mutate, isLoading } = useSWR(buildUrl(), fetcher, {
    revalidateOnFocus: false,
  });

  // Fetch all for stats (unfiltered)
  const { data: allData } = useSWR(
    `${API_URL}/api/subscriptions?limit=1000`,
    fetcher,
    { revalidateOnFocus: false },
  );
  const all = allData?.subscriptions || [];

  const subscriptions = data?.subscriptions || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const totalRevenue = all
    .filter((s) => s.status === "approved")
    .reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const pendingRevenue = all
    .filter((s) => s.status === "pending")
    .reduce((acc, s) => acc + (s.totalAmount || 0), 0);

  const stats = {
    total: all.length,
    pending: all.filter((s) => s.status === "pending").length,
    approved: all.filter((s) => s.status === "approved").length,
    rejected: all.filter((s) => s.status === "rejected").length,
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`${API_URL}/api/subscriptions/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      mutate();
      if (viewSub?._id === id) setViewSub((prev) => ({ ...prev, status }));
    } catch {}
    setUpdatingIds((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  };

  const handleExportCSV = () => {
    const rows = [
      [
        "Name",
        "Email",
        "Phone",
        "Estate",
        "Plot Type",
        "Plot Size",
        "Plots",
        "Payment Plan",
        "Total Amount",
        "Status",
        "Date",
      ],
      ...subscriptions.map((s) => [
        `${s.title} ${s.firstName} ${s.lastName}`,
        s.email,
        s.phone,
        s.estateName,
        s.plotType,
        s.plotSize,
        s.numberOfPlots,
        s.paymentPlan,
        s.totalAmount,
        s.status,
        formatDate(s.createdAt),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv," + encodeURIComponent(csv);
    a.download = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (viewSub) {
    return (
      <SubscriptionProfile id={viewSub._id} onBack={() => setViewSub(null)} />
    );
  }

  return (
    <div className="space-y-6 mt-2">
      {/* Header */}
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
            Manage Subscriptions
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>
            {total} subscription{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
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
          icon={FileText}
          color="#700CEB"
          delay={0}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="#d97706"
          delay={0.06}
          sub={`${formatCurrency(pendingRevenue)} pipeline`}
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={Check}
          color="#059669"
          delay={0.12}
          sub={`${formatCurrency(totalRevenue)} confirmed`}
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="#dc2626"
          delay={0.18}
        />
      </div>

      {/* Revenue summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 flex flex-wrap gap-8 items-center"
        style={{
          background: "linear-gradient(135deg,#3F0C91,#700CEB)",
          boxShadow: "0 8px 32px rgba(112,12,235,0.25)",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Confirmed Revenue
          </p>
          <p
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.05em",
            }}
          >
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div
          style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }}
        />
        <div>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Pipeline (Pending)
          </p>
          <p
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "rgba(239,194,255,0.9)",
              letterSpacing: "-0.04em",
            }}
          >
            {formatCurrency(pendingRevenue)}
          </p>
        </div>
        <div
          style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }}
        />
        <div>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Total Submissions
          </p>
          <p
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.04em",
            }}
          >
            {all.length}
          </p>
        </div>
      </motion.div>

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
                {s ? meta.label : "All Status"}
              </button>
            );
          })}
        </div>

        {/* Plot type filter */}
        <div className="relative">
          <select
            value={plotFilter}
            onChange={(e) => {
              setPlotFilter(e.target.value);
              setPage(1);
            }}
            className="pl-4 pr-8 py-2.5 rounded-xl text-xs font-bold outline-none appearance-none"
            style={{
              background: "#fff",
              border: "1.5px solid rgba(112,12,235,0.12)",
              color: plotFilter ? "#700CEB" : "#6b7280",
              cursor: "pointer",
            }}
          >
            <option value="">All Plot Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Investment">Investment</option>
          </select>
          <ChevronDown
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#9ca3af" }}
          />
        </div>
      </div>

      {/* Content */}
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
            Failed to load subscriptions
          </p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(112,12,235,0.08)" }}
          >
            <FileText size={28} style={{ color: "#700CEB" }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0f0a1e" }}>
            No subscriptions found
          </p>
          <p style={{ fontSize: 14, color: "#9ca3af" }}>
            Adjust your search or filters.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div
            className="rounded-2xl overflow-hidden hidden lg:block"
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
                    "Subscriber",
                    "Estate",
                    "Plot",
                    "Amount",
                    "Plan",
                    "Status",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-4 text-left"
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
                {subscriptions.map((sub, i) => {
                  const isUpdating = updatingIds.has(sub._id);
                  const ptMeta =
                    PLOT_TYPE_COLOR[sub.plotType] ||
                    PLOT_TYPE_COLOR.Residential;
                  const PIcon = ptMeta.icon;
                  return (
                    <motion.tr
                      key={sub._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(112,12,235,0.02)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td className="px-4 py-4">
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#0f0a1e",
                          }}
                        >
                          {sub.title} {sub.firstName} {sub.lastName}
                        </p>
                        <p style={{ fontSize: 11, color: "#6b7280" }}>
                          {sub.email}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f0a1e",
                          }}
                          className="truncate max-w-[140px]"
                        >
                          {sub.estateName}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl w-fit"
                          style={{
                            background: ptMeta.bg,
                            border: `1px solid ${ptMeta.color}22`,
                          }}
                        >
                          <PIcon size={11} style={{ color: ptMeta.color }} />
                          <span
                            style={{
                              fontSize: 11,
                              color: ptMeta.color,
                              fontWeight: 700,
                            }}
                          >
                            {sub.plotType}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            marginTop: 3,
                          }}
                        >
                          {sub.numberOfPlots}× {sub.plotSize}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#700CEB",
                            letterSpacing: "-0.03em",
                          }}
                        >
                          {formatCurrency(sub.totalAmount)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            fontWeight: 600,
                          }}
                        >
                          {sub.paymentPlan}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusDropdown
                          current={sub.status}
                          onChange={(s) => handleStatusChange(sub._id, s)}
                          loading={isUpdating}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <p style={{ fontSize: 12, color: "#9ca3af" }}>
                          {formatDate(sub.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewSub(sub)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                              background: "rgba(112,12,235,0.08)",
                              color: "#700CEB",
                              border: "1px solid rgba(112,12,235,0.15)",
                            }}
                          >
                            <Eye size={13} /> View
                          </button>
                          <button
                            onClick={() => printSubscription(sub)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                            style={{
                              background: "rgba(112,12,235,0.06)",
                              color: "#700CEB",
                              border: "1px solid rgba(112,12,235,0.1)",
                            }}
                            title="Print"
                          >
                            <Printer size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {subscriptions.map((sub) => {
              const isUpdating = updatingIds.has(sub._id);
              const ptMeta =
                PLOT_TYPE_COLOR[sub.plotType] || PLOT_TYPE_COLOR.Residential;
              const PIcon = ptMeta.icon;
              return (
                <motion.div
                  key={sub._id}
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
                        {sub.title} {sub.firstName} {sub.lastName}
                      </p>
                      <p style={{ fontSize: 12, color: "#6b7280" }}>
                        {sub.email}
                      </p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      <Building2
                        size={11}
                        style={{
                          display: "inline",
                          marginRight: 3,
                          color: "#700CEB",
                        }}
                      />
                      {sub.estateName}
                    </span>
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
                      style={{ background: ptMeta.bg }}
                    >
                      <PIcon size={10} style={{ color: ptMeta.color }} />
                      <span
                        style={{
                          fontSize: 11,
                          color: ptMeta.color,
                          fontWeight: 700,
                        }}
                      >
                        {sub.plotType}
                      </span>
                    </span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {sub.numberOfPlots}× {sub.plotSize}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: "#700CEB",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {formatCurrency(sub.totalAmount)}
                    </p>
                    <div className="flex items-center gap-2">
                      <StatusDropdown
                        current={sub.status}
                        onChange={(s) => handleStatusChange(sub._id, s)}
                        loading={isUpdating}
                      />
                      <button
                        onClick={() => setViewSub(sub)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                        style={{
                          background: "rgba(112,12,235,0.08)",
                          color: "#700CEB",
                          border: "1px solid rgba(112,12,235,0.15)",
                        }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </div>
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
