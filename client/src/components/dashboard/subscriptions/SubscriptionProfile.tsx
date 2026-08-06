"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Shield,
  Star,
  CreditCard,
  ClipboardList,
  Unlock,
  type LucideIcon,
} from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { downloadDocument } from "@/lib/downloadDocument";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import {
  statusTone,
  statusLabel,
  DOC_LABELS,
  type SubscriptionDetail,
  type SubscriptionPayment,
} from "./types";

async function fetchSubscription(id: string): Promise<SubscriptionDetail> {
  const res = await dashboardFetch(`/api/subscriptions/${id}`);
  if (!res.ok) throw new Error("Failed to fetch subscription");
  return res.json();
}

function naira(n: number) {
  return `₦${Math.round(n || 0).toLocaleString()}`;
}

function fmtDate(d?: string | null) {
  return d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-customBlack-100 bg-white p-6 shadow-sm">
      {title && <h3 className="mb-4 text-xs font-bold tracking-widest text-customBlack-400 uppercase">{title}</h3>}
      {children}
    </div>
  );
}

function InfoStat({ label, value, tone = "text-customBlack-900" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-customBlack-50/60 px-4 py-3 text-center">
      <p className="text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">{label}</p>
      <p className={`mt-1 text-sm font-black ${tone}`}>{value}</p>
    </div>
  );
}

