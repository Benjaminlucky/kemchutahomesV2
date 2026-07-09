/**
 * SubscriptionProfile.jsx
 * Full-screen admin view of a single subscription.
 * Shows: milestone timeline, progress bar, instalment schedule,
 * payment recording, notes/follow-ups, document downloads.
 *
 * Usage: <SubscriptionProfile id={sub._id} onBack={fn} />
 */

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR, { mutate as globalMutate } from "swr";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText,
  Download,
  Plus,
  Send,
  MessageSquare,
  PhoneCall,
  Home,
  TrendingUp,
  Wallet,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Loader2,
  User,
  Calendar,
  Shield,
  Star,
  RefreshCw,
  ClipboardList,
  BarChart3,
  Lock,
  Unlock,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_BASE_URL;
const tok = () => localStorage.getItem("token");

// ── Formatters ────────────────────────────────────────────────────────────────
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
const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// ── Fetcher ───────────────────────────────────────────────────────────────────
const fetcher = async (url) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tok()}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}: Failed to load`);
  }
  return res.json();
};

// ── Status config (full set from model) ──────────────────────────────────────
const STATUS_META = {
  pending: {
    label: "Pending",
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    icon: Clock,
    step: 0,
  },
  confirmed: {
    label: "Confirmed",
    color: "#700CEB",
    bg: "rgba(112,12,235,0.1)",
    icon: CheckCircle,
    step: 1,
  },
  partial_paid: {
    label: "Partial Payment",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    icon: CreditCard,
    step: 2,
  },
  outright_paid: {
    label: "Outright Paid",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    icon: CheckCircle,
    step: 3,
  },
  inst_1_paid: {
    label: "Deposit Paid",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    icon: CheckCircle,
    step: 2,
  },
  inst_2_paid: {
    label: "Instalment 2 Paid",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    icon: CheckCircle,
    step: 2,
  },
  inst_3_paid: {
    label: "Instalment 3 Paid",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    icon: CheckCircle,
    step: 2,
  },
  inst_4_paid: {
    label: "Instalment 4 Paid",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    icon: CheckCircle,
    step: 2,
  },
  inst_5_paid: {
    label: "Instalment 5 Paid",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    icon: CheckCircle,
    step: 2,
  },
  inst_6_paid: {
    label: "Instalment 6 Paid",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    icon: CheckCircle,
    step: 2,
  },
  completed: {
    label: "Payment Complete",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    icon: Star,
    step: 3,
  },
  allocated: {
    label: "Allocated",
    color: "#700CEB",
    bg: "rgba(112,12,235,0.1)",
    icon: Shield,
    step: 4,
  },
  rejected: {
    label: "Rejected",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
    icon: XCircle,
    step: -1,
  },
};

const DOC_META = {
  acknowledgement: {
    label: "Subscription Acknowledgement",
    icon: FileText,
    color: "#700CEB",
  },
  invoice: { label: "Payment Invoice", icon: CreditCard, color: "#d97706" },
  contract: { label: "Contract of Sale", icon: Shield, color: "#059669" },
  schedule: { label: "Instalment Schedule", icon: Calendar, color: "#0891b2" },
  receipt: { label: "Payment Receipt", icon: CheckCircle, color: "#059669" },
  allocation: { label: "Letter of Allocation", icon: Home, color: "#700CEB" },
  deed: { label: "Deed of Assignment", icon: Star, color: "#d97706" },
};

const NOTE_ICONS = {
  call: PhoneCall,
  email: Mail,
  chat: MessageSquare,
  note: ClipboardList,
};

const PURPLE = "#700CEB";
const DARK = "#3F0C91";

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  const I = m.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: m.bg,
        color: m.color,
      }}
    >
      <I size={11} />
      {m.label}
    </span>
  );
}

function Sk({ h = 14, w = "100%" }) {
  return (
    <div
      className="animate-pulse rounded-lg"
      style={{ height: h, width: w, background: "#f0eeff" }}
    />
  );
}

// ── Milestone timeline config ─────────────────────────────────────────────────
function getMilestones(sub) {
  if (!sub) return [];
  const isInst = sub.paymentPlan === "Instalment";
  const confirmedPayments = (sub.payments || []).filter((p) => p.confirmed);

  // A subscription is "confirmed" if either confirmedAt is set OR status is past "pending"
  const isConfirmed =
    !!sub.confirmedAt ||
    (sub.status && sub.status !== "pending" && sub.status !== "rejected");

  const milestones = [
    {
      id: "submitted",
      label: "Subscription Submitted",
      sub: `Reference: ${sub.referenceNumber}`,
      date: sub.createdAt,
      done: true,
      icon: ClipboardList,
      color: PURPLE,
      docTypes: ["acknowledgement", "invoice"],
    },
    {
      id: "confirmed",
      label: "Subscription Confirmed",
      sub: sub.confirmedAt
        ? `Confirmed by ${sub.confirmedByAdmin || "admin"} on ${fmtDate(sub.confirmedAt)}`
        : isConfirmed
          ? "Confirmed — proceed to payment"
          : "Awaiting admin confirmation",
      date: sub.confirmedAt,
      done: isConfirmed,
      icon: CheckCircle,
      color: "#059669",
      docTypes: isConfirmed ? ["invoice"] : [],
    },
  ];

  if (isInst) {
    const schedule = sub.instalmentSchedule || [];
    schedule.forEach((inst, i) => {
      milestones.push({
        id: `inst_${i + 1}`,
        label: i === 0 ? "Deposit Paid (30%)" : `Instalment ${i} Paid`,
        sub: inst.isPaid
          ? `${fmtNGN(inst.amount)} received on ${fmtDate(inst.paidAt)}`
          : `${fmtNGN(inst.amount)} due on ${fmtDate(inst.dueDate)}`,
        date: inst.paidAt,
        done: inst.isPaid,
        due: inst.dueDate,
        overdue: !inst.isPaid && new Date(inst.dueDate) < new Date(),
        icon: inst.isPaid ? CheckCircle : Clock,
        color: inst.isPaid ? "#059669" : "#d97706",
        docTypes: inst.isPaid ? ["receipt"] : [],
      });
    });
  } else {
    milestones.push({
      id: "payment",
      label:
        sub.status === "outright_paid"
          ? "Full Payment Received"
          : sub.status === "partial_paid"
            ? "Partial Payment Received"
            : "Payment Pending",
      sub: confirmedPayments.length
        ? `${fmtNGN(sub.amountPaid)} of ${fmtNGN(sub.totalAmount)}`
        : `${fmtNGN(sub.totalAmount)} outstanding`,
      date: confirmedPayments[0]?.confirmedAt,
      done: confirmedPayments.length > 0,
      icon: confirmedPayments.length ? CreditCard : Clock,
      color: confirmedPayments.length ? "#059669" : "#d97706",
      docTypes: confirmedPayments.length ? ["contract", "receipt"] : [],
    });
  }

  milestones.push({
    id: "completed",
    label: "Payment Completed",
    sub:
      sub.status === "completed" || sub.status === "allocated"
        ? `${fmtNGN(sub.totalAmount)} fully received`
        : `${fmtNGN(Math.max(0, sub.totalAmount - sub.amountPaid))} outstanding`,
    date: null,
    done: ["completed", "allocated"].includes(sub.status),
    icon: Star,
    color: "#700CEB",
    docTypes: ["contract", "schedule"],
  });

  milestones.push({
    id: "allocated",
    label: "Plot Allocated",
    sub: sub.plotNumber ? `Plot: ${sub.plotNumber}` : "Pending full payment",
    date: sub.allocationDate,
    done: sub.status === "allocated",
    icon: Shield,
    color: PURPLE,
    docTypes: ["allocation", "deed"],
  });

  return milestones;
}

// ── SECTION: Progress Bar + Summary ──────────────────────────────────────────
function ProgressSection({ sub }) {
  const pct = sub.paymentProgressPercent || 0;
  const bal = Math.max(0, sub.totalAmount - sub.amountPaid);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "24px 28px",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 4px",
            }}
          >
            Payment Progress
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: PURPLE,
              letterSpacing: "-0.04em",
              margin: 0,
            }}
          >
            {pct}%
          </p>
        </div>
        <StatusBadge status={sub.status} />
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 12,
          background: "#f0eeff",
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%",
            borderRadius: 8,
            background:
              pct === 100
                ? "linear-gradient(to right,#059669,#34d399)"
                : `linear-gradient(to right,${DARK},${PURPLE})`,
          }}
        />
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
        }}
      >
        {[
          { label: "Total", value: fmtNGN(sub.totalAmount), color: "#0f0a1e" },
          { label: "Paid", value: fmtNGN(sub.amountPaid), color: "#059669" },
          {
            label: "Balance",
            value: fmtNGN(bal),
            color: bal > 0 ? "#dc2626" : "#059669",
          },
          {
            label: "Plan",
            value:
              sub.paymentPlan === "Instalment"
                ? `${sub.instalmentMonths}mo`
                : "Outright",
            color: PURPLE,
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              textAlign: "center",
              padding: "10px 0",
              background: "#f9f6ff",
              borderRadius: 10,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 4px",
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 900,
                color,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SECTION: Milestone Timeline ───────────────────────────────────────────────
function MilestoneTimeline({ sub, onDownload }) {
  const milestones = getMilestones(sub);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "24px 28px",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 20px",
        }}
      >
        Journey Timeline
      </p>
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: 19,
            top: 0,
            bottom: 0,
            width: 2,
            background: "#f0eeff",
          }}
        />

        {milestones.map((m, i) => {
          const Icon = m.icon;
          const isLast = i === milestones.length - 1;
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                gap: 16,
                marginBottom: isLast ? 0 : 24,
                position: "relative",
              }}
            >
              {/* Circle */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: m.done
                    ? m.color
                    : m.overdue
                      ? "#dc2626"
                      : "#f0eeff",
                  border: `2px solid ${m.done ? m.color : m.overdue ? "#dc2626" : "#e9d5ff"}`,
                  zIndex: 1,
                  boxShadow: m.done ? `0 0 0 4px ${m.color}18` : "none",
                }}
              >
                <Icon
                  size={16}
                  color={m.done || m.overdue ? "#fff" : "#c084fc"}
                />
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 4,
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: m.overdue
                        ? "#dc2626"
                        : m.done
                          ? "#0f0a1e"
                          : "#6b7280",
                      margin: 0,
                    }}
                  >
                    {m.label}
                    {m.overdue && (
                      <span
                        style={{
                          fontSize: 10,
                          color: "#dc2626",
                          fontWeight: 700,
                          marginLeft: 6,
                          background: "rgba(220,38,38,0.1)",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        OVERDUE
                      </span>
                    )}
                  </p>
                  {m.date && (
                    <p
                      style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0 }}
                    >
                      {fmtDate(m.date)}
                    </p>
                  )}
                </div>
                <p
                  style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 8px" }}
                >
                  {m.sub}
                </p>

                {/* Doc download chips */}
                {m.done && m.docTypes?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {m.docTypes.map((dt) => {
                      const dm = DOC_META[dt];
                      if (!dm) return null;
                      const DI = dm.icon;
                      return (
                        <button
                          key={dt}
                          onClick={() => onDownload(sub._id, dt, dm.label)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: "pointer",
                            background: `${dm.color}10`,
                            color: dm.color,
                            border: `1px solid ${dm.color}25`,
                          }}
                        >
                          <DI size={10} /> {dm.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SECTION: Instalment Schedule Table ────────────────────────────────────────
function InstalmentTable({ sub }) {
  if (sub.paymentPlan !== "Instalment" || !sub.instalmentSchedule?.length)
    return null;
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid rgba(0,0,0,0.07)",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
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
          Instalment Schedule
        </p>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f9f6ff" }}>
            {["#", "Due Date", "Amount", "Status", "Paid Date"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sub.instalmentSchedule.map((inst, i) => {
            const overdue = !inst.isPaid && new Date(inst.dueDate) < new Date();
            return (
              <tr
                key={i}
                style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
              >
                <td
                  style={{
                    padding: "10px 16px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6b7280",
                  }}
                >
                  {i === 0 ? "Deposit" : `Month ${i}`}
                </td>
                <td
                  style={{
                    padding: "10px 16px",
                    fontSize: 12,
                    color: overdue ? "#dc2626" : "#374151",
                    fontWeight: overdue ? 700 : 400,
                  }}
                >
                  {fmtDate(inst.dueDate)}
                  {overdue && (
                    <span
                      style={{
                        fontSize: 9,
                        marginLeft: 4,
                        color: "#dc2626",
                        fontWeight: 700,
                      }}
                    >
                      OVERDUE
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: "10px 16px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#0f0a1e",
                  }}
                >
                  {fmtNGN(inst.amount)}
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 9px",
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      background: inst.isPaid
                        ? "rgba(5,150,105,0.1)"
                        : overdue
                          ? "rgba(220,38,38,0.1)"
                          : "rgba(217,119,6,0.1)",
                      color: inst.isPaid
                        ? "#059669"
                        : overdue
                          ? "#dc2626"
                          : "#d97706",
                    }}
                  >
                    {inst.isPaid ? "✓ Paid" : overdue ? "Overdue" : "Pending"}
                  </span>
                </td>
                <td
                  style={{
                    padding: "10px 16px",
                    fontSize: 11,
                    color: "#9ca3af",
                  }}
                >
                  {fmtDate(inst.paidAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── SECTION: Record Payment ───────────────────────────────────────────────────
function PaymentPanel({ sub, onRefresh }) {
  const [form, setForm] = useState({
    amount: "",
    method: "Bank Transfer",
    reference: "",
    note: "",
    paidAt: "",
  });
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(null); // paymentId being confirmed
  const [err, setErr] = useState("");

  const pendingPayments = (sub.payments || []).filter((p) => !p.confirmed);

  const log = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      setErr("Enter a valid amount");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`${BASE}/api/subscriptions/${sub._id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok()}`,
        },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setForm({
        amount: "",
        method: "Bank Transfer",
        reference: "",
        note: "",
        paidAt: "",
      });
      onRefresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirm = async (paymentId) => {
    setConfirming(paymentId);
    try {
      const res = await fetch(
        `${BASE}/api/subscriptions/${sub._id}/payments/${paymentId}/confirm`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${tok()}` },
        },
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      onRefresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setConfirming(null);
    }
  };

  const inp = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    color: "#0f0a1e",
    background: "#f9fafb",
    border: "1.5px solid rgba(0,0,0,0.1)",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "24px 28px",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 18px",
        }}
      >
        Record Payment
      </p>

      {/* Pending payments awaiting confirmation */}
      {pendingPayments.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#d97706",
              margin: "0 0 10px",
            }}
          >
            ⏳ Pending Confirmation ({pendingPayments.length})
          </p>
          {pendingPayments.map((p) => (
            <div
              key={p._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "rgba(217,119,6,0.06)",
                borderRadius: 12,
                marginBottom: 8,
                border: "1px solid rgba(217,119,6,0.2)",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#0f0a1e",
                    margin: "0 0 2px",
                  }}
                >
                  {fmtNGN(p.amount)}
                </p>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                  {p.method} · {fmtDate(p.paidAt)}{" "}
                  {p.reference && `· Ref: ${p.reference}`}
                </p>
              </div>
              <button
                onClick={() => confirm(p._id)}
                disabled={confirming === p._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  background: "linear-gradient(135deg,#059669,#34d399)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {confirming === p._id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Unlock size={13} />
                )}
                Confirm & Issue Receipt
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Log new payment form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              display: "block",
              marginBottom: 5,
            }}
          >
            Amount (NGN)
          </label>
          <input
            type="number"
            placeholder="e.g. 500000"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            style={inp}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              display: "block",
              marginBottom: 5,
            }}
          >
            Date Received
          </label>
          <input
            type="date"
            value={form.paidAt}
            onChange={(e) => setForm((f) => ({ ...f, paidAt: e.target.value }))}
            style={inp}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              display: "block",
              marginBottom: 5,
            }}
          >
            Payment Method
          </label>
          <select
            value={form.method}
            onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
            style={{ ...inp, cursor: "pointer" }}
          >
            {["Bank Transfer", "Cash", "POS", "Online"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              display: "block",
              marginBottom: 5,
            }}
          >
            Bank Reference
          </label>
          <input
            type="text"
            placeholder="Transfer reference"
            value={form.reference}
            onChange={(e) =>
              setForm((f) => ({ ...f, reference: e.target.value }))
            }
            style={inp}
          />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              display: "block",
              marginBottom: 5,
            }}
          >
            Internal Note
          </label>
          <input
            type="text"
            placeholder="Optional note"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            style={inp}
          />
        </div>
      </div>

      {err && (
        <p style={{ fontSize: 12, color: "#dc2626", margin: "10px 0 0" }}>
          {err}
        </p>
      )}

      <button
        onClick={log}
        disabled={saving}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "12px 0",
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 800,
          color: "#fff",
          border: "none",
          background: saving
            ? "rgba(112,12,235,0.4)"
            : `linear-gradient(135deg,${DARK},${PURPLE})`,
          cursor: saving ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {saving ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Logging…
          </>
        ) : (
          <>
            <CreditCard size={14} /> Log Incoming Payment
          </>
        )}
      </button>
      <p
        style={{
          fontSize: 11,
          color: "#9ca3af",
          textAlign: "center",
          marginTop: 8,
        }}
      >
        Payment is logged as pending. Use "Confirm & Issue Receipt" to verify
        and send the receipt to the client.
      </p>
    </div>
  );
}

