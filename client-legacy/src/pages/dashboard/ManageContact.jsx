import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronDown,
  Building2,
  Star,
  PlusCircle,
  X,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from "lucide-react";

// ── Brand ──────────────────────────────────────────────────────────────────────
const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";
const PURPLE_LIGHT = "#EDE9FE";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = () => localStorage.getItem("token");

// ── Fetcher ───────────────────────────────────────────────────────────────────
const fetcher = async (url) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />
  );
}

function Toast({ type, message, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      className="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl"
      style={{
        background:
          type === "success" ? "rgba(5,150,105,0.97)" : "rgba(220,38,38,0.95)",
        color: "#fff",
        fontFamily: "Poppins, sans-serif",
        maxWidth: 380,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {type === "success" ? (
        <CheckCircle size={17} style={{ flexShrink: 0 }} />
      ) : (
        <AlertTriangle size={17} style={{ flexShrink: 0 }} />
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
        <X size={15} />
      </button>
    </motion.div>
  );
}

// ── Section heading inside a branch card ──────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 800,
        color: "#9ca3af",
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        margin: "0 0 6px",
      }}
    >
      {children}
    </p>
  );
}

// ── Generic text input ─────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono = false,
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: mono ? 500 : 400,
          fontFamily: mono ? "monospace" : "inherit",
          color: "#0f0a1e",
          background: "#f9fafb",
          border: "1.5px solid rgba(0,0,0,0.1)",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = `${PURPLE}55`;
          e.target.style.boxShadow = `0 0 0 3px ${PURPLE}12`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(0,0,0,0.1)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

