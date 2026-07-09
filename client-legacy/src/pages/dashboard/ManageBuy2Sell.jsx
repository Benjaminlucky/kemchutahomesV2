import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  TrendingUp,
  Save,
  Loader2,
  X,
  CreditCard,
  CheckCircle,
  Clock,
  Star,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Wallet,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_BASE_URL;
const PURPLE = "#700CEB";
const DARK = "#3F0C91";

const tok = () => localStorage.getItem("token");
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

const fetcher = async (url) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tok()}` },
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.message || "Failed");
  }
  return res.json();
};

const STATUS = {
  pending: {
    label: "Pending",
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    icon: Clock,
  },
  partial_paid: {
    label: "Partial Paid",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    icon: CreditCard,
  },
  active: {
    label: "Active",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    icon: TrendingUp,
  },
  matured: {
    label: "Matured",
    color: PURPLE,
    bg: "rgba(112,12,235,0.1)",
    icon: Star,
  },
  paid_out: {
    label: "Paid Out",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    icon: CheckCircle,
  },
  closed: {
    label: "Closed",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
    icon: X,
  },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  const I = s.icon;
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
      }}
    >
      <I size={10} />
      {s.label}
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

// ── ROI Settings ──────────────────────────────────────────────────────────────
function ROISettings() {
  const {
    data: roi,
    isLoading,
    mutate,
  } = useSWR(`${BASE}/api/buy2sell/roi`, fetcher, { revalidateOnFocus: false });
  const [fields, setFields] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const current = fields || roi;
  const set = (k, v) => setFields((f) => ({ ...(f || roi), [k]: v }));

  const save = async () => {
    setSaving(true);
    setErr("");
    setSaved(false);
    try {
      const res = await fetch(`${BASE}/api/buy2sell/roi`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok()}`,
        },
        body: JSON.stringify({
          roiPercent6Months: Number(current.roiPercent6Months || 22),
          roiPercent12Months: Number(current.roiPercent12Months || 48),
          roiPercent18Months: Number(current.roiPercent18Months || 75),
          minInvestment: Number(current.minInvestment || 1000000),
          maxInvestment: Number(current.maxInvestment || 50000000),
          description: current.description || "",
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      await mutate(d.settings);
      setFields(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 14,
    border: "1.5px solid rgba(0,0,0,0.1)",
    outline: "none",
    background: "#fafafa",
    color: "#0f0a1e",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };
  const focus = (e) => {
    e.target.style.borderColor = `${PURPLE}60`;
    e.target.style.boxShadow = `0 0 0 3px ${PURPLE}10`;
  };
  const blur = (e) => {
    e.target.style.borderColor = "rgba(0,0,0,0.1)";
    e.target.style.boxShadow = "none";
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
              fontSize: 14,
              fontWeight: 800,
              color: "#0f0a1e",
              margin: 0,
            }}
          >
            ROI Rate Settings
          </p>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "3px 0 0" }}>
            Changes apply to <strong>new</strong> investments only. Existing
            investors keep their locked-in rate forever.
          </p>
        </div>
        {saved && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#059669",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <CheckCircle size={14} /> Saved
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Sk key={i} h={40} />
          ))}
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 14,
              marginBottom: 16,
            }}
          >
            {[
              { key: "roiPercent6Months", label: "6 Months ROI (%)" },
              { key: "roiPercent12Months", label: "12 Months ROI (%)" },
              { key: "roiPercent18Months", label: "18 Months ROI (%)" },
            ].map(({ key, label }) => (
              <div key={key}>
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
                  {label}
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={current?.[key] ?? ""}
                  onChange={(e) => set(key, e.target.value)}
                  style={inp}
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 16,
            }}
          >
            {[
              { key: "minInvestment", label: "Min Investment (NGN)" },
              { key: "maxInvestment", label: "Max Investment (NGN)" },
            ].map(({ key, label }) => (
              <div key={key}>
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
                  {label}
                </label>
                <input
                  type="number"
                  value={current?.[key] ?? ""}
                  onChange={(e) => set(key, e.target.value)}
                  style={inp}
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            ))}
          </div>
          {err && (
            <p style={{ fontSize: 12, color: "#dc2626", marginBottom: 10 }}>
              {err}
            </p>
          )}
          <button
            onClick={save}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              background: saving
                ? "rgba(112,12,235,0.4)"
                : `linear-gradient(135deg,${DARK},${PURPLE})`,
            }}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={14} /> Save ROI Rates
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

