import React, { useEffect, useState } from "react";
import ClientSubscriptionDetail from "./ClientSubscriptionDetail";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaCalendarCheck,
  FaFileAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  MapPin,
  Home,
  Building2,
  TrendingUp,
  BarChart3,
  ChevronRight,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Eye,
  Loader2,
  Search,
  Filter,
  Download,
  ExternalLink,
  RefreshCw,
  CreditCard,
  Wallet,
  ArrowDown,
  Shield,
  Star,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const defaultAvatar =
  "https://ui-avatars.com/api/?name=Client&background=700CEB&color=fff";

// ── Auth helpers (mirrors realtor pattern) ─────────────────────────────────
const getClientToken = () => localStorage.getItem("clientToken");
const getClientUser = () => {
  try {
    return JSON.parse(localStorage.getItem("clientUser"));
  } catch {
    return null;
  }
};

const authFetch = (url, opts = {}) =>
  fetch(`${BASE_URL}${url}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getClientToken()}`,
      ...opts.headers,
    },
  });

// fetchBlob — for binary downloads (PDF). Must NOT send Content-Type: application/json
const fetchBlob = (url) =>
  fetch(`${BASE_URL}${url}`, {
    headers: { Authorization: `Bearer ${getClientToken()}` },
  });

// ── Status badge helpers ───────────────────────────────────────────────────
const STATUS_META = {
  pending: {
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.25)",
    Icon: Clock,
    label: "Pending",
  },
  reviewed: {
    color: "#700CEB",
    bg: "rgba(112,12,235,0.1)",
    border: "rgba(112,12,235,0.25)",
    Icon: CheckCircle,
    label: "Reviewed",
  },
  approved: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    Icon: CheckCircle,
    label: "Approved",
  },
  rejected: {
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.25)",
    Icon: XCircle,
    label: "Rejected",
  },
  confirmed: {
    color: "#700CEB",
    bg: "rgba(112,12,235,0.1)",
    border: "rgba(112,12,235,0.25)",
    Icon: CheckCircle,
    label: "Confirmed",
  },
  cancelled: {
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.25)",
    Icon: XCircle,
    label: "Cancelled",
  },
  completed: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    Icon: CheckCircle,
    label: "Completed",
  },
  payment_confirmed: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    Icon: CreditCard,
    label: "Payment Confirmed",
  },
  allocated: {
    color: "#700CEB",
    bg: "rgba(112,12,235,0.06)",
    border: "rgba(112,12,235,0.2)",
    Icon: Shield,
    label: "Allocated",
  },
  active: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    Icon: TrendingUp,
    label: "Active",
  },
  matured: {
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.25)",
    Icon: Star,
    label: "Matured",
  },
  paid_out: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    Icon: CheckCircle,
    label: "Paid Out",
  },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const { Icon } = meta;
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

function formatCurrency(n) {
  return n
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
      }).format(n)
    : "—";
}

function formatDate(d) {
  return d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
}

// ── Loading & Error screens (mirrors RealtorDashboard.jsx pattern) ─────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-customPurple-100 border-t-customPurple-500 rounded-full animate-spin" />
        <p className="mt-4 text-customBlack-400 font-bold tracking-widest uppercase text-xs">
          Loading Your Portal...
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm text-center">
        <div className="text-red-500 mb-4 inline-block bg-red-50 p-4 rounded-full">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-customBlack-900 mb-2">
          Access Error
        </h2>
        <p className="text-customBlack-500 text-sm mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="w-full bg-customBlack-900 text-white py-3 rounded-2xl font-bold hover:bg-customBlack-800 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}

