"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FaUsers,
  FaBuilding,
  FaClipboardList,
  FaCalendarCheck,
  FaChartLine,
  FaDownload,
  FaSync,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

// ── Brand ──────────────────────────────────────────────────────────────────────
const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const PURPLE_MID = "#8A2FF0";
const PURPLE_LIGHT = "#EDE9FE";

// ── Helpers ────────────────────────────────────────────────────────────────────
const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const fmtCurrency = (n = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: n >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(n);

const fmtNumber = (n = 0) => new Intl.NumberFormat("en-NG").format(n);

const fetcher = async (url, token) => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load");
  }
  return res.json();
};

// ── Pie chart colours ──────────────────────────────────────────────────────────
const STATUS_COLORS = {
  pending: "#f59e0b",
  reviewed: PURPLE,
  approved: "#22c55e",
  rejected: "#ef4444",
  confirmed: PURPLE,
  cancelled: "#ef4444",
  completed: "#22c55e",
};

const PIE_COLORS = [
  PURPLE,
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#ef4444",
  "#8A2FF0",
];

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid rgba(112,12,235,0.15)`,
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(112,12,235,0.12)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      {payload.map((p, i) => (
        <p
          key={i}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: p.color || PURPLE,
            margin: "2px 0",
          }}
        >
          {p.name}: {currency ? fmtCurrency(p.value) : fmtNumber(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  trend,
  trendVal,
  delay = 0,
  currency = false,
}) {
  const isUp = trend === "up";
  const isDown = trend === "down";
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {trendVal !== undefined && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{
              background: isUp
                ? "rgba(34,197,94,0.1)"
                : isDown
                  ? "rgba(239,68,68,0.1)"
                  : "rgba(107,114,128,0.1)",
              color: isUp ? "#16a34a" : isDown ? "#dc2626" : "#6b7280",
            }}
          >
            {isUp ? (
              <FaArrowUp size={9} />
            ) : isDown ? (
              <FaArrowDown size={9} />
            ) : (
              <Minus size={9} />
            )}
            {Math.abs(trendVal)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">
        {currency ? fmtCurrency(value) : fmtNumber(value)}
      </p>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      {/* Bottom bar */}
      <div className="mt-4 h-0.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full group-hover:w-full w-0 transition-all duration-700"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}

// ── Section heading ─────────────────────────────────────────────────────────────
function SectionHeading({ title, sub }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-black text-gray-900 tracking-tight">
        {title}
      </h3>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Chart card wrapper ─────────────────────────────────────────────────────────
function ChartCard({ children, title, sub, className = "" }) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl p-5 border border-gray-100 ${className}`}
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {title && (
        <div className="mb-4">
          <p className="text-sm font-bold text-gray-800">{title}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}

// ── Status pill ─────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const color = STATUS_COLORS[status] || "#6b7280";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ background: `${color}18`, color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: color }}
      />
      {capitalize(status)}
    </span>
  );
}

// ── Skeleton loader ─────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

