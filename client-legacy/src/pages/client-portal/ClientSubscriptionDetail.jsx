/**
 * ClientSubscriptionDetail.jsx
 * Full client-facing view of one subscription.
 * Shows: milestone progress, instalment schedule, documents.
 *
 * Usage: <ClientSubscriptionDetail sub={sub} onBack={fn} authFetch={fn} />
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Shield,
  Star,
  CreditCard,
  FileText,
  Download,
  Calendar,
  Phone,
  Mail,
  Building2,
  Home,
  Loader2,
  AlertTriangle,
  Lock,
  Info,
} from "lucide-react";

const PURPLE = "#700CEB";
const DARK = "#3F0C91";

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

// ── Status labels ─────────────────────────────────────────────────────────────
const STATUS_LABEL = {
  pending: "Awaiting Confirmation",
  confirmed: "Confirmed — Make Your Payment",
  partial_paid: "Partial Payment Received",
  outright_paid: "Full Payment Received",
  inst_1_paid: "Deposit Received",
  inst_2_paid: "Instalment 2 Complete",
  inst_3_paid: "Instalment 3 Complete",
  inst_4_paid: "Instalment 4 Complete",
  inst_5_paid: "Instalment 5 Complete",
  inst_6_paid: "Instalment 6 Complete",
  completed: "All Payments Complete",
  allocated: "Plot Allocated 🎉",
  rejected: "Subscription Rejected",
};

const DOC_META = {
  acknowledgement: {
    label: "Subscription Acknowledgement",
    icon: FileText,
    color: PURPLE,
  },
  invoice: { label: "Payment Invoice", icon: CreditCard, color: "#d97706" },
  contract: { label: "Contract of Sale", icon: Shield, color: "#059669" },
  schedule: { label: "Instalment Schedule", icon: Calendar, color: "#0891b2" },
  receipt: { label: "Payment Receipt", icon: CheckCircle, color: "#059669" },
  allocation: { label: "Letter of Allocation", icon: Home, color: PURPLE },
  deed: { label: "Deed of Assignment", icon: Star, color: "#d97706" },
};

// ── Progress milestones ───────────────────────────────────────────────────────
function getClientMilestones(sub) {
  const isInst = sub.paymentPlan === "Instalment";
  const isConfirmed =
    !!sub.confirmedAt ||
    (sub.status && sub.status !== "pending" && sub.status !== "rejected");

  const milestones = [
    {
      label: "Application Submitted",
      detail: `Ref: ${sub.referenceNumber} · ${fmtDate(sub.createdAt)}`,
      done: true,
      icon: FileText,
      color: PURPLE,
    },
    {
      label: "Subscription Confirmed",
      detail: sub.confirmedAt
        ? `Confirmed on ${fmtDate(sub.confirmedAt)}`
        : isConfirmed
          ? "Confirmed — please proceed to payment"
          : "Our team will contact you within 24–48 hours",
      done: isConfirmed,
      icon: CheckCircle,
      color: "#059669",
    },
  ];

  if (isInst) {
    const schedule = sub.instalmentSchedule || [];
    schedule.forEach((inst, i) => {
      milestones.push({
        label: i === 0 ? "Deposit Paid (30%)" : `Instalment ${i} Paid`,
        detail: inst.isPaid
          ? `${fmtNGN(inst.amount)} received · ${fmtDate(inst.paidAt)}`
          : `${fmtNGN(inst.amount)} due on ${fmtDate(inst.dueDate)}`,
        done: inst.isPaid,
        overdue: !inst.isPaid && new Date(inst.dueDate) < new Date(),
        icon: inst.isPaid ? CheckCircle : Clock,
        color: inst.isPaid ? "#059669" : "#d97706",
      });
    });
  } else {
    const paid = sub.amountPaid || 0;
    milestones.push({
      label:
        sub.status === "outright_paid" ? "Full Payment Received" : "Payment",
      detail:
        paid > 0
          ? `${fmtNGN(paid)} of ${fmtNGN(sub.totalAmount)} received`
          : `${fmtNGN(sub.totalAmount)} outstanding`,
      done: paid >= sub.totalAmount,
      icon: paid >= sub.totalAmount ? CheckCircle : CreditCard,
      color: paid >= sub.totalAmount ? "#059669" : "#d97706",
    });
  }

  milestones.push({
    label: "All Payments Complete",
    detail: ["completed", "allocated"].includes(sub.status)
      ? "Full payment received"
      : `${fmtNGN(Math.max(0, sub.totalAmount - (sub.amountPaid || 0)))} remaining`,
    done: ["completed", "allocated"].includes(sub.status),
    icon: Star,
    color: PURPLE,
  });

  milestones.push({
    label: "Plot Allocated",
    detail: sub.plotNumber
      ? `Your plot: ${sub.plotNumber}`
      : "Pending full payment completion",
    done: sub.status === "allocated",
    icon: Shield,
    color: PURPLE,
    isFinal: true,
  });

  return milestones;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ClientSubscriptionDetail({ sub, onBack, authFetch }) {
  const [downloading, setDownloading] = useState(null);

  const downloadDoc = async (docType, label) => {
    setDownloading(docType);
    try {
      // authFetch sets Content-Type: application/json which breaks binary downloads.
      // We build the request directly using the token, without a Content-Type header.
      const tok = localStorage.getItem("clientToken") || "";
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/subscriptions/${sub._id}/documents/${docType}`,
        { headers: { Authorization: `Bearer ${tok}` } },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Download failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${label.replace(/\s+/g, "-")}-${sub.referenceNumber || sub._id}.pdf`;
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

  const milestones = getClientMilestones(sub);
  const pct = sub.paymentProgressPercent || 0;
  const bal = Math.max(0, sub.totalAmount - (sub.amountPaid || 0));
  const isInst = sub.paymentPlan === "Instalment";
  const nextInst = sub.instalmentSchedule?.find?.((s) => !s.isPaid);
  const statusLabel = STATUS_LABEL[sub.status] || sub.status;
  const docs = sub.documents || [];

  return (
    <div className="space-y-6 pb-10">
      {/* ── Back ───────────────────────────────────────────────────────── */}
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
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* ── Hero card ──────────────────────────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(135deg,${DARK},${PURPLE})`,
          borderRadius: 24,
          padding: "28px 28px 24px",
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
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: "30%",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div style={{ position: "relative" }}>
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
            Land Subscription
          </p>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              margin: "0 0 3px",
            }}
          >
            {sub.estateName}
          </h2>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.65)",
              margin: "0 0 16px",
              fontFamily: "monospace",
            }}
          >
            {sub.referenceNumber}
          </p>

          <div
            style={{
              display: "flex",
              gap: "6px 16px",
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            {[
              `${sub.plotType} · ${sub.plotSize}`,
              `×${sub.numberOfPlots} plot${sub.numberOfPlots > 1 ? "s" : ""}`,
              isInst ? `${sub.instalmentMonths}-month instalment` : "Outright",
            ].map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.75)",
                  background: "rgba(255,255,255,0.1)",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontWeight: 600,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Status line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: 12,
            }}
          >
            <Info
              size={14}
              style={{ color: "rgba(255,255,255,0.7)", flexShrink: 0 }}
            />
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
              }}
            >
              {statusLabel}
            </p>
          </div>
        </div>
      </div>

      {/* ── Payment summary ────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "22px 24px",
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
          Payment Summary
        </p>

        {/* Progress bar */}
        <div
          style={{
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
            Progress
          </span>
          <span style={{ fontSize: 13, fontWeight: 900, color: PURPLE }}>
            {pct}%
          </span>
        </div>
        <div
          style={{
            height: 10,
            background: "#f0eeff",
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 20,
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
                pct === 100
                  ? "linear-gradient(to right,#059669,#34d399)"
                  : `linear-gradient(to right,${DARK},${PURPLE})`,
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 10,
          }}
        >
          {[
            { l: "Total", v: fmtNGN(sub.totalAmount), c: "#0f0a1e" },
            { l: "Paid", v: fmtNGN(sub.amountPaid || 0), c: "#059669" },
            {
              l: "Balance",
              v: fmtNGN(bal),
              c: bal > 0 ? "#dc2626" : "#059669",
            },
          ].map(({ l, v, c }) => (
            <div
              key={l}
              style={{
                textAlign: "center",
                background: "#f9f6ff",
                borderRadius: 12,
                padding: "12px 8px",
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
                {l}
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: c,
                  margin: 0,
                  letterSpacing: "-0.03em",
                }}
              >
                {v}
              </p>
            </div>
          ))}
        </div>

        {/* Next instalment callout */}
        {nextInst && !["completed", "allocated"].includes(sub.status) && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              background:
                new Date(nextInst.dueDate) < new Date()
                  ? "rgba(220,38,38,0.07)"
                  : "rgba(217,119,6,0.07)",
              borderRadius: 12,
              border: `1px solid ${new Date(nextInst.dueDate) < new Date() ? "rgba(220,38,38,0.2)" : "rgba(217,119,6,0.2)"}`,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 800,
                color:
                  new Date(nextInst.dueDate) < new Date()
                    ? "#dc2626"
                    : "#d97706",
                margin: "0 0 2px",
              }}
            >
              {new Date(nextInst.dueDate) < new Date()
                ? "⚠ Payment Overdue"
                : "📅 Next Payment Due"}
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#0f0a1e",
                margin: 0,
              }}
            >
              {fmtNGN(nextInst.amount)} — {fmtDate(nextInst.dueDate)}
            </p>
          </div>
        )}
      </div>

      {/* ── Milestone timeline ─────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "22px 24px",
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
          Your Journey
        </p>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 17,
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
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  marginBottom: isLast ? 0 : 20,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
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
                  {m.done ? (
                    <Icon size={15} color="#fff" />
                  ) : m.overdue ? (
                    <AlertTriangle size={14} color="#fff" />
                  ) : (
                    <Lock size={14} color="#c084fc" />
                  )}
                </div>
                <div style={{ paddingTop: 6, flex: 1 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: m.done
                        ? "#0f0a1e"
                        : m.overdue
                          ? "#dc2626"
                          : "#9ca3af",
                      margin: "0 0 2px",
                    }}
                  >
                    {m.label}
                    {m.isFinal && m.done && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          color: "#059669",
                        }}
                      >
                        ✓ Complete
                      </span>
                    )}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: m.overdue ? "#dc2626" : "#9ca3af",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {m.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Instalment schedule table ──────────────────────────────────── */}
      {isInst && sub.instalmentSchedule?.length > 0 && (
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
              padding: "16px 22px",
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
              Payment Schedule
            </p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f6ff" }}>
                {["Instalment", "Due Date", "Amount", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 16px",
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
                const overdue =
                  !inst.isPaid && new Date(inst.dueDate) < new Date();
                return (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <td
                      style={{
                        padding: "10px 16px",
                        fontSize: 12,
                        color: "#374151",
                        fontWeight: 600,
                      }}
                    >
                      {i === 0 ? "Deposit (30%)" : `Month ${i}`}
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
                        {inst.isPaid
                          ? "✓ Paid"
                          : overdue
                            ? "Overdue"
                            : "Upcoming"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Documents ──────────────────────────────────────────────────── */}
      {docs.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "22px 24px",
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
            Your Documents ({docs.length})
          </p>
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
                    borderRadius: 14,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: `${dm.color}12`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <DI size={17} style={{ color: dm.color }} />
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
                        {fmtDate(doc.generatedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadDoc(doc.type, doc.label)}
                    disabled={downloading === doc.type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "8px 16px",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 700,
                      background: `${dm.color}12`,
                      color: dm.color,
                      border: `1px solid ${dm.color}25`,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {downloading === doc.type ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Download size={11} />
                    )}
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bank details reminder ──────────────────────────────────────── */}
      {!["completed", "allocated"].includes(sub.status) && (
        <div
          style={{
            background: "#f0fdf4",
            borderRadius: 16,
            padding: "16px 20px",
            border: "1px solid rgba(5,150,105,0.2)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#059669",
              margin: "0 0 8px",
            }}
          >
            📢 Payment Details
          </p>
          {[
            ["Bank", "ACCESS BANK PLC"],
            ["Account", "KEMCHUTA HOMES LIMITED"],
            ["Number", "XXXXXXXXXX"],
            ["Reference", sub.referenceNumber],
          ].map(([l, v]) => (
            <p
              key={l}
              style={{ margin: "3px 0", fontSize: 12, color: "#374151" }}
            >
              <strong>{l}:</strong>{" "}
              {l === "Reference" ? (
                <span
                  style={{
                    color: PURPLE,
                    fontWeight: 800,
                    fontFamily: "monospace",
                  }}
                >
                  {v}
                </span>
              ) : (
                v
              )}
            </p>
          ))}
          <p style={{ fontSize: 11, color: "#6b7280", margin: "10px 0 0" }}>
            ⚠ Always quote your reference on every transfer. Send proof to
            info@kemchutahomesltd.com
          </p>
        </div>
      )}
    </div>
  );
}