// ── Stat Card (mirrors RealtorDashboard StatCard) ──────────────────────────
function StatCard({ label, value, icon: Icon, color, delay, subtext }) {
  return (
    <div
      className="bg-white rounded-3xl p-6 shadow-sm border border-customBlack-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-500 animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`${color} bg-current/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
      >
        <Icon size={22} className="w-6 h-6" />
      </div>
      <div>
        <p className="text-customBlack-400 text-xs font-bold uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-3xl font-black text-customBlack-900">{value}</p>
        {subtext && (
          <p className="text-xs text-customBlack-400 mt-1">{subtext}</p>
        )}
      </div>
      <div className="mt-4 h-1 w-full bg-customBlack-50 rounded-full overflow-hidden">
        <div className="h-full bg-customPurple-500 w-0 group-hover:w-full transition-all duration-1000 ease-out" />
      </div>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────
function OverviewTab({ dashData }) {
  const { stats, recentSubscriptions, recentInvestments = [] } = dashData;

  const fmtNGN = (n = 0) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-8">
      {/* Land Subscription Stats */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Land Subscriptions
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            label="Total"
            value={stats.totalSubscriptions}
            icon={FaClipboardList}
            color="text-customPurple-600"
            delay={0}
          />
          <StatCard
            label="Approved"
            value={stats.approvedSubscriptions}
            icon={CheckCircle}
            color="text-green-600"
            delay={100}
          />
          <StatCard
            label="Pending"
            value={stats.pendingSubscriptions}
            icon={Clock}
            color="text-amber-600"
            delay={200}
            subtext="Under review"
          />
          <StatCard
            label="Total Paid"
            value={fmtNGN(stats.totalAmountPaid || 0)}
            icon={Wallet}
            color="text-blue-600"
            delay={300}
          />
        </div>
      </div>

      {/* Buy2Sell Investment Stats */}
      {stats.totalInvestments > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Buy2Sell Investments
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              label="Total"
              value={stats.totalInvestments}
              icon={TrendingUp}
              color="text-customPurple-600"
              delay={0}
            />
            <StatCard
              label="Active"
              value={stats.activeInvestments}
              icon={CheckCircle}
              color="text-green-600"
              delay={100}
            />
            <StatCard
              label="Invested"
              value={fmtNGN(stats.totalInvested || 0)}
              icon={Wallet}
              color="text-amber-600"
              delay={200}
            />
            <StatCard
              label="Expected Payout"
              value={fmtNGN(stats.totalExpectedPayout || 0)}
              icon={Star}
              color="text-blue-600"
              delay={300}
            />
          </div>
        </div>
      )}

      {/* Recent Buy2Sell Investments */}
      {recentInvestments.length > 0 && (
        <section
          className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden animate-fadeIn"
          style={{ animationDelay: "500ms" }}
        >
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-customBlack-50">
            <div>
              <h3 className="text-2xl font-bold text-customBlack-900">
                Recent Investments
              </h3>
              <p className="text-customBlack-400 font-medium">
                Your Buy2Sell investment portfolio
              </p>
            </div>
            <Link
              to="/client/portal/investments"
              className="flex items-center gap-1.5 text-customPurple-600 text-sm font-bold hover:underline"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-customBlack-50">
            {recentInvestments.map((inv) => {
              const sc = {
                pending: { label: "Pending", color: "#d97706" },
                partial_paid: { label: "Partial Paid", color: "#0891b2" },
                active: { label: "Active", color: "#059669" },
                matured: { label: "Matured", color: "#700CEB" },
                paid_out: { label: "Paid Out", color: "#059669" },
                closed: { label: "Closed", color: "#6b7280" },
              }[inv.status] || { label: inv.status, color: "#6b7280" };
              return (
                <div
                  key={inv._id}
                  className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-customPurple-50/30 transition-colors"
                >
                  <div>
                    <p className="font-bold text-customBlack-900">
                      {inv.duration} Investment
                    </p>
                    <p className="text-xs text-customBlack-400 font-mono">
                      {inv.referenceNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-black text-customBlack-900">
                      {fmtNGN(inv.principalAmount)}
                    </p>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: `${sc.color}18`,
                        color: sc.color,
                      }}
                    >
                      {sc.label}
                    </span>
                    <Link
                      to="/client/portal/investments"
                      className="text-xs font-bold text-customPurple-600 hover:underline flex items-center gap-1"
                    >
                      View <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Subscriptions */}
      {recentSubscriptions.length > 0 && (
        <section
          className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden animate-fadeIn"
          style={{ animationDelay: "400ms" }}
        >
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-customBlack-50">
            <div>
              <h3 className="text-2xl font-bold text-customBlack-900">
                Recent Subscriptions
              </h3>
              <p className="text-customBlack-400 font-medium">
                Your land purchase applications
              </p>
            </div>
            <Link
              to="/client/portal/subscriptions"
              className="flex items-center gap-1.5 text-customPurple-600 text-sm font-bold hover:underline"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-customBlack-50">
            {recentSubscriptions.map((sub) => (
              <div
                key={sub._id}
                className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-customPurple-50/30 transition-colors"
              >
                <div>
                  <p className="font-bold text-customBlack-900">
                    {sub.estateName}
                  </p>
                  <p className="text-xs text-customBlack-400">
                    {sub.plotSize} · {sub.plotType} · {sub.numberOfPlots} plot
                    {sub.numberOfPlots > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-sm font-bold text-customPurple-700">
                    {formatCurrency(sub.totalAmount)}
                  </span>
                  <StatusBadge status={sub.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Inspections */}
      {recentInspections.length > 0 && (
        <section
          className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden animate-fadeIn"
          style={{ animationDelay: "500ms" }}
        >
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-customBlack-50">
            <div>
              <h3 className="text-2xl font-bold text-customBlack-900">
                Inspection Bookings
              </h3>
              <p className="text-customBlack-400 font-medium">
                Your site visit schedule
              </p>
            </div>
            <Link
              to="/client/portal/inspections"
              className="flex items-center gap-1.5 text-customPurple-600 text-sm font-bold hover:underline"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-customBlack-50">
            {recentInspections.map((insp) => (
              <div
                key={insp._id}
                className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-customPurple-50/30 transition-colors"
              >
                <div>
                  <p className="font-bold text-customBlack-900">
                    {insp.estateName}
                  </p>
                  <p className="text-xs text-customBlack-400 flex items-center gap-1.5">
                    <Calendar size={11} />
                    {formatDate(insp.inspectionDate)} · {insp.persons} person
                    {insp.persons > 1 ? "s" : ""}
                  </p>
                </div>
                <StatusBadge status={insp.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {recentSubscriptions.length === 0 && recentInspections.length === 0 && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 p-16 text-center animate-fadeIn">
          <div className="w-16 h-16 bg-customPurple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home size={28} className="text-customPurple-500" />
          </div>
          <h3 className="text-xl font-bold text-customBlack-900 mb-2">
            No activity yet
          </h3>
          <p className="text-customBlack-400 text-sm mb-6">
            Your subscription and inspection history will appear here once you
            make a booking.
          </p>
          <Link
            to="/developments"
            className="inline-flex items-center gap-2 bg-customPurple-500 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-customPurple-700 transition-colors"
          >
            Explore Estates
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Subscriptions Tab ──────────────────────────────────────────────────────
function PaymentProgress({ sub }) {
  const pct = Math.min(
    100,
    Math.round(((sub.amountPaid || 0) / sub.totalAmount) * 100),
  );
  const balance = sub.totalAmount - (sub.amountPaid || 0);
  return (
    <div className="mt-3 p-3 rounded-xl bg-customPurple-50/60 border border-customPurple-100">
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="text-customBlack-500">Payment Progress</span>
        <span className="text-customPurple-600">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-customPurple-100 overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(to right,#3F0C91,#700CEB)",
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-customBlack-400">Paid</p>
          <p className="font-black text-green-600">
            {formatCurrency(sub.amountPaid || 0)}
          </p>
        </div>
        <div>
          <p className="text-customBlack-400">Balance</p>
          <p className="font-black text-red-500">{formatCurrency(balance)}</p>
        </div>
        <div>
          <p className="text-customBlack-400">Total</p>
          <p className="font-black text-customPurple-700">
            {formatCurrency(sub.totalAmount)}
          </p>
        </div>
      </div>
      {sub.installmentSchedule?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-customPurple-100">
          <p className="text-xs font-bold text-customBlack-400 mb-1">
            Next Due
          </p>
          {(() => {
            const next = sub.installmentSchedule.find((s) => !s.isPaid);
            return next ? (
              <p className="text-xs font-black text-amber-600">
                {formatCurrency(next.amount)} — {formatDate(next.dueDate)}
              </p>
            ) : (
              <p className="text-xs font-bold text-green-600">
                All instalments paid ✓
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function SubscriptionsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState(null); // selected subscription for detail view

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: 10,
          ...(status && { status }),
        });
        const res = await authFetch(`/api/subscriptions/my`);
        if (!res.ok) throw new Error("Failed to load subscriptions");
        const subs = await res.json();
        setData({ subscriptions: subs, pages: 1, total: subs.length });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, status]);

  const STATUSES = [
    "",
    "pending",
    "confirmed",
    "outright_paid",
    "partial_paid",
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

  // ── Show detail view when a subscription is selected ──────────────────────
  if (selected) {
    return (
      <ClientSubscriptionDetail
        sub={selected}
        onBack={() => setSelected(null)}
        authFetch={authFetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-customBlack-900">
            My Subscriptions
          </h3>
          <p className="text-customBlack-400 font-medium text-sm mt-1">
            All your land purchase applications
          </p>
        </div>
        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUSES.map((s) => {
            const meta = s ? STATUS_META[s] : null;
            return (
              <button
                key={s || "all"}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  status === s
                    ? "bg-customPurple-500 text-white shadow-md"
                    : "bg-customBlack-50 text-customBlack-500 hover:bg-customPurple-50"
                }`}
              >
                {s ? meta?.label : "All"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-customPurple-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-sm">{error}</div>
        ) : data?.subscriptions?.length === 0 ? (
          <div className="py-20 text-center">
            <FaClipboardList
              size={40}
              className="mx-auto text-customBlack-200 mb-4"
            />
            <p className="font-bold text-customBlack-500">
              No subscriptions found
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-customBlack-50/50">
                    {[
                      "Estate",
                      "Plot Details",
                      "Amount",
                      "Payment Plan",
                      "Status",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-xs font-bold text-customBlack-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-customBlack-50">
                  {data.subscriptions.map((sub) => (
                    <>
                      <tr
                        key={sub._id}
                        className="hover:bg-customPurple-50/30 transition-colors cursor-pointer"
                        onClick={() => setSelected(sub)}
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-customBlack-900 text-sm">
                            {sub.estateName}
                          </p>
                          <p className="text-xs text-customBlack-400 font-mono">
                            {sub.referenceNumber}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-customBlack-600">
                          {sub.numberOfPlots} × {sub.plotSize}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-customPurple-700 text-sm">
                            {formatCurrency(sub.totalAmount)}
                          </p>
                          {sub.amountPaid > 0 && (
                            <p className="text-xs text-green-600 font-bold">
                              {formatCurrency(sub.amountPaid)} paid
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-customBlack-600">
                          {sub.paymentPlan}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={sub.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-customBlack-400">
                          {formatDate(sub.createdAt)}
                        </td>
                      </tr>
                      {expanded[sub._id] && (
                        <tr key={sub._id + "-detail"}>
                          <td
                            colSpan={6}
                            className="px-6 pb-4 pt-0 bg-customPurple-50/40"
                          >
                            <PaymentProgress sub={sub} />
                            {sub.plotNumber && (
                              <div className="mt-2 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
                                <Shield size={14} className="text-green-600" />
                                <p className="text-xs font-bold text-green-700">
                                  Plot Allocated: {sub.plotNumber}
                                </p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-customBlack-50">
              {data.subscriptions.map((sub) => (
                <div
                  key={sub._id}
                  className="p-4 hover:bg-customPurple-50/20 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-customBlack-900 text-sm">
                        {sub.estateName}
                      </p>
                      <p className="text-xs text-customBlack-400">
                        {sub.numberOfPlots} × {sub.plotSize} · {sub.plotType}
                      </p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-customPurple-700 text-sm">
                      {formatCurrency(sub.totalAmount)}
                    </span>
                    <span className="text-xs text-customBlack-400">
                      {formatDate(sub.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-6 border-t border-customBlack-50">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-customBlack-50 text-customBlack-500 disabled:opacity-40 hover:bg-customPurple-50 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-customBlack-500">
                  Page {page} of {data.pages}
                </span>
                <button
                  disabled={page === data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-customBlack-50 text-customBlack-500 disabled:opacity-40 hover:bg-customPurple-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Inspections Tab ────────────────────────────────────────────────────────
function InspectionsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: 10,
          ...(status && { status }),
        });
        const res = await authFetch(`/api/clients/inspections?${params}`);
        if (!res.ok) throw new Error("Failed to load inspections");
        setData(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, status]);

  const INSPECTION_STATUSES = [
    "",
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-customBlack-900">
            Inspection Bookings
          </h3>
          <p className="text-customBlack-400 font-medium text-sm mt-1">
            Your site visit schedule
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {INSPECTION_STATUSES.map((s) => (
            <button
              key={s || "all"}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                status === s
                  ? "bg-customPurple-500 text-white shadow-md"
                  : "bg-customBlack-50 text-customBlack-500 hover:bg-customPurple-50"
              }`}
            >
              {s ? STATUS_META[s]?.label || s : "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-customPurple-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-sm">{error}</div>
        ) : data?.inspections?.length === 0 ? (
          <div className="py-20 text-center">
            <FaCalendarCheck
              size={40}
              className="mx-auto text-customBlack-200 mb-4"
            />
            <p className="font-bold text-customBlack-500">
              No inspections found
            </p>
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-customBlack-50/50">
                    {["Estate", "Date", "Persons", "Status", "Booked On"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-xs font-bold text-customBlack-400 uppercase tracking-widest"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-customBlack-50">
                  {data.inspections.map((insp) => (
                    <tr
                      key={insp._id}
                      className="hover:bg-customPurple-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-customBlack-900 text-sm">
                        {insp.estateName}
                      </td>
                      <td className="px-6 py-4 text-sm text-customBlack-600">
                        {new Date(insp.inspectionDate).toLocaleDateString(
                          "en-NG",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-customBlack-600">
                        {insp.persons} person{insp.persons > 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={insp.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-customBlack-400">
                        {formatDate(insp.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-customBlack-50">
              {data.inspections.map((insp) => (
                <div key={insp._id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-customBlack-900 text-sm">
                      {insp.estateName}
                    </p>
                    <StatusBadge status={insp.status} />
                  </div>
                  <p className="text-xs text-customBlack-400 flex items-center gap-1.5">
                    <Calendar size={11} />
                    {new Date(insp.inspectionDate).toLocaleDateString("en-NG", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    · {insp.persons} person{insp.persons > 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>

            {data.pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-6 border-t border-customBlack-50">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-customBlack-50 text-customBlack-500 disabled:opacity-40 hover:bg-customPurple-50 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-customBlack-500">
                  Page {page} of {data.pages}
                </span>
                <button
                  disabled={page === data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-customBlack-50 text-customBlack-500 disabled:opacity-40 hover:bg-customPurple-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Documents Tab ──────────────────────────────────────────────────────────
const DOC_META = {
  acknowledgement: {
    label: "Subscription Acknowledgement",
    icon: FileText,
    color: "#700CEB",
    desc: "Confirms receipt of your application",
  },
  contract: {
    label: "Contract of Sale",
    icon: Shield,
    color: "#059669",
    desc: "Official purchase agreement — sign and return",
  },
  invoice: {
    label: "Payment Invoice",
    icon: CreditCard,
    color: "#d97706",
    desc: "Payment details and bank account",
  },
  schedule: {
    label: "Instalment Schedule",
    icon: Calendar,
    color: "#0891b2",
    desc: "Your monthly payment breakdown",
  },
  receipt: {
    label: "Payment Receipt",
    icon: CheckCircle,
    color: "#059669",
    desc: "Proof of payment received",
  },
  allocation: {
    label: "Letter of Allocation",
    icon: Star,
    color: "#700CEB",
    desc: "Official plot allocation certificate",
  },
  certificate: {
    label: "Investment Certificate",
    icon: Star,
    color: "#700CEB",
    desc: "Buy2Sell investment certificate",
  },
  agreement: {
    label: "Investment Agreement",
    icon: Shield,
    color: "#059669",
    desc: "Buy2Sell investment agreement",
  },
  payout_confirmation: {
    label: "Payout Confirmation",
    icon: Wallet,
    color: "#059669",
    desc: "Investment payout confirmation letter",
  },
};

function DocumentCard({ doc, subId, isBuy2Sell }) {
  const [downloading, setDownloading] = useState(false);
  const meta = DOC_META[doc.type] || {
    label: doc.label,
    icon: FileText,
    color: "#700CEB",
    desc: "",
  };
  const Icon = meta.icon;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const endpoint = isBuy2Sell
        ? `/api/buy2sell/leads/${subId}/documents/${doc.type}`
        : `/api/subscriptions/${subId}/documents/${doc.type}`;
      const res = await fetchBlob(endpoint);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.label.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      alert(`Download failed: ${e.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-customBlack-100 bg-white hover:shadow-sm transition-all">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${meta.color}12`,
            border: `1px solid ${meta.color}22`,
          }}
        >
          <Icon size={17} style={{ color: meta.color }} />
        </div>
        <div>
          <p className="font-bold text-customBlack-900 text-sm">
            {doc.label || meta.label}
          </p>
          <p className="text-xs text-customBlack-400">
            {meta.desc} · {formatDate(doc.generatedAt)}
          </p>
        </div>
      </div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50"
        style={{
          background: `${meta.color}12`,
          color: meta.color,
          border: `1px solid ${meta.color}22`,
        }}
      >
        {downloading ? (
          <>
            <RefreshCw size={12} className="animate-spin" /> Generating…
          </>
        ) : (
          <>
            <Download size={12} /> Download PDF
          </>
        )}
      </button>
    </div>
  );
}

// ── Investment Detail Modal ────────────────────────────────────────────────
function InvestmentDetailModal({ lead, onClose }) {
  const [downloading, setDownloading] = useState(null);

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
          month: "long",
          year: "numeric",
        })
      : "—";
  const PURPLE = "#700CEB";
  const DARK = "#3F0C91";

  const download = async (docType, label) => {
    setDownloading(docType);
    try {
      const res = await fetchBlob(
        `/api/buy2sell/leads/${lead._id}/documents/${docType}`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${label.replace(/\s+/g, "-")}-${lead.referenceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      alert(`Download failed: ${e.message}`);
    } finally {
      setDownloading(null);
    }
  };

  const pct = lead.maturityProgressPercent ?? 0;
  const balance = Math.max(
    0,
    (lead.principalAmount || 0) - (lead.amountPaid || 0),
  );
  const isActive = lead.status === "active" || lead.status === "matured";
  const isPaid = lead.status === "paid_out";

  const STATUS_LABEL = {
    pending: "Pending Review",
    partial_paid: "Partial Payment Received",
    active: "Investment Active",
    matured: "Investment Matured",
    paid_out: "Paid Out",
    closed: "Closed",
  };
  const STATUS_COLOR = {
    pending: "#d97706",
    partial_paid: "#0891b2",
    active: "#059669",
    matured: PURPLE,
    paid_out: "#059669",
    closed: "#6b7280",
  };

  const DOC_LABELS = {
    agreement: "Investment Agreement",
    certificate: "Investment Certificate",
    payout_confirmation: "Payout Confirmation",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 640,
          maxHeight: "94vh",
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          overflowY: "auto",
          boxShadow: "0 -16px 64px rgba(0,0,0,0.2)",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 10,
            paddingBottom: 4,
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 4,
              background: "#e5e7eb",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            padding: "16px 24px 20px",
            background: `linear-gradient(135deg,${DARK},${PURPLE})`,
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  margin: "0 0 3px",
                }}
              >
                Buy2Sell Investment
              </p>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  margin: "0 0 3px",
                  letterSpacing: "-0.03em",
                }}
              >
                {lead.duration} Plan
              </h3>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.65)",
                  margin: 0,
                  fontFamily: "monospace",
                }}
              >
                {lead.referenceNumber}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 8,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                }}
              >
                {STATUS_LABEL[lead.status] || lead.status}
              </span>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Status banner */}
          {lead.status === "partial_paid" && (
            <div
              style={{
                background: "rgba(8,145,178,0.07)",
                border: "1px solid rgba(8,145,178,0.2)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0891b2",
                  margin: "0 0 2px",
                }}
              >
                ⏳ Partial Payment Received
              </p>
              <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>
                Balance of <strong>{fmtNGN(balance)}</strong> is outstanding.
                Please complete your payment to activate the investment.
              </p>
            </div>
          )}
          {lead.status === "matured" && (
            <div
              style={{
                background: "rgba(112,12,235,0.06)",
                border: "1px solid rgba(112,12,235,0.2)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: PURPLE,
                  margin: "0 0 2px",
                }}
              >
                🎊 Investment Matured!
              </p>
              <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>
                Your investment has matured. Payout of{" "}
                <strong>{fmtNGN(lead.expectedPayout)}</strong> is being
                processed.
              </p>
            </div>
          )}
          {lead.status === "paid_out" && (
            <div
              style={{
                background: "rgba(5,150,105,0.07)",
                border: "1px solid rgba(5,150,105,0.2)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#059669",
                  margin: "0 0 2px",
                }}
              >
                ✅ Payout Sent!
              </p>
              <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>
                Your payout of{" "}
                <strong>
                  {fmtNGN(lead.actualPayout || lead.expectedPayout)}
                </strong>{" "}
                has been sent on {fmtDate(lead.payoutDate)}.
              </p>
            </div>
          )}

          {/* Stats grid */}
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 10px",
              }}
            >
              Investment Summary
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {[
                ["Principal", fmtNGN(lead.principalAmount), "#0f0a1e"],
                ["Amount Paid", fmtNGN(lead.amountPaid || 0), "#059669"],
                [
                  "Balance Due",
                  fmtNGN(balance),
                  balance > 0 ? "#dc2626" : "#059669",
                ],
                ["ROI Rate", `${lead.roiPercent}% (locked)`, PURPLE],
                ["Expected ROI", fmtNGN(lead.expectedROI || 0), "#059669"],
                ["Total at Maturity", fmtNGN(lead.expectedPayout || 0), DARK],
                ["Duration", lead.duration, "#374151"],
                ["Maturity Date", fmtDate(lead.maturityDate), "#374151"],
              ].map(([l, v, c]) => (
                <div
                  key={l}
                  style={{
                    background: "#f9f6ff",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 2px",
                    }}
                  >
                    {l}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: c,
                      margin: 0,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {v}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Maturity progress bar */}
          {isActive && lead.investmentDate && (
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "16px 18px",
                border: "1px solid rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#374151",
                    margin: 0,
                  }}
                >
                  Maturity Progress
                </p>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: pct >= 100 ? "#059669" : PURPLE,
                  }}
                >
                  {pct}%
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  background: "#f0eeff",
                  borderRadius: 6,
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    height: "100%",
                    borderRadius: 6,
                    background:
                      pct >= 100
                        ? "linear-gradient(to right,#059669,#34d399)"
                        : `linear-gradient(to right,${DARK},${PURPLE})`,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: "#9ca3af",
                }}
              >
                <span>Started: {fmtDate(lead.investmentDate)}</span>
                {(lead.daysRemaining ?? 0) > 0 && (
                  <span style={{ fontWeight: 700, color: PURPLE }}>
                    {lead.daysRemaining} days left
                  </span>
                )}
                <span>Matures: {fmtDate(lead.maturityDate)}</span>
              </div>
            </div>
          )}

          {/* Bank payment details — only for pending / partial_paid */}
          {["pending", "partial_paid"].includes(lead.status) && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid rgba(5,150,105,0.2)",
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#059669",
                  margin: "0 0 8px",
                }}
              >
                💳 Make Your Payment
              </p>
              <p style={{ fontSize: 12, color: "#374151", margin: "0 0 4px" }}>
                <strong>Bank:</strong> ACCESS BANK PLC
              </p>
              <p style={{ fontSize: 12, color: "#374151", margin: "0 0 4px" }}>
                <strong>Account:</strong> KEMCHUTA HOMES LIMITED
              </p>
              <p style={{ fontSize: 12, color: "#374151", margin: "0 0 8px" }}>
                <strong>Number:</strong> XXXXXXXXXX
              </p>
              <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>
                <strong>Reference:</strong>{" "}
                <span
                  style={{
                    color: PURPLE,
                    fontWeight: 800,
                    fontFamily: "monospace",
                  }}
                >
                  {lead.referenceNumber}
                </span>
              </p>
              <p style={{ fontSize: 11, color: "#6b7280", margin: "8px 0 0" }}>
                Always quote your reference on every transfer. Send proof to
                info@kemchutahomesltd.com
              </p>
            </div>
          )}

          {/* Documents */}
          {lead.documents?.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 10px",
                }}
              >
                Your Documents ({lead.documents.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lead.documents.map((doc, i) => {
                  const label = DOC_LABELS[doc.type] || doc.label || doc.type;
                  const isLoading = downloading === doc.type;
                  const docColors = {
                    agreement: {
                      bg: "rgba(5,150,105,0.08)",
                      color: "#059669",
                      icon: "📄",
                    },
                    certificate: {
                      bg: "rgba(112,12,235,0.08)",
                      color: PURPLE,
                      icon: "🏆",
                    },
                    payout_confirmation: {
                      bg: "rgba(5,150,105,0.08)",
                      color: "#059669",
                      icon: "✅",
                    },
                  };
                  const style = docColors[doc.type] || {
                    bg: "rgba(112,12,235,0.06)",
                    color: PURPLE,
                    icon: "📎",
                  };
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: style.bg,
                        borderRadius: 12,
                        border: `1px solid ${style.color}20`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{style.icon}</span>
                        <div>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#0f0a1e",
                              margin: "0 0 2px",
                            }}
                          >
                            {label}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: "#9ca3af",
                              margin: 0,
                            }}
                          >
                            {doc.generatedAt
                              ? new Date(doc.generatedAt).toLocaleDateString(
                                  "en-NG",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => download(doc.type, label)}
                        disabled={isLoading}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "8px 14px",
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 700,
                          background: style.color,
                          color: "#fff",
                          border: "none",
                          cursor: isLoading ? "not-allowed" : "pointer",
                          opacity: isLoading ? 0.6 : 1,
                          flexShrink: 0,
                        }}
                      >
                        {isLoading ? "⏳ Loading…" : "⬇ Download"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No documents yet */}
          {(!lead.documents || lead.documents.length === 0) && (
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
                color: "#9ca3af",
              }}
            >
              <p style={{ fontSize: 20, margin: "0 0 6px" }}>📋</p>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
                Documents will appear here once your investment is activated.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── InvestmentsTab — dedicated Buy2Sell investments page ──────────────────────
function InvestmentsTab() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

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

  const PURPLE = "#700CEB";
  const DARK = "#3F0C91";

  const STATUS_CONFIG = {
    pending: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
    partial_paid: { label: "Partial Paid", color: "#0891b2", bg: "#e0f2fe" },
    active: { label: "Active", color: "#059669", bg: "#d1fae5" },
    matured: { label: "Matured", color: "#700CEB", bg: "#f3e8ff" },
    paid_out: { label: "Paid Out", color: "#059669", bg: "#d1fae5" },
    closed: { label: "Closed", color: "#6b7280", bg: "#f3f4f6" },
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await authFetch("/api/buy2sell/my");
        if (res.ok) setInvestments(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={36} className="text-customPurple-500 animate-spin" />
      </div>
    );

  if (investments.length === 0)
    return (
      <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 p-16 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: `${PURPLE}10` }}
        >
          <TrendingUp size={36} style={{ color: PURPLE }} />
        </div>
        <h4 className="text-xl font-bold text-customBlack-900 mb-2">
          No Investments Yet
        </h4>
        <p className="text-customBlack-400 text-sm max-w-xs mx-auto mb-6">
          Start your Buy2Sell investment journey and earn up to 75% ROI over 18
          months.
        </p>
        <a
          href="/buy2sell"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "12px 24px",
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 14,
            color: "#fff",
            background: `linear-gradient(135deg,${DARK},${PURPLE})`,
            textDecoration: "none",
          }}
        >
          Start Investing →
        </a>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-customBlack-900">
            My Buy2Sell Investments
          </h3>
          <p className="text-customBlack-400 font-medium text-sm mt-1">
            {investments.length} investment{investments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href="/buy2sell"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 12,
            color: "#fff",
            background: `linear-gradient(135deg,${DARK},${PURPLE})`,
            textDecoration: "none",
          }}
        >
          + New Investment
        </a>
      </div>

      <div className="space-y-4">
        {investments.map((inv, i) => {
          const sc = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending;
          const pct = inv.maturityProgressPercent ?? 0;
          const isActive = inv.status === "active" || inv.status === "matured";

          return (
            <motion.div
              key={inv._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-[1.5rem] shadow-sm border border-customBlack-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedInvestment(inv)}
            >
              {/* Card header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-customBlack-50">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: `${PURPLE}12`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TrendingUp size={20} style={{ color: PURPLE }} />
                  </div>
                  <div>
                    <p className="font-black text-customBlack-900 text-base">
                      {inv.duration} Investment
                    </p>
                    <p className="text-xs text-customBlack-400 font-mono mt-0.5">
                      {inv.referenceNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      background: sc.bg,
                      color: sc.color,
                    }}
                  >
                    {sc.label}
                  </span>
                  <ChevronRight size={16} className="text-customBlack-300" />
                </div>
              </div>

              {/* Card body — 4-stat grid */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    ["Principal", fmtNGN(inv.principalAmount), "#0f0a1e"],
                    ["ROI Rate", `${inv.roiPercent}% locked`, PURPLE],
                    ["Expected ROI", fmtNGN(inv.expectedROI || 0), "#059669"],
                    ["Maturity", fmtDate(inv.maturityDate), "#374151"],
                  ].map(([l, v, c]) => (
                    <div key={l}>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                        {l}
                      </p>
                      <p className="text-sm font-black" style={{ color: c }}>
                        {v}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Maturity progress bar — only for active investments */}
                {isActive && inv.investmentDate && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-gray-400">
                        Investment Progress
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: pct >= 100 ? "#059669" : PURPLE }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "#f0eeff",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: 4,
                          background:
                            pct >= 100
                              ? "#059669"
                              : `linear-gradient(to right,${DARK},${PURPLE})`,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                    {(inv.daysRemaining ?? 0) > 0 && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {inv.daysRemaining} days until maturity
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Investment detail modal */}
      <AnimatePresence>
        {selectedInvestment && (
          <InvestmentDetailModal
            lead={selectedInvestment}
            onClose={() => setSelectedInvestment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DocumentsTab() {
  const [subs, setSubs] = useState([]);
  const [b2s, setB2s] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [subRes, b2sRes] = await Promise.all([
          authFetch("/api/subscriptions/my"),
          authFetch("/api/buy2sell/my"),
        ]);
        if (subRes.ok) setSubs(await subRes.json());
        if (b2sRes.ok) setB2s(await b2sRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const allSubs = subs.filter((s) => s.documents?.length > 0);
  const allB2s = b2s.filter((s) => s.documents?.length > 0);
  const hasAny = allSubs.length > 0 || allB2s.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-customBlack-900">
          My Documents
        </h3>
        <p className="text-customBlack-400 font-medium text-sm mt-1">
          Download and print your legal documents and certificates
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-customPurple-500 animate-spin" />
        </div>
      ) : !hasAny ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 p-16 text-center">
          <div className="w-16 h-16 bg-customPurple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-customPurple-500" />
          </div>
          <h4 className="text-xl font-bold text-customBlack-900 mb-2">
            No Documents Yet
          </h4>
          <p className="text-customBlack-400 text-sm max-w-sm mx-auto">
            Documents are generated automatically when your subscription is
            approved. Check back after your application is reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Land Subscriptions */}
          {allSubs.map((sub) => (
            <div
              key={sub._id}
              className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-customBlack-50 flex items-center justify-between">
                <div>
                  <p className="font-black text-customBlack-900">
                    {sub.estateName}
                  </p>
                  <p className="text-xs text-customBlack-400 font-mono mt-0.5">
                    {sub.referenceNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={sub.status} />
                  <span className="text-xs text-customBlack-400 bg-customBlack-50 px-2 py-1 rounded-lg font-bold">
                    Land Purchase
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {sub.documents.map((doc, i) => (
                  <DocumentCard
                    key={i}
                    doc={doc}
                    subId={sub._id}
                    isBuy2Sell={false}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Buy2Sell Investments */}
          {allB2s.map((lead) => {
            const pct = lead.maturityProgressPercent ?? 0;
            const isActive =
              lead.status === "active" || lead.status === "matured";
            return (
              <div
                key={lead._id}
                className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedInvestment(lead)}
              >
                <div className="px-6 py-4 border-b border-customBlack-50 flex items-center justify-between">
                  <div>
                    <p className="font-black text-customBlack-900">
                      Buy2Sell — {lead.duration} Investment
                    </p>
                    <p className="text-xs text-customBlack-400 font-mono mt-0.5">
                      {lead.referenceNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={lead.status} />
                    <span className="text-xs text-customPurple-600 bg-customPurple-50 px-2 py-1 rounded-lg font-bold">
                      View Details →
                    </span>
                  </div>
                </div>
                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-customPurple-50/50 border-b border-customPurple-100">
                  <div>
                    <p className="text-xs text-customBlack-400">Principal</p>
                    <p className="text-sm font-black text-customBlack-900">
                      {formatCurrency(lead.principalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-customBlack-400">ROI Rate</p>
                    <p className="text-sm font-black text-customPurple-700">
                      {lead.roiPercent}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-customBlack-400">Total Payout</p>
                    <p className="text-sm font-black text-green-600">
                      {formatCurrency(lead.expectedPayout)}
                    </p>
                  </div>
                </div>
                {/* Maturity progress bar */}
                {isActive && (
                  <div className="px-6 py-3 border-b border-customBlack-50">
                    <div className="flex justify-between text-xs text-customBlack-400 mb-1.5">
                      <span>Maturity Progress</span>
                      <span className="font-bold" style={{ color: "#700CEB" }}>
                        {pct}%
                        {lead.daysRemaining > 0
                          ? ` · ${lead.daysRemaining}d left`
                          : ""}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "#f0eeff",
                        borderRadius: 6,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: 6,
                          background:
                            pct >= 100
                              ? "#059669"
                              : "linear-gradient(to right,#3F0C91,#700CEB)",
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="p-4 space-y-2">
                  {lead.documents.slice(0, 2).map((doc, i) => (
                    <DocumentCard
                      key={i}
                      doc={doc}
                      subId={lead._id}
                      isBuy2Sell={true}
                    />
                  ))}
                  {lead.documents.length > 2 && (
                    <p className="text-xs text-customBlack-400 text-center pt-1">
                      +{lead.documents.length - 2} more documents — click to
                      view all
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Investment detail modal */}
          <AnimatePresence>
            {selectedInvestment && (
              <InvestmentDetailModal
                lead={selectedInvestment}
                onClose={() => setSelectedInvestment(null)}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Profile Tab ────────────────────────────────────────────────────────────
function ProfileTab({ client }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-customBlack-900">My Profile</h3>
        <p className="text-customBlack-400 font-medium text-sm mt-1">
          Your account information
        </p>
      </div>
      <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-customPurple-600 to-customPurple-800 p-8 flex items-center gap-6">
          <img
            src={client.avatar || defaultAvatar}
            className="w-20 h-20 rounded-3xl ring-4 ring-white/30 object-cover"
            alt="Profile"
          />
          <div>
            <h4 className="text-2xl font-bold text-white">
              {client.firstName} {client.lastName}
            </h4>
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mt-1 uppercase tracking-widest">
              Client
            </span>
          </div>
        </div>

        {/* Profile details */}
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { Icon: User, label: "First Name", value: client.firstName },
            { Icon: User, label: "Last Name", value: client.lastName },
            { Icon: Mail, label: "Email Address", value: client.email },
            { Icon: Phone, label: "Phone Number", value: client.phone },
            {
              Icon: Calendar,
              label: "Member Since",
              value: formatDate(client.createdAt),
            },
          ].map(({ Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-4 p-4 bg-customBlack-50/50 rounded-2xl"
            >
              <div className="w-10 h-10 bg-customPurple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-customPurple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-customBlack-400 uppercase tracking-widest mb-1">
                  {label}
                </p>
                <p className="font-bold text-customBlack-900 text-sm">
                  {value || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PORTAL COMPONENT ──────────────────────────────────────────────────
export default function ClientPortal() {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { pathname } = useLocation();

  const user = getClientUser();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getClientToken();
      if (!token) {
        window.location.href = "/client/login";
        return;
      }

      const res = await authFetch("/api/clients/dashboard");
      if (res.status === 401) {
        localStorage.removeItem("clientToken");
        localStorage.removeItem("clientUser");
        window.location.href = "/client/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load dashboard");
      setDashData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientUser");
    window.location.href = "/client/login";
  };

  const navItems = [
    { name: "Overview", path: "/client/portal", icon: <FaTachometerAlt /> },
    {
      name: "Subscriptions",
      path: "/client/portal/subscriptions",
      icon: <FaClipboardList />,
    },
    {
      name: "Investments",
      path: "/client/portal/investments",
      icon: <TrendingUp size={16} />,
    },
    {
      name: "Inspections",
      path: "/client/portal/inspections",
      icon: <FaCalendarCheck />,
    },
    {
      name: "Documents",
      path: "/client/portal/documents",
      icon: <FaFileAlt />,
    },
  ];

  const SidebarNav = () => (
    <>
      <div>
        <h1 className="text-xl font-bold mb-8 pl-3">
          Kemchuta <span className="text-white/60">Portal</span>
        </h1>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => isMobile && setSideOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition cursor-pointer text-sm ${
                  isActive
                    ? "bg-customPurple-900/80 font-semibold"
                    : "hover:bg-customPurple-900/60"
                }`}
              >
                {item.icon}
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 mt-6 space-y-2">
        <Link
          to="/client/portal/profile"
          onClick={() => isMobile && setSideOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm ${
            pathname === "/client/portal/profile"
              ? "bg-customPurple-900/80 font-semibold"
              : "hover:bg-customPurple-900/60"
          }`}
        >
          <User size={14} />
          <span>My Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-customPurple-800 hover:bg-customPurple-900 transition text-sm font-semibold"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={loadDashboard} />;

  const client = dashData?.client || user;
  const fullName =
    `${client?.firstName || ""} ${client?.lastName || ""}`.trim();

  return (
    <div className="flex min-h-screen bg-[#fdfdfd] font-poppins relative">
      {/* Mobile hamburger */}
      <div className="absolute top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setSideOpen(!sideOpen)}
          className="text-customPurple-300 focus:outline-none"
        >
          {sideOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      {isMobile ? (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: sideOpen ? 0 : -300 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="fixed top-0 left-0 h-screen w-64 bg-customPurple-600 text-white flex flex-col justify-between py-6 px-4 z-40 shadow-2xl"
        >
          <SidebarNav />
        </motion.aside>
      ) : (
        <aside className="w-64 bg-customPurple-500 text-white flex flex-col justify-between py-6 px-4 sticky top-0 h-screen">
          <SidebarNav />
        </aside>
      )}

      {/* Backdrop */}
      {isMobile && sideOpen && (
        <div
          onClick={() => setSideOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto bg-[#fafafa] transition-all duration-300 ${sideOpen && isMobile ? "pointer-events-none blur-sm" : ""}`}
      >
        {/* Fixed blur shapes (mirrors RealtorDashboard) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-customPurple-100 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-customPurple-50 rounded-full blur-3xl opacity-40" />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-customBlack-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="pl-8 lg:pl-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-customBlack-900">
                Client<span className="text-customPurple-500">Portal</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-customBlack-900">
                  {fullName}
                </p>
                <p className="text-xs text-customPurple-600 font-medium">
                  Verified Client
                </p>
              </div>
              <img
                src={client?.avatar || defaultAvatar}
                className="w-10 h-10 rounded-full ring-2 ring-customPurple-500 ring-offset-2"
                alt="Profile"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome banner */}
          <div className="mb-8 animate-fadeIn">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-customBlack-900">
              Welcome Back,{" "}
              <span className="text-customPurple-600">{client?.firstName}</span>
              !
            </h2>
            <p className="text-customBlack-500 mt-2 font-medium">
              Here's an overview of your property journey with Kemchuta Homes.
            </p>
          </div>

          <Routes>
            <Route index element={<OverviewTab dashData={dashData} />} />
            <Route path="subscriptions" element={<SubscriptionsTab />} />
            <Route path="investments" element={<InvestmentsTab />} />
            <Route path="inspections" element={<InspectionsTab />} />
            <Route path="documents" element={<DocumentsTab />} />
            <Route path="profile" element={<ProfileTab client={client} />} />
            <Route
              path="*"
              element={<Navigate to="/client/portal" replace />}
            />
          </Routes>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
