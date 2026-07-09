"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, MessageCircleQuestion, Megaphone, Building2 } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
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

const EMPTY_COMPANY: CompanyInfo = {
  lagosPhone: "",
  asabaPhone: "",
  whatsappNumber: "",
  email: "",
  lagosAddress: "",
  asabaAddress: "",
  workingHours: "",
  instagramHandle: "",
};

async function fetchKnowledgeBase(): Promise<KnowledgeBase> {
  const res = await dashboardFetch("/api/knowledge-base");
  if (!res.ok) throw new Error("Failed to fetch knowledge base");
  return res.json();
}

export default function KnowledgeBasePanel({ initial }: { initial: KnowledgeBase | null }) {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);

  const { data: kb } = useQuery({
    queryKey: ["knowledge-base"],
    queryFn: fetchKnowledgeBase,
    initialData: initial ?? undefined,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
  }

  return (
    <div className="space-y-8">
      <Toast message={toast} onClose={() => setToast(null)} />
      <CompanyInfoSection companyInfo={kb?.companyInfo} onSaved={() => { setToast("Company info updated"); invalidate(); }} />
      <FaqSection faqs={kb?.faqs ?? []} onChanged={(msg) => { setToast(msg); invalidate(); }} />
      <NoticesSection notices={kb?.notices ?? []} onChanged={(msg) => { setToast(msg); invalidate(); }} />
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Building2; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-customPurple-50">
        <Icon size={18} className="text-customPurple-600" />
      </div>
      <h2 className="text-xl font-bold text-customBlack-900">{title}</h2>
    </div>
  );
}

function CompanyInfoSection({ companyInfo, onSaved }: { companyInfo?: CompanyInfo; onSaved: () => void }) {
  const [form, setForm] = useState<CompanyInfo>(companyInfo ?? EMPTY_COMPANY);
  const [dirty, setDirty] = useState(false);

  if (!dirty && companyInfo && JSON.stringify(companyInfo) !== JSON.stringify(form)) {
    setForm(companyInfo);
  }

  const mutation = useDashboardMutation<unknown, CompanyInfo>({
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
    onSuccess: () => {
      setDirty(false);
      onSaved();
    },
  });

  return (
    <Card radius="3xl" className="p-6">
      <SectionHeader icon={Building2} title="Company Info" />
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
  });

  const deleteMutation = useDashboardMutation<unknown, Faq>({
    mutationFn: async (faq) => {
      const res = await dashboardFetch(`/api/knowledge-base/faqs/${faq._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete FAQ");
      return data;
    },
    onSuccess: () => { setDeleteTarget(null); onChanged("FAQ deleted"); },
  });

  function openNew() {
    setForm({ question: "", answer: "", category: "General" });
    setFormTarget("new");
  }

  function openEdit(faq: Faq) {
    setForm({ question: faq.question, answer: faq.answer, category: faq.category });
    setFormTarget(faq);
  }

  function submit() {
    if (formTarget === "new") addMutation.mutate(form);
    else if (formTarget) updateMutation.mutate({ id: formTarget._id, body: form });
  }

  return (
    <Card radius="3xl" className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <SectionHeader icon={MessageCircleQuestion} title="FAQs" />
        <Button size="sm" onClick={openNew}>
          <Plus size={14} />
          Add FAQ
        </Button>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq._id} className="rounded-xl border border-customBlack-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge tone="purple">{faq.category}</Badge>
                  <Badge tone={faq.active === false ? "gray" : "green"}>
                    {faq.active === false ? "Hidden" : "Visible"}
                  </Badge>
                </div>
                <p className="font-bold text-customBlack-900">{faq.question}</p>
                <p className="mt-1 text-sm text-customBlack-500">{faq.answer}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateMutation.mutate({ id: faq._id, body: { active: faq.active === false } })}
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
        ))}
        {faqs.length === 0 && <p className="py-8 text-center text-sm text-customBlack-400">No FAQs yet.</p>}
      </div>

      <Modal open={formTarget !== null} onClose={() => setFormTarget(null)} title={formTarget === "new" ? "Add FAQ" : "Edit FAQ"}>
        <div className="space-y-4">
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
    onSuccess: () => { setText(""); onChanged("Notice added"); },
  });

  const deleteMutation = useDashboardMutation<unknown, Notice>({
    mutationFn: async (notice) => {
      const res = await dashboardFetch(`/api/knowledge-base/notices/${notice._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete notice");
      return data;
    },
    onSuccess: () => { setDeleteTarget(null); onChanged("Notice deleted"); },
  });

  return (
    <Card radius="3xl" className="p-6">
      <SectionHeader icon={Megaphone} title="Announcement Notices" />
      <div className="mb-4 flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New announcement text…"
          className={`flex-1 ${textInputClass()}`}
        />
        <Button loading={addMutation.isPending} disabled={!text.trim()} onClick={() => addMutation.mutate(text.trim())}>
          <Plus size={16} />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {notices.map((notice) => (
          <div key={notice._id} className="flex items-center justify-between rounded-lg border border-customBlack-100 px-4 py-3">
            <p className="text-sm text-customBlack-800">{notice.text}</p>
            <Button variant="danger" size="icon" aria-label="Delete" onClick={() => setDeleteTarget(notice)}>
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
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