// ── Repeatable list field (phones / emails) ────────────────────────────────────
function ListField({
  label,
  items,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
}) {
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const edit = (i, v) => onChange(items.map((x, idx) => (idx === i ? v : x)));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <FieldLabel>{label}</FieldLabel>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-xs font-bold transition-colors hover:opacity-80"
          style={{
            color: PURPLE,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {Icon && (
              <Icon size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
            )}
            <input
              type={type}
              value={item}
              onChange={(e) => edit(i, e.target.value)}
              placeholder={placeholder}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 10,
                fontSize: 13,
                color: "#0f0a1e",
                background: "#f9fafb",
                border: "1.5px solid rgba(0,0,0,0.1)",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = `${PURPLE}55`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0,0,0,0.1)";
              }}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors hover:bg-red-50"
              style={{
                background: "none",
                border: "1px solid rgba(239,68,68,0.2)",
                cursor: "pointer",
                color: "#ef4444",
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
            No {label.toLowerCase()} added yet.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Branch editor card ─────────────────────────────────────────────────────────
function BranchEditor({ branch, onSave, onDelete }) {
  const [form, setForm] = useState({ ...branch });
  const [open, setOpen] = useState(branch.isHQ); // HQ open by default
  const [saving, setSaving] = useState(false);
  const [deleting, setDel] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const set = useCallback((path, val) => {
    setForm((prev) => {
      const next = { ...prev };
      // Support nested paths like "hours.weekdays" and "social.instagram"
      const parts = path.split(".");
      if (parts.length === 1) {
        next[path] = val;
      } else {
        next[parts[0]] = { ...next[parts[0]], [parts[1]]: val };
      }
      return next;
    });
    setSaved(false);
    setErr("");
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`${BASE_URL}/api/branches/${branch.branchId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSave(data.branch);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete the ${branch.label} branch? This cannot be undone.`,
      )
    )
      return;
    setDel(true);
    try {
      const res = await fetch(`${BASE_URL}/api/branches/${branch.branchId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onDelete(branch.branchId);
    } catch (e) {
      setErr(e.message);
      setDel(false);
    }
  };

  const SOCIAL_ICONS = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    youtube: Youtube,
    whatsapp: Globe,
  };

  return (
    <div
      style={{
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        background: "#fff",
      }}
    >
      {/* Card header — click to expand/collapse */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: branch.isHQ ? `${PURPLE}12` : "rgba(5,150,105,0.1)",
            }}
          >
            {branch.isHQ ? (
              <Star size={18} style={{ color: PURPLE }} />
            ) : (
              <MapPin size={18} style={{ color: "#059669" }} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#0f0a1e",
                  margin: 0,
                  letterSpacing: "-0.03em",
                }}
              >
                {form.label} Office
              </h3>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: branch.isHQ
                    ? `${PURPLE}10`
                    : "rgba(5,150,105,0.1)",
                  color: branch.isHQ ? PURPLE : "#059669",
                }}
              >
                {branch.isHQ ? "★ HQ" : "Branch"}
              </span>
              {!form.isActive && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                  Inactive
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#9ca3af",
                margin: "2px 0 0",
                fontWeight: 500,
              }}
            >
              {form.address || "No address set"}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown size={18} style={{ color: "#9ca3af" }} />
        </motion.div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "0 24px 28px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div className="space-y-6 pt-5">
                {/* ── Basic info ─────────────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 size={13} style={{ color: PURPLE }} />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: PURPLE,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      Basic Information
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Branch Label"
                      value={form.label}
                      onChange={(v) => set("label", v)}
                      placeholder="e.g. Lagos"
                    />
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <FieldLabel>Status</FieldLabel>
                        <select
                          value={form.isActive ? "active" : "inactive"}
                          onChange={(e) =>
                            set("isActive", e.target.value === "active")
                          }
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 10,
                            fontSize: 13,
                            color: "#0f0a1e",
                            background: "#f9fafb",
                            border: "1.5px solid rgba(0,0,0,0.1)",
                            outline: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Field
                        label="Street Address"
                        value={form.address}
                        onChange={(v) => set("address", v)}
                        placeholder="e.g. 12 Admiralty Way, Lekki Phase 1, Lagos"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Contact details ────────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Phone size={13} style={{ color: PURPLE }} />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: PURPLE,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      Contact Details
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ListField
                      label="Phone Numbers"
                      items={form.phones || []}
                      onChange={(v) => set("phones", v)}
                      placeholder="+234 800 000 0000"
                      icon={Phone}
                      type="tel"
                    />
                    <ListField
                      label="Email Addresses"
                      items={form.emails || []}
                      onChange={(v) => set("emails", v)}
                      placeholder="branch@kemchutahomesltd.com"
                      icon={Mail}
                      type="email"
                    />
                  </div>
                </div>

                {/* ── Office hours ───────────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={13} style={{ color: PURPLE }} />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: PURPLE,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      Office Hours
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field
                      label="Weekdays"
                      value={form.hours?.weekdays || ""}
                      onChange={(v) => set("hours.weekdays", v)}
                      placeholder="Mon – Fri: 8:00am – 6:00pm"
                    />
                    <Field
                      label="Saturday"
                      value={form.hours?.saturday || ""}
                      onChange={(v) => set("hours.saturday", v)}
                      placeholder="Sat: 9:00am – 3:00pm"
                    />
                    <Field
                      label="Sunday"
                      value={form.hours?.sunday || ""}
                      onChange={(v) => set("hours.sunday", v)}
                      placeholder="Closed"
                    />
                  </div>
                </div>

                {/* ── Google Maps ────────────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={13} style={{ color: PURPLE }} />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: PURPLE,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      Google Maps
                    </span>
                  </div>
                  <div className="space-y-4">
                    <Field
                      label="Maps Embed URL (iframe src)"
                      value={form.mapEmbedUrl || ""}
                      onChange={(v) => set("mapEmbedUrl", v)}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      mono
                    />
                    <Field
                      label="Maps Direction Link"
                      value={form.mapLink || ""}
                      onChange={(v) => set("mapLink", v)}
                      placeholder="https://maps.google.com/?q=..."
                      mono
                    />
                    {/* Live map preview */}
                    {form.mapEmbedUrl && (
                      <div>
                        <FieldLabel>Map Preview</FieldLabel>
                        <div
                          style={{
                            borderRadius: 12,
                            overflow: "hidden",
                            height: 200,
                            border: "1px solid rgba(0,0,0,0.1)",
                          }}
                        >
                          <iframe
                            src={form.mapEmbedUrl}
                            title="Map preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              border: "none",
                            }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Social media ───────────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe size={13} style={{ color: PURPLE }} />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: PURPLE,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      Social Media
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "instagram",
                      "facebook",
                      "twitter",
                      "whatsapp",
                      "youtube",
                    ].map((key) => {
                      const Icon = SOCIAL_ICONS[key];
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(0,0,0,0.05)" }}
                          >
                            <Icon size={14} style={{ color: "#6b7280" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <input
                              type="url"
                              value={form.social?.[key] || ""}
                              onChange={(e) =>
                                set(`social.${key}`, e.target.value)
                              }
                              placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`}
                              style={{
                                width: "100%",
                                padding: "9px 12px",
                                borderRadius: 10,
                                fontSize: 13,
                                color: "#0f0a1e",
                                background: "#f9fafb",
                                border: "1.5px solid rgba(0,0,0,0.1)",
                                outline: "none",
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                                transition: "border-color 0.2s",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = `${PURPLE}55`;
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "rgba(0,0,0,0.1)";
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Error ─────────────────────────────────────────── */}
                {err && (
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: "rgba(239,68,68,0.07)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    <AlertTriangle
                      size={14}
                      style={{ color: "#dc2626", flexShrink: 0 }}
                    />
                    <p
                      style={{
                        fontSize: 13,
                        color: "#dc2626",
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      {err}
                    </p>
                  </div>
                )}

                {/* ── Action buttons ─────────────────────────────────── */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  {/* Delete — only for non-HQ */}
                  {!branch.isHQ ? (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-red-50"
                      style={{
                        background: "none",
                        border: "1px solid rgba(239,68,68,0.25)",
                        color: "#ef4444",
                        cursor: "pointer",
                      }}
                    >
                      {deleting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Delete Branch
                    </button>
                  ) : (
                    <p style={{ fontSize: 11, color: "#9ca3af" }}>
                      HQ branch cannot be deleted
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                    style={{
                      background: saving
                        ? "rgba(112,12,235,0.4)"
                        : `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`,
                      border: "none",
                      cursor: saving ? "not-allowed" : "pointer",
                      boxShadow: saving
                        ? "none"
                        : "0 4px 14px rgba(112,12,235,0.35)",
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving…
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle size={14} /> Saved!
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Create Branch Modal ────────────────────────────────────────────────────────
function CreateBranchModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    branchId: "",
    label: "",
    address: "",
    phones: [""],
    emails: [""],
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.branchId.trim() || !form.label.trim()) {
      setErr("Branch ID and label are required");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`${BASE_URL}/api/branches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          ...form,
          phones: form.phones.filter(Boolean),
          emails: form.emails.filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onCreate(data.branch);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 12,
    fontSize: 13,
    color: "#0f0a1e",
    background: "#f9fafb",
    border: "1.5px solid rgba(0,0,0,0.1)",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 520,
          boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "#0f0a1e",
              letterSpacing: "-0.04em",
              margin: 0,
            }}
          >
            Add New Branch
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

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Branch ID (unique, lowercase)</FieldLabel>
              <input
                type="text"
                value={form.branchId}
                onChange={(e) =>
                  set(
                    "branchId",
                    e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  )
                }
                placeholder="e.g. port-harcourt"
                style={inputStyle}
              />
            </div>
            <div>
              <FieldLabel>Branch Label</FieldLabel>
              <input
                type="text"
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                placeholder="e.g. Port Harcourt"
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Address</FieldLabel>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Full street address"
              style={inputStyle}
            />
          </div>
          <ListField
            label="Phone Numbers"
            items={form.phones}
            onChange={(v) => set("phones", v)}
            placeholder="+234 800 000 0000"
            icon={Phone}
            type="tel"
          />
          <ListField
            label="Email Addresses"
            items={form.emails}
            onChange={(v) => set("emails", v)}
            placeholder="branch@kemchutahomesltd.com"
            icon={Mail}
            type="email"
          />
        </div>

        {err && (
          <div
            className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <AlertTriangle size={13} style={{ color: "#dc2626" }} />
            <p
              style={{
                fontSize: 12,
                color: "#dc2626",
                fontWeight: 500,
                margin: 0,
              }}
            >
              {err}
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
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
            onClick={handleCreate}
            disabled={saving}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 12,
              border: "none",
              background: saving
                ? "rgba(112,12,235,0.4)"
                : `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Creating…
              </>
            ) : (
              <>
                <PlusCircle size={14} /> Create Branch
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ManageContact() {
  const [toast, setToast] = useState(null);
  const [showCreate, setCreate] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const {
    data: branches,
    error,
    isLoading,
    mutate,
  } = useSWR(`${BASE_URL}/api/branches`, fetcher, { revalidateOnFocus: false });

  const [localBranches, setLocal] = useState(null);
  React.useEffect(() => {
    if (branches) setLocal(branches);
  }, [branches]);

  const displayBranches = localBranches || branches || [];

  const handleSave = (updated) => {
    setLocal((prev) =>
      prev.map((b) => (b.branchId === updated.branchId ? updated : b)),
    );
    showToast("success", `${updated.label} office saved successfully`);
  };

  const handleDelete = (branchId) => {
    setLocal((prev) => prev.filter((b) => b.branchId !== branchId));
    showToast("success", "Branch deleted");
  };

  const handleCreate = (newBranch) => {
    setLocal((prev) => [...(prev || []), newBranch]);
    showToast("success", `${newBranch.label} branch created`);
  };

  return (
    <div className="space-y-6 mt-4 sm:mt-8 pb-10 font-poppins">
      {/* Toast */}
      <div className="fixed top-6 right-6 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toast && (
            <div className="pointer-events-auto">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-7 rounded-full"
            style={{
              background: `linear-gradient(to bottom,${PURPLE_DARK},${PURPLE})`,
            }}
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Contact Management
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage office addresses, phone numbers, emails, hours and maps
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`,
            boxShadow: "0 4px 14px rgba(112,12,235,0.35)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <PlusCircle size={15} />
          Add Branch
        </button>
      </div>

      {/* Info strip */}
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-2xl"
        style={{
          background: "rgba(112,12,235,0.05)",
          border: "1px solid rgba(112,12,235,0.12)",
        }}
      >
        <Building2
          size={16}
          style={{ color: PURPLE, flexShrink: 0, marginTop: 1 }}
        />
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: PURPLE,
              margin: "0 0 2px",
            }}
          >
            Live on kemchutahomesltd.com/contact
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Any changes you save here are immediately reflected on the public
            Contact page. The Lagos branch (HQ) cannot be deleted. You can mark
            a branch as Inactive to hide it without deleting.
          </p>
        </div>
      </div>

      {/* Branch editors */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500" />
          <p className="text-red-700 font-semibold text-sm">{error.message}</p>
        </div>
      ) : displayBranches.length === 0 ? (
        <div className="text-center py-16">
          <MapPin size={40} className="mx-auto text-gray-200 mb-4" />
          <p className="font-bold text-gray-400">
            No branches found. Add one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayBranches.map((branch) => (
            <BranchEditor
              key={branch.branchId}
              branch={branch}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateBranchModal
            onClose={() => setCreate(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