// ── Progress ──────────────────────────────────────────────────────────────────
function ProgressCard({ sub }: { sub: SubscriptionDetail }) {
  const pct = sub.paymentProgressPercent || 0;
  return (
    <Card>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-customBlack-400 uppercase">Payment Progress</p>
          <p className="text-3xl font-black text-customPurple-600">{pct}%</p>
        </div>
        <Badge tone={statusTone(sub.status)}>{statusLabel(sub.status)}</Badge>
      </div>
      <div className="mb-4 h-3 overflow-hidden rounded-full bg-customPurple-50">
        <div
          className={`h-full rounded-full ${pct === 100 ? "bg-green-500" : "bg-customPurple-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoStat label="Total" value={naira(sub.totalAmount)} />
        <InfoStat label="Paid" value={naira(sub.amountPaid)} tone="text-green-600" />
        <InfoStat
          label="Balance"
          value={naira(sub.balanceRemaining)}
          tone={sub.balanceRemaining > 0 ? "text-red-600" : "text-green-600"}
        />
        <InfoStat
          label="Plan"
          value={sub.paymentPlan === "Instalment" ? `${sub.instalmentMonths}mo` : "Outright"}
          tone="text-customPurple-600"
        />
      </div>
    </Card>
  );
}

// ── Milestone timeline ────────────────────────────────────────────────────────
type Milestone = {
  id: string;
  label: string;
  sub: string;
  date?: string | null;
  done: boolean;
  overdue?: boolean;
  icon: LucideIcon;
};

function getMilestones(sub: SubscriptionDetail): Milestone[] {
  const isInst = sub.paymentPlan === "Instalment";
  const isConfirmed = !!sub.confirmedAt || (sub.status !== "pending" && sub.status !== "rejected");

  const milestones: Milestone[] = [
    {
      id: "submitted",
      label: "Subscription Submitted",
      sub: `Reference: ${sub.referenceNumber}`,
      date: sub.createdAt,
      done: true,
      icon: ClipboardList,
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
    },
  ];

  if (isInst) {
    sub.instalmentSchedule.forEach((inst, i) => {
      milestones.push({
        id: `inst_${i + 1}`,
        label: i === 0 ? "Deposit Paid (30%)" : `Instalment ${i} Paid`,
        sub: inst.isPaid
          ? `${naira(inst.amount)} received on ${fmtDate(inst.paidAt)}`
          : `${naira(inst.amount)} due on ${fmtDate(inst.dueDate)}`,
        date: inst.paidAt,
        done: inst.isPaid,
        overdue: !inst.isPaid && new Date(inst.dueDate) < new Date(),
        icon: inst.isPaid ? CheckCircle : Clock,
      });
    });
  } else {
    const confirmedPayments = sub.payments.filter((p) => p.confirmed);
    // Full Outright payment lands the record on "completed" or "allocated",
    // not the older "outright_paid" status those two string checks expected
    // — comparing against isPaymentComplete (the server's own amountPaid >=
    // totalAmount check) instead means this reads correctly no matter which
    // terminal status the record actually carries.
    milestones.push({
      id: "payment",
      label: sub.isPaymentComplete
        ? "Full Payment Received"
        : confirmedPayments.length > 0
          ? "Partial Payment Received"
          : "Payment Pending",
      sub: confirmedPayments.length ? `${naira(sub.amountPaid)} of ${naira(sub.totalAmount)}` : `${naira(sub.totalAmount)} outstanding`,
      date: confirmedPayments[0]?.confirmedAt,
      done: confirmedPayments.length > 0,
      icon: confirmedPayments.length ? CreditCard : Clock,
    });
  }

  milestones.push({
    id: "completed",
    label: "Payment Completed",
    sub:
      sub.status === "completed" || sub.status === "allocated"
        ? `${naira(sub.totalAmount)} fully received`
        : `${naira(Math.max(0, sub.totalAmount - sub.amountPaid))} outstanding`,
    done: sub.status === "completed" || sub.status === "allocated",
    icon: Star,
  });

  milestones.push({
    id: "allocated",
    label: "Plot Allocated",
    sub: sub.plotNumber ? `Plot: ${sub.plotNumber}` : "Pending full payment",
    date: sub.allocationDate,
    done: sub.status === "allocated",
    icon: Shield,
  });

  return milestones;
}

function MilestoneTimeline({ sub }: { sub: SubscriptionDetail }) {
  const milestones = getMilestones(sub);
  return (
    <Card title="Journey Timeline">
      <div className="space-y-5">
        {milestones.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.id} className="flex gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  m.done ? "bg-customPurple-500" : m.overdue ? "bg-red-500" : "bg-customPurple-50"
                }`}
              >
                <Icon size={15} className={m.done || m.overdue ? "text-white" : "text-customPurple-300"} />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${m.overdue ? "text-red-600" : m.done ? "text-customBlack-900" : "text-customBlack-400"}`}>
                    {m.label}
                    {m.overdue && <span className="ml-1.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-600">OVERDUE</span>}
                  </p>
                  {m.date && <p className="shrink-0 text-[11px] text-customBlack-400">{fmtDate(m.date)}</p>}
                </div>
                <p className="text-xs text-customBlack-400">{m.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Instalment schedule ──────────────────────────────────────────────────────
function InstalmentTable({ sub }: { sub: SubscriptionDetail }) {
  if (sub.paymentPlan !== "Instalment" || !sub.instalmentSchedule?.length) return null;
  return (
    <Card title="Instalment Schedule">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Due Date</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Paid Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-customBlack-50">
            {sub.instalmentSchedule.map((inst, i) => {
              const overdue = !inst.isPaid && new Date(inst.dueDate) < new Date();
              return (
                <tr key={inst._id}>
                  <td className="py-2.5 pr-4 font-semibold text-customBlack-600">
                    {i === 0 ? "Deposit" : `Month ${i}`}
                  </td>
                  <td className={`py-2.5 pr-4 ${overdue ? "font-semibold text-red-600" : "text-customBlack-700"}`}>
                    {fmtDate(inst.dueDate)}
                    {overdue && <span className="ml-1.5 text-[10px] font-bold text-red-600">OVERDUE</span>}
                  </td>
                  <td className="py-2.5 pr-4 font-bold text-customBlack-900">{naira(inst.amount)}</td>
                  <td className="py-2.5 pr-4">
                    <Badge tone={inst.isPaid ? "green" : overdue ? "red" : "amber"}>
                      {inst.isPaid ? "Paid" : overdue ? "Overdue" : "Pending"}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-customBlack-400">{fmtDate(inst.paidAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ── Documents ─────────────────────────────────────────────────────────────────
function DocumentsPanel({ sub }: { sub: SubscriptionDetail }) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload(type: SubscriptionDetail["documents"][number]["type"], label: string) {
    setDownloading(type);
    setError(null);
    try {
      await downloadDocument(`/api/subscriptions/${sub._id}/documents/${type}`, `${label}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <Card title={`Documents (${sub.documents.length})`}>
      {error && <ErrorBanner className="mb-3">{error}</ErrorBanner>}
      {sub.documents.length === 0 ? (
        <p className="py-4 text-center text-sm text-customBlack-400">No documents generated yet.</p>
      ) : (
        <div className="space-y-2">
          {sub.documents.map((doc) => (
            <div key={doc._id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5">
              <div>
                <p className="text-sm font-bold text-customBlack-900">{doc.label || DOC_LABELS[doc.type]}</p>
                <p className="text-xs text-customBlack-400">{fmtDate(doc.generatedAt)}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={downloading === doc.type}
                onClick={() => handleDownload(doc.type, doc.label || DOC_LABELS[doc.type])}
              >
                {downloading === doc.type ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                Download
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Applicant KYC + next of kin ───────────────────────────────────────────────
// The server has always returned this data (it's required on the model),
// but the admin UI never rendered any of it — an admin verifying an
// applicant's identity or needing to reach their next of kin had nowhere to
// look on this page.
function KycField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-semibold break-words text-customBlack-900">{value || "—"}</p>
    </div>
  );
}

function ApplicantDetailsCard({ sub }: { sub: SubscriptionDetail }) {
  const spouseName = [sub.spouseFirstName, sub.spouseLastName].filter(Boolean).join(" ");
  return (
    <Card title="Applicant Details">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <KycField label="Date of Birth" value={fmtDate(sub.dateOfBirth)} />
        <KycField label="Gender" value={sub.gender} />
        <KycField label="Marital Status" value={sub.maritalStatus} />
        {spouseName && <KycField label="Spouse" value={spouseName} />}
        <KycField label="Nationality" value={sub.nationality} />
        {sub.employerName && <KycField label="Employer" value={sub.employerName} />}
      </div>
      <div className="mt-4 border-t border-customBlack-50 pt-4">
        <KycField
          label="Residential Address"
          value={[sub.residentialAddress, sub.cityTown, sub.lga, sub.state, sub.countryOfResidence]
            .filter(Boolean)
            .join(", ")}
        />
      </div>
    </Card>
  );
}

function NextOfKinCard({ sub }: { sub: SubscriptionDetail }) {
  return (
    <Card title="Next of Kin">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <KycField label="Name" value={`${sub.kinFirstName} ${sub.kinLastName}`} />
        <KycField label="Phone" value={sub.kinPhone} />
        <KycField
          label="Address"
          value={[sub.kinAddress, sub.kinCity, sub.kinLga].filter(Boolean).join(", ")}
        />
      </div>
    </Card>
  );
}

// ── Admin actions: confirm + allocate ────────────────────────────────────────
function AdminActions({ sub, onRefresh }: { sub: SubscriptionDetail; onRefresh: () => void }) {
  const [showAlloc, setShowAlloc] = useState(false);
  const [form, setForm] = useState({ plotNumber: "", plotDescription: "", titleDocument: "" });
  const [error, setError] = useState<string | null>(null);

  const confirmMutation = useDashboardMutation<unknown, void>({
    mutationFn: async () => {
      const res = await dashboardFetch(`/api/subscriptions/${sub._id}/confirm`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to confirm subscription");
      return data;
    },
    onSuccess: () => {
      setError(null);
      onRefresh();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to confirm subscription"),
  });

  const allocateMutation = useDashboardMutation<unknown, typeof form>({
    mutationFn: async (body) => {
      const res = await dashboardFetch(`/api/subscriptions/${sub._id}/allocate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to allocate plot");
      return data;
    },
    onSuccess: () => {
      setError(null);
      setShowAlloc(false);
      onRefresh();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to allocate plot"),
  });

  const canAllocate = sub.status === "completed" || sub.status === "outright_paid";

  return (
    <Card title="Admin Actions">
      <div className="space-y-3">
        {error && <ErrorBanner>{error}</ErrorBanner>}
        {sub.status === "pending" && (
          <Button
            size="sm"
            loading={confirmMutation.isPending}
            onClick={() => confirmMutation.mutate()}
            className="w-full justify-center"
          >
            <CheckCircle size={14} />
            Confirm Subscription
          </Button>
        )}

        {canAllocate && !showAlloc && (
          <Button size="sm" onClick={() => setShowAlloc(true)} className="w-full justify-center">
            <Shield size={14} />
            Allocate Plot & Issue Final Documents
          </Button>
        )}

        {canAllocate && showAlloc && (
          <div className="space-y-3 rounded-xl bg-customPurple-50/60 p-4">
            <FormField label="Plot Number *">
              <input
                value={form.plotNumber}
                onChange={(e) => setForm({ ...form, plotNumber: e.target.value })}
                placeholder="e.g. Block A, Plot 14"
                className={textInputClass()}
              />
            </FormField>
            <FormField label="Title Type">
              <input
                value={form.titleDocument}
                onChange={(e) => setForm({ ...form, titleDocument: e.target.value })}
                placeholder="C of O / Gazette…"
                className={textInputClass()}
              />
            </FormField>
            <FormField label="Plot Description (optional)">
              <textarea
                rows={2}
                value={form.plotDescription}
                onChange={(e) => setForm({ ...form, plotDescription: e.target.value })}
                placeholder="Appears on the Allocation Letter"
                className={textInputClass()}
              />
            </FormField>
            <div className="flex gap-2">
              <Button
                size="sm"
                loading={allocateMutation.isPending}
                disabled={!form.plotNumber.trim()}
                onClick={() => allocateMutation.mutate(form)}
              >
                Confirm Allocation
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowAlloc(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {sub.status === "allocated" && (
          <div className="rounded-xl bg-customPurple-50/60 p-4">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-customPurple-600" />
              <p className="text-sm font-bold text-customPurple-700">
                Plot {sub.plotNumber} allocated on {fmtDate(sub.allocationDate)}
              </p>
            </div>
            {sub.plotDescription && <p className="mt-1 ml-6 text-xs text-customBlack-500">{sub.plotDescription}</p>}
          </div>
        )}

        {sub.status !== "pending" && !canAllocate && sub.status !== "allocated" && (
          <p className="text-sm text-customBlack-400">No actions available for the current status.</p>
        )}
      </div>
    </Card>
  );
}

// ── Payments ──────────────────────────────────────────────────────────────────
function PaymentPanel({ sub, onRefresh }: { sub: SubscriptionDetail; onRefresh: () => void }) {
  const [form, setForm] = useState({ amount: "", method: "Bank Transfer", reference: "", note: "", paidAt: "" });
  const [error, setError] = useState<string | null>(null);

  const pending = sub.payments.filter((p) => !p.confirmed);

  const logMutation = useDashboardMutation<unknown, typeof form>({
    mutationFn: async (body) => {
      const res = await dashboardFetch(`/api/subscriptions/${sub._id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, amount: Number(body.amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record payment");
      return data;
    },
    onSuccess: () => {
      setError(null);
      setForm({ amount: "", method: "Bank Transfer", reference: "", note: "", paidAt: "" });
      onRefresh();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to record payment"),
  });

  const confirmMutation = useDashboardMutation<unknown, SubscriptionPayment>({
    mutationFn: async (payment) => {
      const res = await dashboardFetch(`/api/subscriptions/${sub._id}/payments/${payment._id}/confirm`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to confirm payment");
      return data;
    },
    onSuccess: () => {
      setError(null);
      onRefresh();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to confirm payment"),
  });

  return (
    <Card title="Record Payment">
      {error && <ErrorBanner className="mb-4">{error}</ErrorBanner>}
      {pending.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-xs font-bold text-amber-600">Pending Confirmation ({pending.length})</p>
          {pending.map((p) => (
            <div key={p._id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
              <div>
                <p className="text-sm font-bold text-customBlack-900">{naira(p.amount)}</p>
                <p className="text-xs text-customBlack-400">
                  {p.method} · {fmtDate(p.paidAt)} {p.reference && `· Ref: ${p.reference}`}
                </p>
              </div>
              <Button
                size="sm"
                loading={confirmMutation.isPending && confirmMutation.variables?._id === p._id}
                onClick={() => confirmMutation.mutate(p)}
              >
                <Unlock size={13} />
                Confirm & Issue Receipt
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Amount (NGN)">
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="e.g. 500000"
            className={textInputClass()}
          />
        </FormField>
        <FormField label="Date Received">
          <input
            type="date"
            value={form.paidAt}
            onChange={(e) => setForm({ ...form, paidAt: e.target.value })}
            className={textInputClass()}
          />
        </FormField>
        <FormField label="Payment Method">
          <select
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            className={textInputClass()}
          >
            {["Bank Transfer", "Cash", "POS", "Online"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Bank Reference">
          <input
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
            placeholder="Transfer reference"
            className={textInputClass()}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Internal Note">
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Optional note"
              className={textInputClass()}
            />
          </FormField>
        </div>
      </div>

      <Button
        className="mt-4 w-full justify-center"
        loading={logMutation.isPending}
        disabled={!form.amount || Number(form.amount) <= 0}
        onClick={() => logMutation.mutate(form)}
      >
        Log Incoming Payment
      </Button>
      <p className="mt-2 text-center text-xs text-customBlack-400">
        Payment is logged as pending. Use &ldquo;Confirm &amp; Issue Receipt&rdquo; to verify and notify the client.
      </p>
    </Card>
  );
}

// ── Notes ─────────────────────────────────────────────────────────────────────
function NotesPanel({ sub, onRefresh }: { sub: SubscriptionDetail; onRefresh: () => void }) {
  const [text, setText] = useState("");
  const [type, setType] = useState<"call" | "email" | "chat" | "note">("note");
  const [error, setError] = useState<string | null>(null);

  const addMutation = useDashboardMutation<unknown, void>({
    mutationFn: async () => {
      const res = await dashboardFetch(`/api/subscriptions/${sub._id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim(), type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add note");
      return data;
    },
    onSuccess: () => {
      setError(null);
      setText("");
      onRefresh();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to add note"),
  });

  const notes = [...sub.notes].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

  return (
    <Card title="Follow-up Notes">
      {error && <ErrorBanner className="mb-4">{error}</ErrorBanner>}
      <div className="mb-4 flex gap-2">
        {(["call", "email", "chat", "note"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
              type === t ? "bg-customPurple-500 text-white" : "bg-customPurple-50 text-customPurple-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Add a ${type} note…`}
        className={textInputClass()}
      />
      <Button
        size="sm"
        className="mt-2"
        loading={addMutation.isPending}
        disabled={!text.trim()}
        onClick={() => addMutation.mutate()}
      >
        Add Note
      </Button>

      <div className="mt-5 max-h-80 space-y-3 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="py-4 text-center text-sm text-customBlack-400">No notes yet.</p>
        ) : (
          notes.map((n) => (
            <div key={n._id} className="rounded-lg bg-customPurple-50/60 p-3">
              <div className="flex justify-between">
                <span className="text-[10px] font-bold tracking-widest text-customPurple-600 uppercase">{n.type}</span>
                <span className="text-[10px] text-customBlack-400">
                  {fmtDate(n.addedAt)} · {n.addedBy}
                </span>
              </div>
              <p className="mt-1 text-sm text-customBlack-700">{n.content}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SubscriptionProfile({ initial }: { initial: SubscriptionDetail | null }) {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);

  const { data: sub, error } = useQuery({
    queryKey: ["subscription", initial?._id],
    queryFn: () => fetchSubscription(initial!._id),
    initialData: initial ?? undefined,
    enabled: !!initial,
  });

  function refresh(message?: string) {
    if (message) setToast(message);
    queryClient.invalidateQueries({ queryKey: ["subscription", initial?._id] });
  }

  if (error || !sub) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-lg font-bold text-red-600">Failed to load subscription</p>
        <p className="mt-2 text-sm text-customBlack-400">
          It may not exist, or you may not have permission to view it.
        </p>
        <Link href="/dashboard/subscriptions" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-customPurple-600 hover:underline">
          <ArrowLeft size={15} />
          Back to Subscriptions
        </Link>
      </div>
    );
  }

  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;

  return (
    <div className="space-y-5 pb-10">
      <Toast message={toast} onClose={() => setToast(null)} />

      <Link href="/dashboard/subscriptions" className="inline-flex items-center gap-1.5 text-sm font-bold text-customPurple-600 hover:underline">
        <ArrowLeft size={15} />
        Back to Subscriptions
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-customPurple-900 to-customPurple-600 p-7 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-white/60 uppercase">Client Profile</p>
            <h2 className="text-2xl font-black">{fullName}</h2>
            <p className="text-sm text-white/70">{sub.estateName}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-widest text-white/60 uppercase">Reference</p>
            <p className="mb-1.5 font-mono text-base font-black">{sub.referenceNumber}</p>
            <Badge tone={statusTone(sub.status)}>{statusLabel(sub.status)}</Badge>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 border-t border-white/15 pt-4 text-sm text-white/75">
          <span className="break-all">{sub.email}</span>
          <span>{sub.phone}</span>
          <span>
            {sub.plotType} · {sub.plotSize} · ×{sub.numberOfPlots}
          </span>
          <span>Subscribed {fmtDate(sub.createdAt)}</span>
          {sub.realtorId && (
            <span>
              Referred by {sub.realtorId.firstName} {sub.realtorId.lastName} ({sub.realtorId.referralCode})
            </span>
          )}
        </div>
      </div>

      <ProgressCard sub={sub} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <MilestoneTimeline sub={sub} />
          <InstalmentTable sub={sub} />
          <DocumentsPanel sub={sub} />
          <ApplicantDetailsCard sub={sub} />
          <NextOfKinCard sub={sub} />
        </div>
        <div className="space-y-5">
          <AdminActions sub={sub} onRefresh={() => refresh("Updated")} />
          <PaymentPanel sub={sub} onRefresh={() => refresh("Payment updated")} />
          <NotesPanel sub={sub} onRefresh={() => refresh("Note added")} />
        </div>
      </div>
    </div>
  );
}