// ── CSV export utility ──────────────────────────────────────────────────────────
function exportCSV(rows, filename) {
  const header = Object.keys(rows[0]).join(",");
  const body = rows
    .map((r) =>
      Object.values(r)
        .map((v) => `"${v}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ── Realtor table state ────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 10;

  // ── Analytics SWR ─────────────────────────────────────────────────────────
  const {
    data: analytics,
    error: analyticsError,
    isLoading: analyticsLoading,
    mutate: refreshAnalytics,
  } = useSWR(
    token ? `${API_URL}/api/admin/analytics` : null,
    (url) => fetcher(url, token),
    { revalidateOnFocus: false, refreshInterval: 5 * 60 * 1000 },
  );

  // ── Realtor list SWR ───────────────────────────────────────────────────────
  const {
    data: realtorData,
    error: realtorError,
    isLoading: realtorLoading,
  } = useSWR(
    token
      ? `${API_URL}/api/realtors?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      : null,
    (url) => fetcher(url, token),
    { revalidateOnFocus: false },
  );

  const realtors = realtorData?.docs || [];
  const total = realtorData?.total || 0;
  const pages = realtorData?.pages || 1;

  const goTo = (p) => {
    if (p >= 1 && p <= pages) setPage(p);
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // ── Export handlers ────────────────────────────────────────────────────────
  const exportRealtors = useCallback(() => {
    if (!realtors.length) return;
    exportCSV(
      realtors.map((r) => ({
        referralCode: r.referralCode,
        name: `${capitalize(r.firstName)} ${capitalize(r.lastName)}`,
        email: r.email,
        phone: r.phone || "",
        state: r.state || "",
        recruiter: r.recruitedBy
          ? `${capitalize(r.recruitedBy.firstName)} ${capitalize(r.recruitedBy.lastName)}`
          : "Direct",
        joined: new Date(r.createdAt).toLocaleDateString("en-NG"),
      })),
      "kemchuta_realtors",
    );
  }, [realtors]);

  const exportAnalyticsSummary = useCallback(() => {
    if (!analytics) return;
    const {
      realtors: r,
      subscriptions: s,
      inspections: i,
      estates: e,
    } = analytics;
    exportCSV(
      [
        { metric: "Total Realtors", value: r.total },
        { metric: "New Realtors This Month", value: r.newThisMonth },
        { metric: "Total Subscriptions", value: s.total },
        { metric: "Approved Subscriptions", value: s.byStatus.approved },
        { metric: "Approval Rate (%)", value: s.approvalRate },
        { metric: "Approved Revenue (NGN)", value: s.approvedRevenue },
        { metric: "Avg Deal Size (NGN)", value: s.avgDealSize },
        { metric: "Total Inspections", value: i.total },
        { metric: "Inspection → Sub Rate (%)", value: i.inspToSubRate },
        { metric: "Upcoming Inspections (7d)", value: i.upcoming7Days },
        { metric: "Total Estates", value: e.total },
        { metric: "Active Estates", value: e.active },
      ],
      "kemchuta_analytics_summary",
    );
  }, [analytics]);

  // ── Derived chart data ─────────────────────────────────────────────────────
  const monthlyTrendData = analytics
    ? analytics.subscriptions.monthly.labels.map((label, i) => ({
        month: label,
        Subscriptions: analytics.subscriptions.monthly.counts[i],
        Inspections: analytics.inspections.monthly.counts[i],
        Revenue: analytics.subscriptions.monthly.revenue[i],
      }))
    : [];

  const subStatusData = analytics
    ? Object.entries(analytics.subscriptions.byStatus)
        .map(([k, v]) => ({ name: capitalize(k), value: v }))
        .filter((d) => d.value > 0)
    : [];

  const inspStatusData = analytics
    ? Object.entries(analytics.inspections.byStatus)
        .map(([k, v]) => ({ name: capitalize(k), value: v }))
        .filter((d) => d.value > 0)
    : [];

  const plotTypeData = analytics?.subscriptions.byPlotType || [];

  // ── Loading / error states ─────────────────────────────────────────────────
  if (analyticsLoading)
    return (
      <div className="space-y-6 mt-4 sm:mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-1 h-6 rounded-full"
            style={{
              background: `linear-gradient(to bottom, ${PURPLE}, ${PURPLE_MID})`,
            }}
          />
          <Skeleton className="h-7 w-48" />
        </div>
        <DashboardSkeleton />
      </div>
    );

  if (analyticsError)
    return (
      <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
        <AlertTriangle
          size={20}
          className="text-red-500 flex-shrink-0 mt-0.5"
        />
        <div>
          <p className="font-bold text-red-700">Failed to load analytics</p>
          <p className="text-sm text-red-500 mt-1">{analyticsError.message}</p>
          <button
            onClick={() => refreshAnalytics()}
            className="mt-3 text-sm font-bold text-red-600 hover:underline flex items-center gap-1"
          >
            <FaSync size={11} /> Retry
          </button>
        </div>
      </div>
    );

  const a = analytics;

  return (
    <div className="space-y-6 mt-4 sm:mt-8 font-poppins pb-10">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-7 rounded-full"
            style={{
              background: `linear-gradient(to bottom, ${PURPLE}, ${PURPLE_MID})`,
            }}
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Admin Overview
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time business intelligence dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => refreshAnalytics()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:border-customPurple-300 hover:text-customPurple-600 transition-all"
          >
            <FaSync size={11} /> Refresh
          </button>
          <button
            onClick={exportAnalyticsSummary}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
              boxShadow: "0 4px 12px rgba(112,12,235,0.3)",
            }}
          >
            <FaDownload size={11} /> Export Report
          </button>
        </div>
      </div>

      {/* ── KPI Cards — Row 1: Realtors & Estates ─────────────────────────── */}
      <div>
        <SectionHeading
          title="Network & Properties"
          sub="Realtor network and estate inventory"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            label="Total Realtors"
            value={a.realtors.total}
            sub={`+${a.realtors.newThisMonth} this month`}
            icon={FaUsers}
            color={PURPLE}
            trend={
              a.realtors.monthOverMonth > 0
                ? "up"
                : a.realtors.monthOverMonth < 0
                  ? "down"
                  : "flat"
            }
            trendVal={a.realtors.monthOverMonth}
            delay={0}
          />
          <KpiCard
            label="Total Recruits"
            value={a.realtors.totalRecruits}
            sub="With a recruiter"
            icon={FaTrophy}
            color="#8A2FF0"
            delay={0.05}
          />
          <KpiCard
            label="Active Estates"
            value={a.estates.active}
            sub={`${a.estates.total} total listed`}
            icon={FaBuilding}
            color="#3b82f6"
            delay={0.1}
          />
          <KpiCard
            label="New This Month"
            value={a.realtors.newThisMonth}
            sub={`vs ${a.realtors.newLastMonth} last month`}
            icon={FaChartLine}
            color="#22c55e"
            trend={
              a.realtors.newThisMonth >= a.realtors.newLastMonth ? "up" : "down"
            }
            trendVal={
              a.realtors.newLastMonth > 0
                ? Math.round(
                    ((a.realtors.newThisMonth - a.realtors.newLastMonth) /
                      a.realtors.newLastMonth) *
                      100,
                  )
                : 0
            }
            delay={0.15}
          />
        </div>
      </div>

      {/* ── KPI Cards — Row 2: Revenue & Conversions ──────────────────────── */}
      <div>
        <SectionHeading
          title="Revenue & Conversions"
          sub="Subscription revenue and pipeline performance"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            label="Approved Revenue"
            value={a.subscriptions.approvedRevenue}
            sub={`${a.subscriptions.approvedCount} approved deals`}
            icon={FaChartLine}
            color="#22c55e"
            currency
            delay={0.2}
          />
          <KpiCard
            label="Avg Deal Size"
            value={a.subscriptions.avgDealSize}
            sub="Per approved subscription"
            icon={FaTrophy}
            color={PURPLE}
            currency
            delay={0.25}
          />
          <KpiCard
            label="Approval Rate"
            value={`${a.subscriptions.approvalRate}%`}
            sub={`${a.subscriptions.byStatus.pending} pending review`}
            icon={FaClipboardList}
            color="#f59e0b"
            delay={0.3}
          />
          <KpiCard
            label="Insp → Sale Rate"
            value={`${a.inspections.inspToSubRate}%`}
            sub="Inspection to subscription"
            icon={FaCalendarCheck}
            color="#3b82f6"
            delay={0.35}
          />
        </div>
      </div>

      {/* ── KPI Cards — Row 3: Inspections ────────────────────────────────── */}
      <div>
        <SectionHeading
          title="Inspection Pipeline"
          sub="Site visit bookings and conversion"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            label="Total Inspections"
            value={a.inspections.total}
            icon={FaCalendarCheck}
            color={PURPLE}
            delay={0.4}
          />
          <KpiCard
            label="Confirmed"
            value={a.inspections.byStatus.confirmed}
            icon={FaCalendarCheck}
            color="#22c55e"
            delay={0.45}
          />
          <KpiCard
            label="Upcoming (7 days)"
            value={a.inspections.upcoming7Days}
            icon={FaCalendarCheck}
            color="#3b82f6"
            delay={0.5}
          />
          <KpiCard
            label="Completed"
            value={a.inspections.byStatus.completed}
            icon={FaTrophy}
            color="#8A2FF0"
            delay={0.55}
          />
        </div>
      </div>

      {/* ── Charts Row 1: Monthly Trend + Subscription Status ─────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Monthly trend — spans 2 cols */}
        <ChartCard
          className="xl:col-span-2"
          title="Monthly Activity Trend"
          sub="Subscriptions, inspections and revenue over last 6 months"
        >
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrendData}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PURPLE} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PURPLE} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="inspGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 11,
                    fill: "#9ca3af",
                    fontFamily: "Poppins, sans-serif",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "#9ca3af",
                    fontFamily: "Poppins, sans-serif",
                  }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="Subscriptions"
                  stroke={PURPLE}
                  strokeWidth={2.5}
                  fill="url(#subGrad)"
                  dot={{ r: 3, fill: PURPLE }}
                />
                <Area
                  type="monotone"
                  dataKey="Inspections"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#inspGrad)"
                  dot={{ r: 3, fill: "#3b82f6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Subscription status donut */}
        <ChartCard title="Subscription Status" sub="Pipeline breakdown">
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="78%"
                  paddingAngle={3}
                  dataKey="value"
                >
                  {subStatusData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        STATUS_COLORS[entry.name.toLowerCase()] || PIE_COLORS[i]
                      }
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => fmtNumber(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(112,12,235,0.12)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Status legend with counts */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.entries(a.subscriptions.byStatus).map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-2.5 py-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: STATUS_COLORS[k] }}
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {capitalize(k)}
                  </span>
                </div>
                <span className="text-xs font-black text-gray-900">{v}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Charts Row 2: Revenue Bar + Plot Type + Inspection Status ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue bar chart */}
        <ChartCard
          title="Monthly Revenue"
          sub="Approved subscription value (₦)"
        >
          <div className="h-48 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyTrendData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(1)}M`
                      : v >= 1000
                        ? `${(v / 1000).toFixed(0)}K`
                        : v
                  }
                />
                <Tooltip content={<ChartTooltip currency />} />
                <Bar dataKey="Revenue" fill={PURPLE} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Plot type breakdown */}
        <ChartCard title="Plot Type Breakdown" sub="Subscriptions by land type">
          <div className="h-48 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={plotTypeData}
                layout="vertical"
                margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.05)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="label"
                  type="category"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(v, n) =>
                    n === "revenue" ? fmtCurrency(v) : fmtNumber(v)
                  }
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                />
                <Bar
                  dataKey="count"
                  fill={PURPLE_MID}
                  radius={[0, 6, 6, 0]}
                  name="Subscriptions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Inspection status donut */}
        <ChartCard title="Inspection Status" sub="Site visit pipeline">
          <div className="h-48 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inspStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="72%"
                  paddingAngle={3}
                  dataKey="value"
                >
                  {inspStatusData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        STATUS_COLORS[entry.name.toLowerCase()] || PIE_COLORS[i]
                      }
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => fmtNumber(v)}
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {Object.entries(a.inspections.byStatus).map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-2.5 py-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: STATUS_COLORS[k] }}
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {capitalize(k)}
                  </span>
                </div>
                <span className="text-xs font-black text-gray-900">{v}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Conversion funnel ─────────────────────────────────────────────── */}
      <ChartCard
        title="Subscription Conversion Funnel"
        sub="How visitors move through the pipeline"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              stage: "Inspections",
              value: a.inspections.total,
              color: "#3b82f6",
              pct: 100,
            },
            {
              stage: "Subscriptions",
              value: a.subscriptions.total,
              color: PURPLE,
              pct:
                a.inspections.total > 0
                  ? Math.round(
                      (a.subscriptions.total / a.inspections.total) * 100,
                    )
                  : 0,
            },
            {
              stage: "Under Review",
              value:
                a.subscriptions.byStatus.reviewed +
                a.subscriptions.byStatus.pending,
              color: "#f59e0b",
              pct:
                a.subscriptions.total > 0
                  ? Math.round(
                      ((a.subscriptions.byStatus.reviewed +
                        a.subscriptions.byStatus.pending) /
                        a.subscriptions.total) *
                        100,
                    )
                  : 0,
            },
            {
              stage: "Approved",
              value: a.subscriptions.byStatus.approved,
              color: "#22c55e",
              pct:
                a.subscriptions.total > 0
                  ? Math.round(
                      (a.subscriptions.byStatus.approved /
                        a.subscriptions.total) *
                        100,
                    )
                  : 0,
            },
          ].map((step, i) => (
            <div key={step.stage} className="relative">
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white mx-auto mb-3"
                  style={{ background: step.color }}
                >
                  {i + 1}
                </div>
                <p className="text-xl font-black text-gray-900">
                  {fmtNumber(step.value)}
                </p>
                <p className="text-xs font-bold text-gray-500 mt-0.5">
                  {step.stage}
                </p>
                <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${step.pct}%`, background: step.color }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {step.pct}% of pipeline
                </p>
              </div>
              {i < 3 && (
                <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-5 h-5 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 text-xs font-bold">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </ChartCard>

      {/* ── Payment plan breakdown ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {a.subscriptions.byPaymentPlan.map((plan, i) => {
          const pct =
            a.subscriptions.total > 0
              ? Math.round((plan.count / a.subscriptions.total) * 100)
              : 0;
          return (
            <ChartCard key={plan.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {plan.label}
                  </p>
                  <p className="text-2xl font-black text-gray-900">
                    {plan.count}
                  </p>
                  <p className="text-xs text-gray-400">subscriptions</p>
                </div>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-sm font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${PIE_COLORS[i]}, ${PIE_COLORS[i]}cc)`,
                  }}
                >
                  {pct}%
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: PIE_COLORS[i],
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </ChartCard>
          );
        })}
      </div>

      {/* ── Realtor Table ─────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl border border-gray-100"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        {/* Table header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-gray-900">
                Registered Realtors
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {realtorLoading
                  ? "Loading…"
                  : `${fmtNumber(total)} total realtors`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search name, email, code…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl w-48 sm:w-56 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": PURPLE + "40" }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
                  }}
                >
                  Search
                </button>
              </form>
              <button
                onClick={exportRealtors}
                disabled={realtorLoading || !realtors.length}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:border-customPurple-300 hover:text-customPurple-600 transition-all disabled:opacity-40"
              >
                <FaDownload size={10} /> CSV
              </button>
            </div>
          </div>
        </div>

        {realtorError && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {realtorError.message}
          </div>
        )}

        {/* Table — scrollable on mobile */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50/80">
                {["Code", "Name", "Phone", "Email", "Recruiter", "Joined"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {realtorLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : realtors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <FaUsers size={32} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm font-bold text-gray-400">
                      No realtors found
                    </p>
                  </td>
                </tr>
              ) : (
                realtors.map((r, idx) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-purple-50/30 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="font-mono text-xs font-bold px-2 py-1 rounded-lg"
                        style={{ background: PURPLE_LIGHT, color: PURPLE }}
                      >
                        {r.referralCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            r.avatar ||
                            `https://ui-avatars.com/api/?name=${r.firstName}+${r.lastName}&background=700CEB&color=fff`
                          }
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                          alt=""
                        />
                        <span className="text-sm font-semibold text-gray-800">
                          {capitalize(r.firstName)} {capitalize(r.lastName)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {r.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {r.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.recruitedBy ? (
                        <span className="text-sm font-medium text-gray-700">
                          {capitalize(r.recruitedBy.firstName)}{" "}
                          {capitalize(r.recruitedBy.lastName)}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">
                          Direct
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-gray-400">
            Page {page} of {pages} · {fmtNumber(total)} realtors
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg disabled:opacity-40 hover:border-customPurple-300 transition-all"
            >
              ← Prev
            </button>
            {/* Page number pills — show up to 5 around current */}
            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-1 text-xs text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className="w-7 h-7 text-xs font-bold rounded-lg transition-all"
                    style={
                      page === p
                        ? { background: PURPLE, color: "#fff" }
                        : { border: "1px solid #e5e7eb", color: "#6b7280" }
                    }
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              onClick={() => goTo(page + 1)}
              disabled={page === pages}
              className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg disabled:opacity-40 hover:border-customPurple-300 transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
