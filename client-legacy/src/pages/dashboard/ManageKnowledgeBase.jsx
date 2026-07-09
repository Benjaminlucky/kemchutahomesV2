/**
 * ManageKnowledgeBase.jsx
 * Admin dashboard page — manages the AI chatbot knowledge base.
 * Three sections: Company Info | FAQs | Notices
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR, { mutate } from "swr";
import {
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  X,
  MessageSquare,
  Building2,
  Info,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Clock,
  MapPin,
  Edit2,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_BASE_URL;
const PURPLE = "#700CEB";
const DARK = "#3F0C91";
const tok = () => localStorage.getItem("token");

const authFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tok()}`,
      ...opts.headers,
    },
  });

const fetcher = (url) =>
  fetch(url, { headers: { Authorization: `Bearer ${tok()}` } }).then((r) => {
    if (!r.ok) throw new Error("Failed");
    return r.json();
  });

const FAQ_CATEGORIES = [
  "General",
  "Subscription",
  "Buy2Sell",
  "Inspection",
  "Documents",
  "Payment",
];

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
        maxWidth: 380,
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
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ── Field helpers ─────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, multiline, rows = 3 }) {
  const shared = {
    value,
    onChange: (e) => onChange(e.target.value),
    placeholder,
    style: {
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
      resize: multiline ? "vertical" : "none",
      transition: "border-color 0.2s",
    },
    onFocus: (e) => {
      e.target.style.borderColor = `${PURPLE}55`;
      e.target.style.boxShadow = `0 0 0 3px ${PURPLE}10`;
    },
    onBlur: (e) => {
      e.target.style.borderColor = "rgba(0,0,0,0.1)";
      e.target.style.boxShadow = "none";
    },
  };
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
      </label>
      {multiline ? (
        <textarea rows={rows} {...shared} />
      ) : (
        <input type="text" {...shared} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Company Info
// ─────────────────────────────────────────────────────────────────────────────
function CompanyInfoSection({ kb, showToast }) {
  const [form, setForm] = useState({ ...kb?.companyInfo });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await authFetch("/api/knowledge-base/company-info", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await mutate(`${BASE}/api/knowledge-base`);
      showToast(
        "success",
        "Company info saved — chatbot will use these details immediately",
      );
    } catch {
      showToast("error", "Failed to save company info");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "lagosPhone", label: "Lagos Phone", icon: <Phone size={13} /> },
    { key: "asabaPhone", label: "Asaba Phone", icon: <Phone size={13} /> },
    {
      key: "whatsappNumber",
      label: "WhatsApp Number",
      icon: <Phone size={13} />,
    },
    { key: "email", label: "Email Address", icon: <Mail size={13} /> },
    { key: "lagosAddress", label: "Lagos Address", icon: <MapPin size={13} /> },
    { key: "asabaAddress", label: "Asaba Address", icon: <MapPin size={13} /> },
    { key: "workingHours", label: "Working Hours", icon: <Clock size={13} /> },
    {
      key: "instagramHandle",
      label: "Instagram Handle",
      icon: <Info size={13} />,
    },
  ];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid rgba(0,0,0,0.07)",
        padding: "28px 28px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${PURPLE}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Building2 size={18} style={{ color: PURPLE }} />
        </div>
        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0f0a1e",
              margin: 0,
            }}
          >
            Company Information
          </h3>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
            The AI chatbot uses these details in every response
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {fields.map(({ key, label }) => (
          <Field
            key={key}
            label={label}
            value={form[key] || ""}
            onChange={(v) => set(key, v)}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "10px 20px",
          borderRadius: 12,
          background: `linear-gradient(135deg,${DARK},${PURPLE})`,
          color: "#fff",
          border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          fontSize: 13,
          fontWeight: 700,
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? (
          "Saving…"
        ) : (
          <>
            <Save size={14} /> Save Company Info
          </>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — FAQs
// ─────────────────────────────────────────────────────────────────────────────
function FaqSection({ kb, showToast }) {
  const [adding, setAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: "",
    category: "General",
  });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // faq _id being edited
  const [editForm, setEditForm] = useState({});
  const [expanded, setExpanded] = useState(null);

  const faqs = kb?.faqs || [];

  const addFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      showToast("error", "Question and answer are required");
      return;
    }
    setSaving(true);
    try {
      const res = await authFetch("/api/knowledge-base/faqs", {
        method: "POST",
        body: JSON.stringify(newFaq),
      });
      if (!res.ok) throw new Error();
      await mutate(`${BASE}/api/knowledge-base`);
      setNewFaq({ question: "", answer: "", category: "General" });
      setAdding(false);
      showToast("success", "FAQ added — chatbot will use it immediately");
    } catch {
      showToast("error", "Failed to add FAQ");
    } finally {
      setSaving(false);
    }
  };

  const saveFaq = async (id) => {
    setSaving(true);
    try {
      const res = await authFetch(`/api/knowledge-base/faqs/${id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      await mutate(`${BASE}/api/knowledge-base`);
      setEditing(null);
      showToast("success", "FAQ updated");
    } catch {
      showToast("error", "Failed to update FAQ");
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (id) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      const res = await authFetch(`/api/knowledge-base/faqs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      await mutate(`${BASE}/api/knowledge-base`);
      showToast("success", "FAQ deleted");
    } catch {
      showToast("error", "Failed to delete FAQ");
    }
  };

  const toggleActive = async (faq) => {
    try {
      await authFetch(`/api/knowledge-base/faqs/${faq._id}`, {
        method: "PUT",
        body: JSON.stringify({ active: !faq.active }),
      });
      await mutate(`${BASE}/api/knowledge-base`);
    } catch {
      showToast("error", "Failed to update FAQ");
    }
  };

  const CAT_COLORS = {
    General: "#6b7280",
    Subscription: PURPLE,
    Buy2Sell: "#059669",
    Inspection: "#d97706",
    Documents: "#0891b2",
    Payment: "#dc2626",
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid rgba(0,0,0,0.07)",
        padding: "28px 28px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${PURPLE}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageSquare size={18} style={{ color: PURPLE }} />
          </div>
          <div>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#0f0a1e",
                margin: 0,
              }}
            >
              FAQ Knowledge Base
            </h3>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
              {faqs.length} FAQ{faqs.length !== 1 ? "s" : ""} · AI uses these
              answers verbatim
            </p>
          </div>
        </div>
        <button
          onClick={() => setAdding((a) => !a)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 12,
            background: `linear-gradient(135deg,${DARK},${PURPLE})`,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <Plus size={14} /> Add FAQ
        </button>
      </div>

      {/* Add FAQ form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: 20,
              background: "#f9f6ff",
              borderRadius: 14,
              padding: 20,
              border: `1px solid ${PURPLE}20`,
            }}
          >
            <div style={{ display: "grid", gap: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                }}
              >
                <Field
                  label="Question"
                  value={newFaq.question}
                  onChange={(v) => setNewFaq((f) => ({ ...f, question: v }))}
                  placeholder="e.g. What is the withdrawal policy?"
                />
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
                    Category
                  </label>
                  <select
                    value={newFaq.category}
                    onChange={(e) =>
                      setNewFaq((f) => ({ ...f, category: e.target.value }))
                    }
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                      border: "1.5px solid rgba(0,0,0,0.1)",
                      background: "#f9fafb",
                      color: "#0f0a1e",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {FAQ_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Field
                label="Answer"
                value={newFaq.answer}
                onChange={(v) => setNewFaq((f) => ({ ...f, answer: v }))}
                placeholder="The AI will use this exact answer…"
                multiline
                rows={4}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={addFaq}
                  disabled={saving}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 10,
                    background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {saving ? "Saving…" : "Add FAQ"}
                </button>
                <button
                  onClick={() => setAdding(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 10,
                    background: "#f3f4f6",
                    color: "#6b7280",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ list */}
      {faqs.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}
        >
          <MessageSquare
            size={28}
            style={{ margin: "0 auto 8px", display: "block", opacity: 0.4 }}
          />
          <p style={{ fontSize: 13, margin: 0 }}>
            No FAQs yet. Add your first one above.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faqs.map((faq) => {
            const isEditing = editing === faq._id;
            const isExpanded = expanded === faq._id;
            const catColor = CAT_COLORS[faq.category] || "#6b7280";
            return (
              <motion.div
                key={faq._id}
                layout
                style={{
                  borderRadius: 14,
                  border: `1px solid ${faq.active !== false ? "rgba(0,0,0,0.07)" : "rgba(0,0,0,0.04)"}`,
                  background: faq.active !== false ? "#fff" : "#f9fafb",
                  overflow: "hidden",
                }}
              >
                {isEditing ? (
                  <div style={{ padding: 16, display: "grid", gap: 10 }}>
                    <Field
                      label="Question"
                      value={editForm.question}
                      onChange={(v) =>
                        setEditForm((f) => ({ ...f, question: v }))
                      }
                    />
                    <Field
                      label="Answer"
                      value={editForm.answer}
                      onChange={(v) =>
                        setEditForm((f) => ({ ...f, answer: v }))
                      }
                      multiline
                      rows={3}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => saveFaq(faq._id)}
                        disabled={saving}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 10,
                          background: `linear-gradient(135deg,${DARK},${PURPLE})`,
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {saving ? (
                          "Saving…"
                        ) : (
                          <>
                            <Save size={12} style={{ marginRight: 4 }} />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 10,
                          background: "#f3f4f6",
                          color: "#6b7280",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "14px 16px",
                        cursor: "pointer",
                      }}
                      onClick={() => setExpanded(isExpanded ? null : faq._id)}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 20,
                          background: `${catColor}15`,
                          color: catColor,
                        }}
                      >
                        {faq.category}
                      </span>
                      <p
                        style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: 700,
                          color: faq.active !== false ? "#0f0a1e" : "#9ca3af",
                          margin: 0,
                        }}
                      >
                        {faq.question}
                      </p>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActive(faq);
                          }}
                          title={faq.active !== false ? "Disable" : "Enable"}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 8,
                            background:
                              faq.active !== false
                                ? "rgba(5,150,105,0.1)"
                                : "rgba(0,0,0,0.06)",
                            color: faq.active !== false ? "#059669" : "#9ca3af",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {faq.active !== false ? "Active" : "Off"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing(faq._id);
                            setEditForm({
                              question: faq.question,
                              answer: faq.answer,
                              category: faq.category,
                            });
                          }}
                          style={{
                            padding: 6,
                            borderRadius: 8,
                            background: "rgba(0,0,0,0.04)",
                            border: "none",
                            cursor: "pointer",
                            color: "#6b7280",
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFaq(faq._id);
                          }}
                          style={{
                            padding: 6,
                            borderRadius: 8,
                            background: "rgba(220,38,38,0.07)",
                            border: "none",
                            cursor: "pointer",
                            color: "#dc2626",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                        {isExpanded ? (
                          <ChevronUp size={14} style={{ color: "#9ca3af" }} />
                        ) : (
                          <ChevronDown size={14} style={{ color: "#9ca3af" }} />
                        )}
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          style={{ overflow: "hidden" }}
                        >
                          <p
                            style={{
                              padding: "0 16px 14px",
                              fontSize: 13,
                              color: "#374151",
                              lineHeight: 1.7,
                              margin: 0,
                              borderTop: "1px solid rgba(0,0,0,0.05)",
                              paddingTop: 10,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — Notices
// ─────────────────────────────────────────────────────────────────────────────
function NoticesSection({ kb, showToast }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const notices = kb?.notices || [];

  const add = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await authFetch("/api/knowledge-base/notices", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      await mutate(`${BASE}/api/knowledge-base`);
      setText("");
      showToast(
        "success",
        "Notice added — chatbot will mention it when relevant",
      );
    } catch {
      showToast("error", "Failed to add notice");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    try {
      const res = await authFetch(`/api/knowledge-base/notices/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      await mutate(`${BASE}/api/knowledge-base`);
      showToast("success", "Notice removed");
    } catch {
      showToast("error", "Failed to remove notice");
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid rgba(0,0,0,0.07)",
        padding: "28px 28px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(217,119,6,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Info size={18} style={{ color: "#d97706" }} />
        </div>
        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0f0a1e",
              margin: 0,
            }}
          >
            Live Announcements
          </h3>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
            Temporary notices the AI will mention — new launches, promotions,
            urgent info
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="e.g. New estate launching in Ibeju-Lekki next week — limited plots available!"
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 13,
            border: "1.5px solid rgba(0,0,0,0.1)",
            background: "#f9fafb",
            outline: "none",
            fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = `${PURPLE}55`)}
          onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.1)")}
        />
        <button
          onClick={add}
          disabled={saving || !text.trim()}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: `linear-gradient(135deg,${DARK},${PURPLE})`,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            opacity: !text.trim() ? 0.5 : 1,
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      {notices.length === 0 ? (
        <p
          style={{
            fontSize: 13,
            color: "#9ca3af",
            textAlign: "center",
            padding: "16px 0",
          }}
        >
          No active announcements
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notices.map((n) => (
            <div
              key={n._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                background: "rgba(217,119,6,0.06)",
                borderRadius: 12,
                border: "1px solid rgba(217,119,6,0.15)",
              }}
            >
              <span style={{ fontSize: 14 }}>⚡</span>
              <p style={{ flex: 1, fontSize: 13, color: "#374151", margin: 0 }}>
                {n.text}
              </p>
              <button
                onClick={() => del(n._id)}
                style={{
                  padding: 6,
                  borderRadius: 8,
                  background: "rgba(220,38,38,0.08)",
                  border: "none",
                  cursor: "pointer",
                  color: "#dc2626",
                  flexShrink: 0,
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function ManageKnowledgeBase() {
  const { data: kb, error } = useSWR(`${BASE}/api/knowledge-base`, fetcher);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load knowledge base. Please refresh.
      </div>
    );
  if (!kb)
    return (
      <div className="p-8 flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: PURPLE }}
        />
      </div>
    );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Toast */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}>
        <AnimatePresence>
          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              onDismiss={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Page header */}
      <div>
        <h2
          className="text-2xl font-black text-customBlack-900"
          style={{ letterSpacing: "-0.03em" }}
        >
          AI Chatbot Knowledge Base
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Everything managed here is used by the chatbot in real-time — no
          redeployment needed. Estate prices come directly from your estate
          listings. ROI rates come from Buy2Sell settings.
        </p>
      </div>

      {/* Info banner */}
      <div
        style={{
          background: `${PURPLE}08`,
          border: `1px solid ${PURPLE}20`,
          borderRadius: 16,
          padding: "14px 20px",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <Info
          size={18}
          style={{ color: PURPLE, flexShrink: 0, marginTop: 1 }}
        />
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: PURPLE,
              margin: "0 0 3px",
            }}
          >
            How this works
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#374151",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            When a visitor sends a message, the chatbot automatically fetches
            your <strong>live estate prices</strong>,
            <strong> current ROI rates</strong>, and everything below — then
            builds its response using that real data. Update anything here and
            the chatbot knows immediately, on the next message.
          </p>
        </div>
      </div>

      <CompanyInfoSection kb={kb} showToast={showToast} />
      <FaqSection kb={kb} showToast={showToast} />
      <NoticesSection kb={kb} showToast={showToast} />
    </div>
  );
}