// ── SECTION: Notes / Follow-up ────────────────────────────────────────────────
function NotesPanel({ sub, onRefresh }) {
  const [text, setText] = useState("");
  const [type, setType] = useState("note");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const add = async () => {
    if (!text.trim()) {
      setErr("Note cannot be empty");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`${BASE}/api/subscriptions/${sub._id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok()}`,
        },
        body: JSON.stringify({ content: text.trim(), type }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setText("");
      onRefresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const notes = [...(sub.notes || [])].sort(
    (a, b) => new Date(b.addedAt) - new Date(a.addedAt),
  );

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "24px 28px",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 16px",
        }}
      >
        Follow-up Notes
      </p>

      {/* Add note */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {["call", "email", "chat", "note"].map((t) => {
            const I = NOTE_ICONS[t];
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: type === t ? PURPLE : "#f0eeff",
                  color: type === t ? "#fff" : PURPLE,
                  textTransform: "capitalize",
                }}
              >
                <I size={11} /> {t}
              </button>
            );
          })}
        </div>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setErr("");
          }}
          placeholder={`Add a ${type} note…`}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 13,
            color: "#0f0a1e",
            background: "#f9fafb",
            border: "1.5px solid rgba(0,0,0,0.1)",
            outline: "none",
            resize: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        {err && (
          <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>
            {err}
          </p>
        )}
        <button
          onClick={add}
          disabled={saving}
          style={{
            marginTop: 8,
            padding: "9px 20px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            background: saving
              ? "rgba(112,12,235,0.4)"
              : `linear-gradient(135deg,${DARK},${PURPLE})`,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {saving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Plus size={12} />
          )}{" "}
          Add Note
        </button>
      </div>

      {/* Notes list */}
      <div style={{ maxHeight: 320, overflowY: "auto" }}>
        {notes.length === 0 ? (
          <p
            style={{
              fontSize: 12,
              color: "#9ca3af",
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            No notes yet. Add your first follow-up note.
          </p>
        ) : (
          notes.map((n, i) => {
            const I = NOTE_ICONS[n.type] || ClipboardList;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 14,
                  padding: "12px 14px",
                  background: "#f9f6ff",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: PURPLE + "15",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <I size={13} style={{ color: PURPLE }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: PURPLE,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {n.type}
                    </span>
                    <span style={{ fontSize: 10, color: "#9ca3af" }}>
                      {fmtDateTime(n.addedAt)} · {n.addedBy}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#374151",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {n.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── SECTION: Documents ────────────────────────────────────────────────────────
function DocumentsPanel({ sub }) {
  const [downloading, setDownloading] = useState(null);

  const download = async (id, type, label) => {
    setDownloading(type);
    try {
      const res = await fetch(
        `${BASE}/api/subscriptions/${id}/documents/${type}`,
        {
          headers: { Authorization: `Bearer ${tok()}` },
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to fetch document");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${label}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      alert(`Download failed: ${e.message}`);
    } finally {
      setDownloading(null);
    }
  };

  const docs = sub.documents || [];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "24px 28px",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 16px",
        }}
      >
        Documents ({docs.length})
      </p>

      {docs.length === 0 ? (
        <p
          style={{
            fontSize: 12,
            color: "#9ca3af",
            textAlign: "center",
            padding: "20px 0",
          }}
        >
          No documents generated yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {docs.map((doc, i) => {
            const dm = DOC_META[doc.type] || {
              label: doc.label,
              icon: FileText,
              color: PURPLE,
            };
            const DI = dm.icon;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "#f9f6ff",
                  borderRadius: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${dm.color}12`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DI size={16} style={{ color: dm.color }} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#0f0a1e",
                        margin: "0 0 2px",
                      }}
                    >
                      {doc.label}
                    </p>
                    <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>
                      {fmtDateTime(doc.generatedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => download(sub._id, doc.type, doc.label)}
                  disabled={downloading === doc.type}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "7px 16px",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    background: `${dm.color}12`,
                    color: dm.color,
                    border: `1px solid ${dm.color}25`,
                    cursor:
                      downloading === doc.type ? "not-allowed" : "pointer",
                    opacity: downloading === doc.type ? 0.6 : 1,
                  }}
                >
                  {downloading === doc.type ? (
                    <>
                      <Loader2 size={11} className="animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Download size={11} /> Download PDF
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SECTION: Admin Actions ────────────────────────────────────────────────────
function AdminActions({ sub, onRefresh }) {
  const [confirming, setConfirming] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [plotNum, setPlotNum] = useState("");
  const [plotDesc, setPlotDesc] = useState("");
  const [titleDoc, setTitleDoc] = useState("");
  const [showAlloc, setShowAlloc] = useState(false);
  const [err, setErr] = useState("");

  const confirmSub = async () => {
    setConfirming(true);
    setErr("");
    try {
      const res = await fetch(`${BASE}/api/subscriptions/${sub._id}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${tok()}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      onRefresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setConfirming(false);
    }
  };

  const allocate = async () => {
    if (!plotNum.trim()) {
      setErr("Plot number is required");
      return;
    }
    setAllocating(true);
    setErr("");
    try {
      const res = await fetch(`${BASE}/api/subscriptions/${sub._id}/allocate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok()}`,
        },
        body: JSON.stringify({
          plotNumber: plotNum.trim(),
          plotDescription: plotDesc.trim(),
          titleDocument: titleDoc.trim(),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setShowAlloc(false);
      onRefresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "24px 28px",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 16px",
        }}
      >
        Admin Actions
      </p>

      {err && (
        <div
          style={{
            display: "flex",
            gap: 8,
            background: "rgba(220,38,38,0.07)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 14,
          }}
        >
          <AlertTriangle
            size={14}
            style={{ color: "#dc2626", flexShrink: 0 }}
          />
          <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{err}</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Confirm subscription */}
        {sub.status === "pending" && (
          <button
            onClick={confirmSub}
            disabled={confirming}
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              background: confirming
                ? "rgba(5,150,105,0.4)"
                : "linear-gradient(135deg,#059669,#34d399)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {confirming ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            Confirm Subscription (Contact Made)
          </button>
        )}

        {/* Allocate plot */}
        {(sub.status === "completed" || sub.status === "outright_paid") &&
          sub.status !== "allocated" && (
            <>
              {!showAlloc ? (
                <button
                  onClick={() => setShowAlloc(true)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Shield size={14} /> Allocate Plot & Issue Final Documents
                </button>
              ) : (
                <div
                  style={{
                    background: "#f9f6ff",
                    borderRadius: 12,
                    padding: "16px 18px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: PURPLE,
                      margin: "0 0 14px",
                    }}
                  >
                    Plot Allocation Details
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {/* Row 1: Plot Number + Title Type */}
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 2 }}>
                        <label
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            display: "block",
                            marginBottom: 5,
                          }}
                        >
                          Plot Number{" "}
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Block A, Plot 14"
                          value={plotNum}
                          onChange={(e) => setPlotNum(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 10,
                            fontSize: 13,
                            border: "1.5px solid rgba(0,0,0,0.1)",
                            outline: "none",
                            background: "#fff",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            display: "block",
                            marginBottom: 5,
                          }}
                        >
                          Title Type
                        </label>
                        <input
                          type="text"
                          placeholder="C of O / Gazette…"
                          value={titleDoc}
                          onChange={(e) => setTitleDoc(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 10,
                            fontSize: 13,
                            border: "1.5px solid rgba(0,0,0,0.1)",
                            outline: "none",
                            background: "#fff",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>
                    {/* Row 2: Plot Description */}
                    <div>
                      <label
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          display: "block",
                          marginBottom: 5,
                        }}
                      >
                        Plot Description{" "}
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 500,
                            color: "#9ca3af",
                            textTransform: "none",
                          }}
                        >
                          (optional — appears on Allocation Letter)
                        </span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Block B, Plot 14 — corner piece facing the main road, measuring 500sqm"
                        value={plotDesc}
                        onChange={(e) => setPlotDesc(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: 10,
                          fontSize: 13,
                          border: "1.5px solid rgba(0,0,0,0.1)",
                          outline: "none",
                          background: "#fff",
                          fontFamily: "inherit",
                          resize: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button
                      onClick={allocate}
                      disabled={allocating}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                        border: "none",
                        cursor: allocating ? "not-allowed" : "pointer",
                        background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {allocating ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />{" "}
                          Allocating…
                        </>
                      ) : (
                        <>
                          <Shield size={12} /> Confirm Allocation
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowAlloc(false);
                        setErr("");
                      }}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6b7280",
                        border: "1px solid rgba(0,0,0,0.1)",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        {sub.status === "allocated" && (
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(112,12,235,0.06)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: sub.plotDescription ? 6 : 0,
              }}
            >
              <Shield size={16} style={{ color: PURPLE }} />
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: PURPLE,
                  margin: 0,
                }}
              >
                Plot {sub.plotNumber} allocated on {fmtDate(sub.allocationDate)}
              </p>
            </div>
            {sub.plotDescription && (
              <p
                style={{ fontSize: 12, color: "#6b7280", margin: "0 0 0 24px" }}
              >
                {sub.plotDescription}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN: SubscriptionProfile ─────────────────────────────────────────────────
export default function SubscriptionProfile({ id, onBack }) {
  const {
    data: sub,
    error,
    isLoading,
    mutate,
  } = useSWR(id ? `${BASE}/api/subscriptions/${id}` : null, fetcher, {
    revalidateOnFocus: false,
  });

  const refresh = useCallback(() => mutate(), [mutate]);

  const download = async (subId, docType, label) => {
    try {
      const res = await fetch(
        `${BASE}/api/subscriptions/${subId}/documents/${docType}`,
        {
          headers: { Authorization: `Bearer ${tok()}` },
        },
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${label}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed.");
    }
  };

  if (isLoading)
    return (
      <div style={{ padding: "40px 32px" }} className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Sk key={i} h={120} />
        ))}
      </div>
    );

  if (error || !sub)
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(220,38,38,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertTriangle size={28} style={{ color: "#dc2626" }} />
        </div>
        <p
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#dc2626",
            margin: "0 0 8px",
          }}
        >
          Failed to load subscription
        </p>
        <p
          style={{
            fontSize: 13,
            color: "#9ca3af",
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          {error?.message ||
            "The subscription could not be loaded. It may not exist or you may not have permission to view it."}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onBack}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "#fff",
              color: "#6b7280",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ← Go Back
          </button>
          <button
            onClick={() => mutate()}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: PURPLE,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );

  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  const ref = sub.referenceNumber;

  return (
    <div className="space-y-5 mt-4 pb-12">
      {/* ── Back + Header ──────────────────────────────────────────────── */}
      <div>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            color: PURPLE,
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: 20,
            padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Back to Subscriptions
        </button>

        <div
          style={{
            background: `linear-gradient(135deg,${DARK},${PURPLE})`,
            borderRadius: 20,
            padding: "28px 32px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 12,
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
                    margin: "0 0 4px",
                  }}
                >
                  Client Profile
                </p>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    margin: "0 0 4px",
                  }}
                >
                  {fullName}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.7)",
                    margin: 0,
                  }}
                >
                  {sub.estateName}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    margin: "0 0 4px",
                  }}
                >
                  Reference
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    fontFamily: "monospace",
                    margin: "0 0 8px",
                  }}
                >
                  {ref}
                </p>
                <StatusBadge status={sub.status} />
              </div>
            </div>

            {/* Quick info row */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 20px",
                marginTop: 18,
                borderTop: "1px solid rgba(255,255,255,0.12)",
                paddingTop: 16,
              }}
            >
              {[
                [Mail, sub.email],
                [Phone, sub.phone],
                [
                  Building2,
                  `${sub.plotType} · ${sub.plotSize} · ×${sub.numberOfPlots}`,
                ],
                [Calendar, `Subscribed ${fmtDate(sub.createdAt)}`],
              ].map(([Icon, text]) => (
                <div
                  key={text}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <Icon size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
                  <span
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress Summary ───────────────────────────────────────────── */}
      <ProgressSection sub={sub} />

      {/* ── Two-column layout on large screens ────────────────────────── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        className="max-lg:grid-cols-1"
      >
        {/* Left column */}
        <div className="space-y-5">
          <MilestoneTimeline sub={sub} onDownload={download} />
          <InstalmentTable sub={sub} />
          <DocumentsPanel sub={sub} />
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <AdminActions sub={sub} onRefresh={refresh} />
          <PaymentPanel sub={sub} onRefresh={refresh} />
          <NotesPanel sub={sub} onRefresh={refresh} />
        </div>
      </div>
    </div>
  );
}