// ── Investment detail slide-over ──────────────────────────────────────────────
function InvestmentDrawer({ lead, onClose, onRefresh }) {
  const [payForm, setPayForm] = useState({
    amount: "",
    method: "Bank Transfer",
    reference: "",
    paidAt: "",
  });
  const [paying, setPaying] = useState(false);
  const [maturing, setMaturing] = useState(false);
  const [payingOut, setPayingOut] = useState(false);
  const [payoutAmt, setPayoutAmt] = useState("");
  const [err, setErr] = useState("");

  const api = async (url, method, body) => {
    const res = await fetch(`${BASE}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tok()}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.message);
    return d;
  };

  const recordPay = async () => {
    if (!payForm.amount || Number(payForm.amount) <= 0) {
      setErr("Enter a valid amount");
      return;
    }
    setPaying(true);
    setErr("");
    try {
      await api(`/api/buy2sell/leads/${lead._id}/record-payment`, "POST", {
        amount: Number(payForm.amount),
        method: payForm.method,
        reference: payForm.reference,
        paidAt: payForm.paidAt || undefined,
      });
      setPayForm({
        amount: "",
        method: "Bank Transfer",
        reference: "",
        paidAt: "",
      });
      onRefresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setPaying(false);
    }
  };

  const markMature = async () => {
    setMaturing(true);
    setErr("");
    try {
      await api(`/api/buy2sell/leads/${lead._id}/mature`, "PATCH");
      onRefresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setMaturing(false);
    }
  };

  const doPayout = async () => {
    setPayingOut(true);
    setErr("");
    try {
      await api(`/api/buy2sell/leads/${lead._id}/process-payout`, "POST", {
        actualPayout: payoutAmt ? Number(payoutAmt) : undefined,
      });
      onRefresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setPayingOut(false);
    }
  };

  const pct = lead.maturityProgressPercent ?? 0;
  const balance = Math.max(
    0,
    (lead.principalAmount || 0) - (lead.amountPaid || 0),
  );
  const inp = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 9,
    fontSize: 13,
    border: "1.5px solid rgba(0,0,0,0.1)",
    outline: "none",
    background: "#fafafa",
    color: "#0f0a1e",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "100%",
          maxWidth: 480,
          height: "100%",
          background: "#fff",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            background: `linear-gradient(135deg,${DARK},${PURPLE})`,
            color: "#fff",
            flexShrink: 0,
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
                  fontSize: 17,
                  fontWeight: 900,
                  margin: "0 0 2px",
                  letterSpacing: "-0.03em",
                }}
              >
                {lead.fullName}
              </h3>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  margin: 0,
                  fontFamily: "monospace",
                }}
              >
                {lead.referenceNumber}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusBadge status={lead.status} />
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  borderRadius: 8,
                  padding: 6,
                  display: "flex",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {err && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                background: "rgba(220,38,38,0.07)",
                borderRadius: 10,
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              <AlertTriangle
                size={14}
                style={{ color: "#dc2626", flexShrink: 0 }}
              />
              <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{err}</p>
            </div>
          )}

          {/* Summary */}
          <div
            style={{
              background: "#f9f6ff",
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 12px",
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
                ["Paid", fmtNGN(lead.amountPaid || 0), "#059669"],
                [
                  "Balance Due",
                  fmtNGN(balance),
                  balance > 0 ? "#dc2626" : "#059669",
                ],
                ["ROI Rate", `${lead.roiPercent}% locked`, PURPLE],
                ["Expected ROI", fmtNGN(lead.expectedROI || 0), "#059669"],
                ["Total at Maturity", fmtNGN(lead.expectedPayout || 0), DARK],
                ["Duration", lead.duration || "—", "#374151"],
                ["Maturity Date", fmtDate(lead.maturityDate), "#374151"],
              ].map(([l, v, c]) => (
                <div
                  key={l}
                  style={{
                    background: "#fff",
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
                      fontSize: 12,
                      fontWeight: 800,
                      color: c,
                      margin: 0,
                    }}
                  >
                    {v}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Maturity progress */}
          {(lead.status === "active" || lead.status === "matured") &&
            lead.investmentDate && (
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
                  <span>Start: {fmtDate(lead.investmentDate)}</span>
                  {(lead.daysRemaining ?? 0) > 0 && (
                    <span>{lead.daysRemaining}d left</span>
                  )}
                  <span>End: {fmtDate(lead.maturityDate)}</span>
                </div>
              </div>
            )}

          {/* KYC */}
          <details
            style={{
              background: "#f9f9fc",
              borderRadius: 12,
              padding: "12px 16px",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <summary
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#374151",
                cursor: "pointer",
              }}
            >
              KYC &amp; Contact Details
            </summary>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {[
                ["Email", lead.email],
                ["Phone", lead.phone],
                [
                  "Address",
                  [lead.address, lead.city, lead.state]
                    .filter(Boolean)
                    .join(", "),
                ],
                ["ID Type", lead.idType],
                ["ID Number", lead.idNumber],
              ]
                .filter(([, v]) => v)
                .map(([l, v]) => (
                  <div
                    key={l}
                    style={{ display: "flex", gap: 8, fontSize: 12 }}
                  >
                    <span
                      style={{ color: "#9ca3af", width: 80, flexShrink: 0 }}
                    >
                      {l}
                    </span>
                    <span style={{ color: "#374151", fontWeight: 600 }}>
                      {v}
                    </span>
                  </div>
                ))}
            </div>
          </details>

          {/* Record payment */}
          {!["paid_out", "closed"].includes(lead.status) && (
            <div
              style={{
                background: "#f9f6ff",
                borderRadius: 14,
                padding: "16px 18px",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: DARK,
                  margin: "0 0 12px",
                }}
              >
                Record Payment Received
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Amount (NGN)
                    </label>
                    <input
                      type="number"
                      placeholder="Amount received"
                      value={payForm.amount}
                      onChange={(e) =>
                        setPayForm((f) => ({ ...f, amount: e.target.value }))
                      }
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
                        letterSpacing: "0.06em",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      value={payForm.paidAt}
                      onChange={(e) =>
                        setPayForm((f) => ({ ...f, paidAt: e.target.value }))
                      }
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
                        letterSpacing: "0.06em",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Method
                    </label>
                    <select
                      value={payForm.method}
                      onChange={(e) =>
                        setPayForm((f) => ({ ...f, method: e.target.value }))
                      }
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
                        letterSpacing: "0.06em",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Reference
                    </label>
                    <input
                      placeholder="Bank reference"
                      value={payForm.reference}
                      onChange={(e) =>
                        setPayForm((f) => ({ ...f, reference: e.target.value }))
                      }
                      style={inp}
                    />
                  </div>
                </div>
                <button
                  onClick={recordPay}
                  disabled={paying}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    border: "none",
                    cursor: paying ? "not-allowed" : "pointer",
                    background: paying
                      ? "rgba(112,12,235,0.4)"
                      : `linear-gradient(135deg,${DARK},${PURPLE})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {paying ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Recording…
                    </>
                  ) : (
                    <>
                      <CreditCard size={13} /> Confirm Payment Received
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Mark matured */}
          {lead.status === "active" && (
            <button
              onClick={markMature}
              disabled={maturing}
              style={{
                width: "100%",
                padding: "11px 0",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                border: "none",
                cursor: maturing ? "not-allowed" : "pointer",
                background: maturing
                  ? "rgba(217,119,6,0.4)"
                  : "linear-gradient(135deg,#d97706,#f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {maturing ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <Star size={13} /> Mark as Matured
                </>
              )}
            </button>
          )}

          {/* Process payout */}
          {lead.status === "matured" && (
            <div
              style={{
                background: "rgba(5,150,105,0.05)",
                border: "1px solid rgba(5,150,105,0.2)",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#059669",
                  margin: "0 0 6px",
                }}
              >
                Process Payout
              </p>
              <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 10px" }}>
                Default: <strong>{fmtNGN(lead.expectedPayout)}</strong>.
                Override if needed.
              </p>
              <input
                type="number"
                placeholder={String(lead.expectedPayout || "")}
                value={payoutAmt}
                onChange={(e) => setPayoutAmt(e.target.value)}
                style={{ ...inp, marginBottom: 10 }}
              />
              <button
                onClick={doPayout}
                disabled={payingOut}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  border: "none",
                  cursor: payingOut ? "not-allowed" : "pointer",
                  background: payingOut
                    ? "rgba(5,150,105,0.4)"
                    : "linear-gradient(135deg,#059669,#34d399)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {payingOut ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    <Wallet size={13} /> Send Payout &amp; Notify Client
                  </>
                )}
              </button>
            </div>
          )}

          {/* Payment history */}
          {lead.payments?.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 10px",
                }}
              >
                Payment History
              </p>
              {lead.payments.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "#f9f6ff",
                    borderRadius: 10,
                    marginBottom: 6,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#0f0a1e",
                        margin: "0 0 2px",
                      }}
                    >
                      {fmtNGN(p.amount)}
                    </p>
                    <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>
                      {p.method} · {fmtDate(p.paidAt)}
                      {p.reference ? ` · ${p.reference}` : ""}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 8,
                      background:
                        p.type === "payout"
                          ? "rgba(5,150,105,0.1)"
                          : "rgba(112,12,235,0.1)",
                      color: p.type === "payout" ? "#059669" : PURPLE,
                    }}
                  >
                    {p.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ManageBuy2Sell() {
  const [tab, setTab] = useState("leads");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const buildUrl = () => {
    const p = new URLSearchParams({ page, limit: 15 });
    if (status) p.set("status", status);
    if (search) p.set("search", search);
    return `${BASE}/api/buy2sell/leads?${p}`;
  };

  const { data, isLoading, error, mutate } = useSWR(
    tab === "leads" ? buildUrl() : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const refresh = useCallback(async () => {
    await mutate();
    if (selected) {
      try {
        const res = await fetch(`${BASE}/api/buy2sell/leads/${selected._id}`, {
          headers: { Authorization: `Bearer ${tok()}` },
        });
        const fresh = await res.json();
        if (res.ok) setSelected(fresh);
      } catch {}
    }
  }, [mutate, selected]);

  const leads = data?.leads || [];
  const STATUS_FILTERS = [
    { key: "", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "partial_paid", label: "Partial Paid" },
    { key: "active", label: "Active" },
    { key: "matured", label: "Matured" },
    { key: "paid_out", label: "Paid Out" },
    { key: "closed", label: "Closed" },
  ];

  return (
    <div className="space-y-6 mt-4 sm:mt-8 pb-10">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 4,
              height: 28,
              borderRadius: 2,
              background: `linear-gradient(to bottom,${DARK},${PURPLE})`,
            }}
          />
          <div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#0f0a1e",
                letterSpacing: "-0.04em",
                margin: 0,
              }}
            >
              Buy2Sell
            </h2>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "3px 0 0" }}>
              Investment management &amp; ROI settings
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 700,
            color: "#6b7280",
            background: "#f3f4f6",
            border: "none",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {[
          { k: "leads", l: "Investments" },
          { k: "roi", l: "ROI Settings" },
        ].map(({ k, l }) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              padding: "8px 20px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              background: tab === k ? PURPLE : "#f3f4f6",
              color: tab === k ? "#fff" : "#6b7280",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "roi" && <ROISettings />}

      {tab === "leads" && (
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
                gap: 10,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <input
                type="text"
                placeholder="Search name, email, reference…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{
                  flex: "1 1 220px",
                  padding: "9px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  border: "1.5px solid rgba(0,0,0,0.1)",
                  outline: "none",
                  background: "#fafafa",
                  color: "#0f0a1e",
                  fontFamily: "inherit",
                }}
              />
              <p
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                {data?.total ?? 0} investments
              </p>
            </div>
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
                    border: "none",
                    cursor: "pointer",
                    background: status === key ? PURPLE : "#f3f4f6",
                    color: status === key ? "#fff" : "#6b7280",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: 24 }} className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Sk key={i} h={52} />
              ))}
            </div>
          ) : error ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <AlertTriangle
                size={32}
                style={{ color: "#dc2626", margin: "0 auto 10px" }}
              />
              <p style={{ color: "#dc2626", fontWeight: 600 }}>
                Failed to load
              </p>
            </div>
          ) : leads.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <TrendingUp
                size={36}
                style={{ color: "#e5e7eb", margin: "0 auto 12px" }}
              />
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#9ca3af",
                  margin: 0,
                }}
              >
                No investments found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9f6ff" }}>
                    {[
                      "Investor",
                      "Amount",
                      "Duration / ROI",
                      "Maturity Progress",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => {
                    const pct = lead.maturityProgressPercent ?? 0;
                    const isActive =
                      lead.status === "active" || lead.status === "matured";
                    return (
                      <motion.tr
                        key={lead._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        style={{
                          borderBottom: "1px solid rgba(0,0,0,0.04)",
                          cursor: "pointer",
                        }}
                        className="hover:bg-purple-50/30 transition-colors"
                        onClick={() => setSelected(lead)}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#0f0a1e",
                              margin: "0 0 2px",
                            }}
                          >
                            {lead.fullName}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: "#9ca3af",
                              margin: 0,
                            }}
                          >
                            {lead.email}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: "#9ca3af",
                              margin: 0,
                              fontFamily: "monospace",
                            }}
                          >
                            {lead.referenceNumber}
                          </p>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "#0f0a1e",
                              margin: "0 0 2px",
                            }}
                          >
                            {fmtNGN(lead.principalAmount)}
                          </p>
                          {lead.amountPaid > 0 &&
                            lead.amountPaid < lead.principalAmount && (
                              <p
                                style={{
                                  fontSize: 10,
                                  color: "#d97706",
                                  margin: 0,
                                }}
                              >
                                Paid: {fmtNGN(lead.amountPaid)}
                              </p>
                            )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: DARK,
                              margin: "0 0 2px",
                            }}
                          >
                            {lead.duration}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: PURPLE,
                              fontWeight: 700,
                              margin: 0,
                            }}
                          >
                            {lead.roiPercent}% ROI
                          </p>
                        </td>
                        <td style={{ padding: "12px 16px", minWidth: 130 }}>
                          {isActive ? (
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: 4,
                                }}
                              >
                                <span
                                  style={{ fontSize: 10, color: "#9ca3af" }}
                                >
                                  Progress
                                </span>
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: pct >= 100 ? "#059669" : PURPLE,
                                  }}
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
                                    transition: "width 0.5s",
                                  }}
                                />
                              </div>
                              {(lead.daysRemaining ?? 0) > 0 && (
                                <p
                                  style={{
                                    fontSize: 10,
                                    color: "#9ca3af",
                                    margin: "3px 0 0",
                                  }}
                                >
                                  {lead.daysRemaining}d left
                                </p>
                              )}
                            </div>
                          ) : (
                            <p
                              style={{
                                fontSize: 11,
                                color: "#d1d5db",
                                margin: 0,
                              }}
                            >
                              —
                            </p>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <StatusBadge status={lead.status} />
                          <p
                            style={{
                              fontSize: 10,
                              color: "#9ca3af",
                              margin: "4px 0 0",
                            }}
                          >
                            {fmtDate(lead.createdAt)}
                          </p>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(lead);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "6px 12px",
                              borderRadius: 9,
                              fontSize: 11,
                              fontWeight: 700,
                              background: `${PURPLE}10`,
                              color: PURPLE,
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            View <ArrowRight size={11} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {(data?.pages ?? 0) > 1 && (
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
      )}

      <AnimatePresence>
        {selected && (
          <InvestmentDrawer
            lead={selected}
            onClose={() => setSelected(null)}
            onRefresh={refresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
