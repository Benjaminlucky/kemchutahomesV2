"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  MessageCircleQuestion,
  Megaphone,
  Building2,
  EyeOff,
  Clock,
} from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Select } from "@/components/ui/Input";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import { FAQ_CATEGORIES, type CompanyInfo, type Faq, type KnowledgeBase, type Notice } from "./types";

const COMPANY_FIELDS: { key: keyof CompanyInfo; label: string }[] = [
  { key: "lagosPhone", label: "Lagos Phone" },
  { key: "asabaPhone", label: "Asaba Phone" },
  { key: "whatsappNumber", label: "WhatsApp Number" },
  { key: "email", label: "Email" },
  { key: "lagosAddress", label: "Lagos Address" },
  { key: "asabaAddress", label: "Asaba Address" },
  { key: "workingHours", label: "Working Hours" },
  { key: "instagramHandle", label: "Instagram Handle" },
];

function fmtDate(d?: string | null) {
  return d
    ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    : "—";
}

async function fetchKnowledgeBase(): Promise<KnowledgeBase> {
  const res = await dashboardFetch("/api/knowledge-base");
  if (!res.ok) throw new Error("Failed to fetch knowledge base");
  return res.json();
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Building2;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-customBlack-100 bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">{label}</p>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-lg font-black tracking-tight break-all text-customBlack-900">{value}</p>
    </div>
  );
}

