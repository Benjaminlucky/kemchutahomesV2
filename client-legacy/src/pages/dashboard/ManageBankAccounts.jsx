import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  Plus,
  Trash2,
  Save,
  Star,
  AlertTriangle,
  CheckCircle,
  Loader2,
  X,
  CreditCard,
  Building2,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_BASE_URL;
const tok = () => localStorage.getItem("token");
const PURPLE = "#700CEB";
const DARK = "#3F0C91";

const fetcher = (url) =>
  fetch(url, { headers: { Authorization: `Bearer ${tok()}` } }).then((r) => {
    if (!r.ok) throw new Error("Failed");
    return r.json();
  });

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ type, message, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 18px",
        borderRadius: 14,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        background:
          type === "success" ? "rgba(5,150,105,0.97)" : "rgba(220,38,38,0.95)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        maxWidth: 360,
      }}
    >
      {type === "success" ? (
        <CheckCircle size={16} />
      ) : (
        <AlertTriangle size={16} />
      )}
      {message}
      <button
        onClick={onDismiss}
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ── Input helper ──────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, required, mono }) {
  return (
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
        {label}
        {required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          fontSize: 13,
          color: "#0f0a1e",
          background: "#f9fafb",
          border: "1.5px solid rgba(0,0,0,0.1)",
          outline: "none",
          boxSizing: "border-box",
          fontFamily: mono ? "monospace" : "inherit",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = `${PURPLE}55`;
          e.target.style.boxShadow = `0 0 0 3px ${PURPLE}10`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(0,0,0,0.1)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

// ── Bank account card ─────────────────────────────────────────────────────────
function BankCard({ account, onSaved, onDeleted, showToast }) {
  const [form, setForm] = useState({ ...account });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const save = async () => {
    if (
      !form.bankName?.trim() ||
      !form.accountName?.trim() ||
      !form.accountNumber?.trim()
    ) {
      showToast("error", "Bank name, account name and number are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/bank-accounts/${account._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok()}`,
        },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setDirty(false);
      onSaved(d.account);
      showToast("success", "Bank account updated");
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!window.confirm(`Delete ${account.bankName}? This cannot be undone.`))
      return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE}/api/bank-accounts/${account._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tok()}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      onDeleted(account._id);
      showToast("success", "Bank account deleted");
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setDeleting(false);
    }
  };

  const makePrimary = async () => {
    try {
      const res = await fetch(`${BASE}/api/bank-accounts/${account._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok()}`,
        },
        body: JSON.stringify({ ...form, isPrimary: true }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      onSaved(d.account);
      showToast("success", `${form.bankName} set as primary account`);
    } catch (e) {
      showToast("error", e.message);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        border: `1.5px solid ${form.isPrimary ? PURPLE + "40" : "rgba(0,0,0,0.08)"}`,
        boxShadow: form.isPrimary
          ? `0 0 0 3px ${PURPLE}08`
          : "0 2px 8px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: "16px 22px",
          background: form.isPrimary ? `${PURPLE}06` : "#fafafa",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: form.isPrimary ? `${PURPLE}15` : "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2
              size={17}
              style={{ color: form.isPrimary ? PURPLE : "#6b7280" }}
            />
          </div>
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#0f0a1e",
                margin: 0,
              }}
            >
              {form.bankName || "Bank Account"}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#9ca3af",
                margin: "2px 0 0",
                fontFamily: "monospace",
              }}
            >
              {form.accountNumber || "—"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {form.isPrimary ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                background: `${PURPLE}12`,
                color: PURPLE,
              }}
            >
              <Star size={10} fill={PURPLE} /> Primary
            </span>
          ) : (
            <button
              onClick={makePrimary}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                background: "none",
                border: `1px solid rgba(0,0,0,0.12)`,
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              <Star size={10} /> Set Primary
            </button>
          )}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              color: form.isActive ? "#059669" : "#9ca3af",
            }}
          >
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              style={{
                width: 14,
                height: 14,
                accentColor: PURPLE,
                cursor: "pointer",
              }}
            />
            {form.isActive ? "Active" : "Inactive"}
          </label>
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: "20px 22px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <Field
            label="Bank Name"
            value={form.bankName || ""}
            onChange={(v) => set("bankName", v)}
            placeholder="e.g. ACCESS BANK PLC"
            required
          />
          <Field
            label="Account Name"
            value={form.accountName || ""}
            onChange={(v) => set("accountName", v)}
            placeholder="e.g. KEMCHUTA HOMES LIMITED"
            required
          />
          <Field
            label="Account Number"
            value={form.accountNumber || ""}
            onChange={(v) => set("accountNumber", v)}
            placeholder="0000000000"
            required
            mono
          />
          <Field
            label="Sort Code (optional)"
            value={form.sortCode || ""}
            onChange={(v) => set("sortCode", v)}
            placeholder="e.g. 044"
            mono
          />
        </div>
        <Field
          label="Note (shown in emails & PDFs)"
          value={form.note || ""}
          onChange={(v) => set("note", v)}
          placeholder="e.g. For property payments only"
        />
      </div>

      {/* Actions */}
      <div
        style={{
          padding: "14px 22px",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={del}
          disabled={deleting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "8px 14px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            background: "none",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#ef4444",
            cursor: "pointer",
          }}
        >
          {deleting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}{" "}
          Delete
        </button>

        <button
          onClick={save}
          disabled={saving || !dirty}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "8px 20px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            border: "none",
            background: !dirty
              ? "rgba(0,0,0,0.12)"
              : saving
                ? "rgba(112,12,235,0.4)"
                : `linear-gradient(135deg,${DARK},${PURPLE})`,
            cursor: !dirty || saving ? "not-allowed" : "pointer",
            boxShadow: dirty && !saving ? `0 3px 12px ${PURPLE}30` : "none",
          }}
        >
          {saving ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save size={13} /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Add account form ──────────────────────────────────────────────────────────
function AddAccountForm({ onAdded, showToast, onClose }) {
  const [form, setForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    sortCode: "",
    note: "",
    isPrimary: false,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (
      !form.bankName.trim() ||
      !form.accountName.trim() ||
      !form.accountNumber.trim()
    ) {
      showToast("error", "Bank name, account name and number are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/bank-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok()}`,
        },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      onAdded(d.account);
      showToast("success", `${form.bankName} added`);
      onClose();
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "30px 28px",
          width: "100%",
          maxWidth: 520,
          boxShadow: "0 32px 64px rgba(0,0,0,0.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: "#0f0a1e",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Add Bank Account
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <Field
              label="Bank Name"
              value={form.bankName}
              onChange={(v) => set("bankName", v)}
              placeholder="ACCESS BANK PLC"
              required
            />
            <Field
              label="Account Name"
              value={form.accountName}
              onChange={(v) => set("accountName", v)}
              placeholder="KEMCHUTA HOMES LIMITED"
              required
            />
            <Field
              label="Account Number"
              value={form.accountNumber}
              onChange={(v) => set("accountNumber", v)}
              placeholder="0000000000"
              required
              mono
            />
            <Field
              label="Sort Code"
              value={form.sortCode}
              onChange={(v) => set("sortCode", v)}
              placeholder="Optional"
              mono
            />
          </div>
          <Field
            label="Note (optional)"
            value={form.note}
            onChange={(v) => set("note", v)}
            placeholder="e.g. For property payments only"
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => set("isPrimary", e.target.checked)}
              style={{
                width: 15,
                height: 15,
                accentColor: PURPLE,
                cursor: "pointer",
              }}
            />
            Set as primary account
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "#fff",
              color: "#6b7280",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 12,
              border: "none",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: saving ? "not-allowed" : "pointer",
              background: saving
                ? "rgba(112,12,235,0.4)"
                : `linear-gradient(135deg,${DARK},${PURPLE})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Adding…
              </>
            ) : (
              <>
                <Plus size={13} /> Add Account
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ManageBankAccounts() {
  const [toast, setToast] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [localAccounts, setLocal] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const {
    data: fetched,
    isLoading,
    error,
  } = useSWR(`${BASE}/api/bank-accounts`, fetcher, {
    revalidateOnFocus: false,
  });

  const accounts = localAccounts ?? fetched ?? [];

  const handleSaved = (updated) => {
    setLocal((prev) => {
      const base = prev ?? fetched ?? [];
      // If updated is primary, demote others in local state
      return base.map((a) =>
        a._id === updated._id
          ? updated
          : updated.isPrimary
            ? { ...a, isPrimary: false }
            : a,
      );
    });
  };

  const handleDeleted = (id) => {
    setLocal((prev) => (prev ?? fetched ?? []).filter((a) => a._id !== id));
  };

  const handleAdded = (account) => {
    setLocal((prev) => {
      const base = prev ?? fetched ?? [];
      const updated = account.isPrimary
        ? base.map((a) => ({ ...a, isPrimary: false }))
        : [...base];
      return [...updated, account];
    });
  };

  return (
    <div className="space-y-6 mt-4 sm:mt-8 pb-10">
      {/* Toast */}
      <div
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 60,
          pointerEvents: "none",
        }}
      >
        <AnimatePresence>
          {toast && (
            <div style={{ pointerEvents: "auto" }}>
              <Toast
                type={toast.type}
                message={toast.message}
                onDismiss={() => setToast(null)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
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
              Bank Accounts
            </h2>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "3px 0 0" }}>
              Manage bank accounts shown in emails and payment invoices
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            background: `linear-gradient(135deg,${DARK},${PURPLE})`,
            boxShadow: `0 4px 14px ${PURPLE}35`,
          }}
        >
          <Plus size={15} /> Add Account
        </button>
      </div>

      {/* Info strip */}
      <div
        style={{
          background: `${PURPLE}06`,
          border: `1px solid ${PURPLE}18`,
          borderRadius: 14,
          padding: "14px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <CreditCard
          size={16}
          style={{ color: PURPLE, flexShrink: 0, marginTop: 1 }}
        />
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: DARK,
              margin: "0 0 3px",
            }}
          >
            Live on all payment emails and invoices
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Changes take effect immediately on all new emails sent. The{" "}
            <strong>Primary</strong> account is shown first. Inactive accounts
            are hidden from clients but kept for records.
          </p>
        </div>
      </div>

      {/* Accounts list */}
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{ height: 200, borderRadius: 20, background: "#f0eeff" }}
              className="animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 16,
            padding: 20,
            display: "flex",
            gap: 10,
          }}
        >
          <AlertTriangle size={18} style={{ color: "#dc2626" }} />
          <p style={{ color: "#dc2626", fontWeight: 600, margin: 0 }}>
            Failed to load bank accounts.
          </p>
        </div>
      ) : accounts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <Building2
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
            No bank accounts yet
          </p>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              marginTop: 16,
              padding: "10px 24px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              background: `linear-gradient(135deg,${DARK},${PURPLE})`,
            }}
          >
            + Add Your First Account
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[...accounts]
            .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
            .map((account) => (
              <BankCard
                key={account._id}
                account={account}
                onSaved={handleSaved}
                onDeleted={handleDeleted}
                showToast={showToast}
              />
            ))}
        </div>
      )}

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <AddAccountForm
            onAdded={handleAdded}
            showToast={showToast}
            onClose={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
