"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { downloadDocument } from "@/lib/downloadDocument";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import { statusTone, statusLabel, type Lead } from "./types";

async function fetchLead(id: string): Promise<Lead> {
  const res = await dashboardFetch(`/api/buy2sell/leads/${id}`);
  if (!res.ok) throw new Error("Failed to fetch investment");
  return res.json();
}

function naira(n: number) {
  return `₦${Math.round(n || 0).toLocaleString()}`;
}

function fmtDate(d?: string | null) {
  return d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "-";
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{label}</p>
      <p className="mt-1 font-medium break-words text-gray-900">{value ?? "-"}</p>
    </div>
  );
}

export default function LeadDetailModal({ initialLead, onClose }: { initialLead: Lead | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ amount: "", method: "Bank Transfer", reference: "", note: "" });
  const [payoutForm, setPayoutForm] = useState({ actualPayout: "", payoutReference: "", method: "Bank Transfer" });
  const [notesDraft, setNotesDraft] = useState(initialLead?.notes ?? "");
  const [confirmAction, setConfirmAction] = useState<"mature" | "payout" | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Own query (not just the prop) so the modal reflects fresh data after a
  // mutation — the row data it was opened from is a snapshot from the list
  // page and won't update on its own once payments/status change here.
  const { data: lead } = useQuery({
    queryKey: ["buy2sell-lead", initialLead?._id],
    queryFn: () => fetchLead(initialLead!._id),
    initialData: initialLead ?? undefined,
    enabled: !!initialLead,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["buy2sell-leads"] });
    queryClient.invalidateQueries({ queryKey: ["buy2sell-lead", initialLead?._id] });
  }

  const recordPaymentMutation = useDashboardMutation<unknown, typeof payForm>({
    mutationFn: async (body) => {
      const res = await dashboardFetch(`/api/buy2sell/leads/${lead?._id}/record-payment`, {
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
      setToast("Payment recorded");
      setPayForm({ amount: "", method: "Bank Transfer", reference: "", note: "" });
      invalidate();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to record payment"),
  });

  const matureMutation = useDashboardMutation<unknown, void>({
    mutationFn: async () => {
      const res = await dashboardFetch(`/api/buy2sell/leads/${lead?._id}/mature`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark matured");
      return data;
    },
    onSuccess: () => {
      setError(null);
      setToast("Investment marked matured");
      setConfirmAction(null);
      invalidate();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to mark matured");
      setConfirmAction(null);
    },
  });

  const payoutMutation = useDashboardMutation<unknown, typeof payoutForm>({
    mutationFn: async (body) => {
      const res = await dashboardFetch(`/api/buy2sell/leads/${lead?._id}/process-payout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          actualPayout: body.actualPayout ? Number(body.actualPayout) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to process payout");
      return data;
    },
    onSuccess: () => {
      setError(null);
      setToast("Payout processed");
      setConfirmAction(null);
      invalidate();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to process payout");
      setConfirmAction(null);
    },
  });

  const notesMutation = useDashboardMutation<unknown, string>({
    mutationFn: async (notes) => {
      const res = await dashboardFetch(`/api/buy2sell/leads/${lead?._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save notes");
      return data;
    },
    onSuccess: () => {
      setError(null);
      setToast("Notes saved");
      invalidate();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to save notes"),
  });

  async function handleDownload(docType: "certificate" | "agreement" | "payout_confirmation") {
    if (!lead) return;
    setError(null);
    setDownloading(docType);
    try {
      await downloadDocument(`/api/buy2sell/leads/${lead._id}/documents/${docType}`, `${docType}-${lead.referenceNumber || lead._id}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download document");
    } finally {
      setDownloading(null);
    }
  }

  if (!lead) return null;

  // The Certificate represents an activated investment (it's generated with
  // real investmentDate/maturityDate) — showing it before the investment has
  // actually gone active would render "Investment Date: -, Maturity Date: -".
  // The Agreement is the pre-investment terms document and is always valid.
  const isActivatedOrLater = !!lead.investmentDate;

  return (
    <Modal open={!!lead} onClose={onClose} title={`Investment — ${lead.referenceNumber || lead._id.slice(-8).toUpperCase()}`} maxWidth="max-w-3xl">
      <Toast message={toast} onClose={() => setToast(null)} />
      <div className="space-y-6">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge tone={statusTone(lead.status)}>{statusLabel(lead.status)}</Badge>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" disabled={downloading === "agreement"} onClick={() => handleDownload("agreement")}>
              {downloading === "agreement" ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Agreement
            </Button>
            {isActivatedOrLater && (
              <Button variant="secondary" size="sm" disabled={downloading === "certificate"} onClick={() => handleDownload("certificate")}>
                {downloading === "certificate" ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                Certificate
              </Button>
            )}
            {lead.status === "paid_out" && (
              <Button variant="secondary" size="sm" disabled={downloading === "payout_confirmation"} onClick={() => handleDownload("payout_confirmation")}>
                {downloading === "payout_confirmation" ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                Payout Receipt
              </Button>
            )}
          </div>
        </div>

        {/* ── Maturity progress ────────────────────────────────────────────── */}
        {isActivatedOrLater && (
          <div className="rounded-xl border border-customBlack-100 p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-bold tracking-widest text-customBlack-400 uppercase">
              <span>Maturity Progress</span>
              <span>{lead.maturityProgressPercent ?? 0}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-customPurple-50">
              <div
                className={`h-full rounded-full ${(lead.maturityProgressPercent ?? 0) === 100 ? "bg-green-500" : "bg-customPurple-500"}`}
                style={{ width: `${lead.maturityProgressPercent ?? 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-customBlack-500">
              {lead.status === "active" && lead.daysRemaining != null
                ? `${lead.daysRemaining} day${lead.daysRemaining === 1 ? "" : "s"} remaining until maturity`
                : lead.status === "matured" || lead.status === "paid_out"
                  ? "Matured"
                  : null}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <InfoRow label="Investor" value={lead.fullName} />
          <InfoRow label="Email" value={lead.email} />
          <InfoRow label="Phone" value={lead.phone} />
          <InfoRow label="Duration" value={lead.duration} />
          <InfoRow label="ROI Rate" value={`${lead.roiPercent}% locked`} />
          <InfoRow label="Principal" value={naira(lead.principalAmount)} />
          <InfoRow label="Amount Paid" value={naira(lead.amountPaid)} />
          <InfoRow label="Balance Outstanding" value={naira(lead.balanceOutstanding ?? Math.max(0, lead.principalAmount - lead.amountPaid))} />
          <InfoRow label="Expected ROI" value={naira(lead.expectedROI)} />
          <InfoRow label="Expected Payout" value={naira(lead.expectedPayout)} />
          <InfoRow label="Investment Date" value={fmtDate(lead.investmentDate)} />
          <InfoRow label="Maturity Date" value={fmtDate(lead.maturityDate)} />
          {lead.status === "paid_out" && <InfoRow label="Actual Payout" value={naira(lead.actualPayout)} />}
        </div>

        {/* ── Applicant / KYC details — server always returned this, the UI
            never rendered it ─────────────────────────────────────────────── */}
        <div>
          <h4 className="mb-2 text-sm font-bold tracking-widest text-customBlack-400 uppercase">Applicant Details</h4>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <InfoRow label="Date of Birth" value={fmtDate(lead.dateOfBirth)} />
            <InfoRow label="Gender" value={lead.gender} />
            <InfoRow label="Nationality" value={lead.nationality} />
            <InfoRow label="ID Type" value={lead.idType} />
            <InfoRow label="ID Number" value={lead.idNumber} />
            <InfoRow
              label="Address"
              value={[lead.address, lead.city, lead.state].filter(Boolean).join(", ") || undefined}
            />
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-bold tracking-widest text-customBlack-400 uppercase">Payment History</h4>
          {lead.payments.length === 0 ? (
            <p className="text-sm text-customBlack-400">No payments recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {lead.payments.map((p) => (
                <div key={p._id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 text-sm">
                  <div>
                    <span className="font-bold">{naira(p.amount)}</span>{" "}
                    <span className="text-customBlack-400">· {p.type === "payout" ? "Payout" : "Principal"} · {p.method}</span>
                  </div>
                  <span className="text-xs text-customBlack-400">{fmtDate(p.paidAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {(lead.status === "pending" || lead.status === "partial_paid") && (
          <div className="rounded-xl border border-customBlack-100 p-4">
            <h4 className="mb-3 text-sm font-bold text-customBlack-900">Record Payment</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField label="Amount">
                <input type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} className={textInputClass()} />
              </FormField>
              <FormField label="Method">
                <input value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })} className={textInputClass()} />
              </FormField>
              <FormField label="Reference (optional)">
                <input value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} className={textInputClass()} />
              </FormField>
              <FormField label="Note (optional)">
                <input value={payForm.note} onChange={(e) => setPayForm({ ...payForm, note: e.target.value })} className={textInputClass()} />
              </FormField>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                loading={recordPaymentMutation.isPending}
                disabled={!payForm.amount || Number(payForm.amount) <= 0}
                onClick={() => recordPaymentMutation.mutate(payForm)}
              >
                Record Payment
              </Button>
            </div>
          </div>
        )}

        {lead.status === "active" && (
          <div className="flex items-center justify-between rounded-xl border border-customBlack-100 p-4">
            <p className="text-sm text-customBlack-600">Mark this investment as matured once its term is complete.</p>
            <Button size="sm" onClick={() => setConfirmAction("mature")}>
              Mark Matured
            </Button>
          </div>
        )}

        {lead.status === "matured" && (
          <div className="rounded-xl border border-customBlack-100 p-4">
            <h4 className="mb-3 text-sm font-bold text-customBlack-900">Process Payout</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField label={`Actual Payout (defaults to ${naira(lead.expectedPayout)})`}>
                <input
                  type="number"
                  value={payoutForm.actualPayout}
                  onChange={(e) => setPayoutForm({ ...payoutForm, actualPayout: e.target.value })}
                  className={textInputClass()}
                />
              </FormField>
              <FormField label="Payout Reference">
                <input
                  value={payoutForm.payoutReference}
                  onChange={(e) => setPayoutForm({ ...payoutForm, payoutReference: e.target.value })}
                  className={textInputClass()}
                />
              </FormField>
            </div>
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={() => setConfirmAction("payout")}>
                Process Payout
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-customBlack-100 p-4">
          <h4 className="mb-3 text-sm font-bold text-customBlack-900">Internal Notes</h4>
          <textarea
            rows={3}
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            placeholder="Add an internal note about this investor…"
            className={textInputClass()}
          />
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              loading={notesMutation.isPending}
              disabled={notesDraft === (lead.notes ?? "")}
              onClick={() => notesMutation.mutate(notesDraft)}
            >
              Save Notes
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === "mature"}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => matureMutation.mutate()}
        title="Mark Investment Matured?"
        description={
          <>
            This immediately emails and texts <span className="font-semibold text-gray-800">{lead.fullName}</span>{" "}
            that their investment has matured and a payout of{" "}
            <span className="font-semibold text-gray-800">{naira(lead.expectedPayout)}</span> is being processed.
          </>
        }
        confirmLabel="Mark Matured"
        icon={CheckCircle2}
        danger={false}
        loading={matureMutation.isPending}
      />

      <ConfirmDialog
        open={confirmAction === "payout"}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => payoutMutation.mutate(payoutForm)}
        title="Process Payout?"
        description={
          <>
            This records a permanent payout of{" "}
            <span className="font-semibold text-gray-800">
              {naira(payoutForm.actualPayout ? Number(payoutForm.actualPayout) : lead.expectedPayout)}
            </span>{" "}
            to <span className="font-semibold text-gray-800">{lead.fullName}</span> and emails them a payout
            confirmation. This cannot be undone.
          </>
        }
        confirmLabel="Process Payout"
        loading={payoutMutation.isPending}
      />
    </Modal>
  );
}