export default function KnowledgeBasePanel({ initial }: { initial: KnowledgeBase | null }) {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);

  const {
    data: kb,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["knowledge-base"],
    queryFn: fetchKnowledgeBase,
    initialData: initial ?? undefined,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-3xl border border-customBlack-100 bg-customBlack-50" />
        ))}
      </div>
    );
  }

  if (isError || !kb) {
    return (
      <ErrorBanner className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>Failed to load the knowledge base.</span>
        <Button variant="secondary" size="sm" loading={isFetching} onClick={() => refetch()}>
          Retry
        </Button>
      </ErrorBanner>
    );
  }

  const hiddenFaqs = kb.faqs.filter((f) => f.active === false).length;
  const liveNotices = kb.notices.filter((n) => n.active !== false).length;

  return (
    <div className="space-y-8">
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total FAQs" value={String(kb.faqs.length)} icon={MessageCircleQuestion} tone="bg-customPurple-50 text-customPurple-600" />
        <StatCard label="Hidden FAQs" value={String(hiddenFaqs)} icon={EyeOff} tone="bg-customBlack-50 text-customBlack-500" />
        <StatCard label="Live Notices" value={`${liveNotices}/${kb.notices.length}`} icon={Megaphone} tone="bg-amber-50 text-amber-600" />
        <StatCard label="Last Updated" value={fmtDate(kb.updatedAt)} icon={Clock} tone="bg-green-50 text-green-600" />
      </div>

      <CompanyInfoSection companyInfo={kb.companyInfo} onSaved={() => { setToast("Company info updated"); invalidate(); }} />
      <FaqSection faqs={kb.faqs} onChanged={(msg) => { setToast(msg); invalidate(); }} />
      <NoticesSection notices={kb.notices} onChanged={(msg) => { setToast(msg); invalidate(); }} />
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: typeof Building2;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-customPurple-50">
          <Icon size={18} className="text-customPurple-600" />
        </div>
        <h2 className="text-xl font-bold text-customBlack-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function CompanyInfoSection({ companyInfo, onSaved }: { companyInfo: CompanyInfo; onSaved: () => void }) {
  const [form, setForm] = useState<CompanyInfo>(companyInfo);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!dirty && JSON.stringify(companyInfo) !== JSON.stringify(form)) {
    setForm(companyInfo);
  }

  const mutation = useDashboardMutation<{ companyInfo: CompanyInfo }, CompanyInfo>({
    mutationFn: async (body) => {
      const res = await dashboardFetch("/api/knowledge-base/company-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update company info");
      return data;
    },
    onSuccess: (data) => {
      // Sync straight from the server's response rather than waiting on the
      // invalidated query to refetch — otherwise the form briefly (or, if the
      // refetch fails, permanently) snaps back to the pre-save values for the
      // duration of that refetch, right under a "Company info updated" toast.
      setForm(data.companyInfo);
      setDirty(false);
      setError(null);
      onSaved();
    },
    onError: (err) => setError(err.message || "Failed to update company info"),
  });

  return (
    <Card radius="3xl" className="p-6">
      <SectionHeader icon={Building2} title="Company Info" />
      {error && <ErrorBanner className="mb-4">{error}</ErrorBanner>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {COMPANY_FIELDS.map(({ key, label }) => (
          <FormField key={key} label={label}>
            <input
              value={form[key]}
              onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setDirty(true); }}
              className={textInputClass()}
            />
          </FormField>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button loading={mutation.isPending} onClick={() => mutation.mutate(form)}>
          Save Company Info
        </Button>
      </div>
    </Card>
  );
}

function FaqSection({ faqs, onChanged }: { faqs: Faq[]; onChanged: (msg: string) => void }) {
  const [formTarget, setFormTarget] = useState<"new" | Faq | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "General" as Faq["category"] });
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const addMutation = useDashboardMutation<unknown, typeof form>({
    mutationFn: async (body) => {
      const res = await dashboardFetch("/api/knowledge-base/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add FAQ");
      return data;
    },
    onSuccess: () => { setFormTarget(null); onChanged("FAQ added"); },
    onError: (err) => setFormError(err.message || "Failed to add FAQ"),
  });

  const updateMutation = useDashboardMutation<unknown, { id: string; body: Partial<Faq> }>({
    mutationFn: async ({ id, body }) => {
      const res = await dashboardFetch(`/api/knowledge-base/faqs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update FAQ");
      return data;
    },
    onSuccess: (_data, { body }) => {
      if (body.question !== undefined) setFormTarget(null);
      onChanged("FAQ updated");
    },
    onError: (err, { body }) => {
      const message = err.message || "Failed to update FAQ";
      if (body.question !== undefined) setFormError(message);
      else setRowError(message);
    },
  });

  const deleteMutation = useDashboardMutation<unknown, Faq>({
    mutationFn: async (faq) => {
      const res = await dashboardFetch(`/api/knowledge-base/faqs/${faq._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete FAQ");
      return data;
    },
    onSuccess: () => { setDeleteTarget(null); onChanged("FAQ deleted"); },
    onError: (err) => setFormError(err.message || "Failed to delete FAQ"),
  });

  function openNew() {
    setForm({ question: "", answer: "", category: "General" });
    setFormError(null);
    setFormTarget("new");
  }

  function openEdit(faq: Faq) {
    setForm({ question: faq.question, answer: faq.answer, category: faq.category });
    setFormError(null);
    setFormTarget(faq);
  }

  function submit() {
    if (formTarget === "new") addMutation.mutate(form);
    else if (formTarget) updateMutation.mutate({ id: formTarget._id, body: form });
  }

  return (
    <Card radius="3xl" className="p-6">
      <SectionHeader
        icon={MessageCircleQuestion}
        title="FAQs"
        action={
          <Button size="sm" onClick={openNew}>
            <Plus size={14} />
            Add FAQ
          </Button>
        }
      />
      {rowError && (
        <ErrorBanner className="mb-4 flex items-center justify-between gap-3">
          <span>{rowError}</span>
          <button onClick={() => setRowError(null)} className="text-xs font-bold text-red-700 hover:underline">
            Dismiss
          </button>
        </ErrorBanner>
      )}

      <div className="space-y-3">
        {faqs.map((faq) => {
          const togglePending =
            updateMutation.isPending &&
            updateMutation.variables?.id === faq._id &&
            updateMutation.variables?.body.active !== undefined;
          return (
            <div key={faq._id} className="rounded-xl border border-customBlack-100 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone="purple">{faq.category}</Badge>
                    <Badge tone={faq.active === false ? "gray" : "green"}>
                      {faq.active === false ? "Hidden" : "Visible"}
                    </Badge>
                  </div>
                  <p className="font-bold break-words text-customBlack-900">{faq.question}</p>
                  <p className="mt-1 line-clamp-3 text-sm break-words text-customBlack-500">{faq.answer}</p>
                </div>
                <div className="flex shrink-0 items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={togglePending}
                    onClick={() => {
                      setRowError(null);
                      updateMutation.mutate({ id: faq._id, body: { active: faq.active === false } });
                    }}
                  >
                    {faq.active === false ? "Show" : "Hide"}
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(faq)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="danger" size="icon" aria-label="Delete" onClick={() => setDeleteTarget(faq)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {faqs.length === 0 && <p className="py-8 text-center text-sm text-customBlack-400">No FAQs yet.</p>}
      </div>

      <Modal open={formTarget !== null} onClose={() => setFormTarget(null)} title={formTarget === "new" ? "Add FAQ" : "Edit FAQ"}>
        <div className="space-y-4">
          {formError && <ErrorBanner>{formError}</ErrorBanner>}
          <FormField label="Question">
            <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className={textInputClass()} />
          </FormField>
          <FormField label="Answer">
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              rows={4}
              className={textInputClass()}
            />
          </FormField>
          <FormField label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Faq["category"] })}>
              {FAQ_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button variant="secondary" size="md" className="rounded-lg" onClick={() => setFormTarget(null)}>Cancel</Button>
            <Button
              size="md"
              className="rounded-lg"
              loading={addMutation.isPending || updateMutation.isPending}
              disabled={!form.question.trim() || !form.answer.trim()}
              onClick={submit}
            >
              {formTarget === "new" ? "Add FAQ" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete FAQ?"
        description={<>Delete &ldquo;{deleteTarget?.question}&rdquo;? This cannot be undone.</>}
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}

function NoticesSection({ notices, onChanged }: { notices: Notice[]; onChanged: (msg: string) => void }) {
  const [text, setText] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addMutation = useDashboardMutation<unknown, string>({
    mutationFn: async (noticeText) => {
      const res = await dashboardFetch("/api/knowledge-base/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noticeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add notice");
      return data;
    },
    onSuccess: () => { setText(""); setError(null); onChanged("Notice added"); },
    onError: (err) => setError(err.message || "Failed to add notice"),
  });

  const updateMutation = useDashboardMutation<unknown, { id: string; active: boolean }>({
    mutationFn: async ({ id, active }) => {
      const res = await dashboardFetch(`/api/knowledge-base/notices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update notice");
      return data;
    },
    onSuccess: () => { setError(null); onChanged("Notice updated"); },
    onError: (err) => setError(err.message || "Failed to update notice"),
  });

  const deleteMutation = useDashboardMutation<unknown, Notice>({
    mutationFn: async (notice) => {
      const res = await dashboardFetch(`/api/knowledge-base/notices/${notice._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete notice");
      return data;
    },
    onSuccess: () => { setDeleteTarget(null); onChanged("Notice deleted"); },
    onError: (err) => setError(err.message || "Failed to delete notice"),
  });

  return (
    <Card radius="3xl" className="p-6">
      <SectionHeader icon={Megaphone} title="Announcement Notices" />
      {error && (
        <ErrorBanner className="mb-4 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs font-bold text-red-700 hover:underline">
            Dismiss
          </button>
        </ErrorBanner>
      )}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New announcement text…"
          className={`min-w-0 flex-1 ${textInputClass()}`}
        />
        <Button
          className="shrink-0"
          loading={addMutation.isPending}
          disabled={!text.trim()}
          onClick={() => { setError(null); addMutation.mutate(text.trim()); }}
        >
          <Plus size={16} />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {notices.map((notice) => {
          const hidden = notice.active === false;
          const togglePending = updateMutation.isPending && updateMutation.variables?.id === notice._id;
          return (
            <div
              key={notice._id}
              className="flex flex-col gap-3 rounded-lg border border-customBlack-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge tone={hidden ? "gray" : "green"}>{hidden ? "Hidden" : "Live"}</Badge>
                  {notice.createdAt && (
                    <span className="text-xs text-customBlack-400">Added {fmtDate(notice.createdAt)}</span>
                  )}
                </div>
                <p className="text-sm break-words text-customBlack-800">{notice.text}</p>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  loading={togglePending}
                  onClick={() => { setError(null); updateMutation.mutate({ id: notice._id, active: hidden }); }}
                >
                  {hidden ? "Show" : "Hide"}
                </Button>
                <Button variant="danger" size="icon" aria-label="Delete" onClick={() => setDeleteTarget(notice)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          );
        })}
        {notices.length === 0 && <p className="py-8 text-center text-sm text-customBlack-400">No notices yet.</p>}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete Notice?"
        description={<>Delete &ldquo;{deleteTarget?.text}&rdquo;? This cannot be undone.</>}
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}
