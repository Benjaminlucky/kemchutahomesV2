"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { downloadDocument } from "@/lib/downloadDocument";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import { STATUS_TONE, statusLabel, type Lead } from "./types";

async function fetchLead(id: string): Promise<Lead> {
  const res = await dashboardFetch(`/api/buy2sell/leads/${id}`);
  if (!res.ok) throw new Error("Failed to fetch investment");
  return res.json();
}

function naira(n: number) {
  return `₦${Math.round(n).toLocaleString()}`;
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{label}</p>
      <p className="mt-1 font-medium text-gray-900">{value ?? "-"}</p>
    </div>
  );
}

export default function LeadDetailModal({ initialLead, onClose }: { initialLead: Lead | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ amount: "", method: "Bank Transfer", reference: "", note: "" });
  const [payoutForm, setPayoutForm] = useState({ actualPayout: "", payoutReference: "", method: "Bank Transfer" });

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
      setToast("Payment recorded");
      setPayForm({ amount: "", method: "Bank Transfer", reference: "", note: "" });
      invalidate();
    },
  });

  const matureMutation = useDashboardMutation<unknown, void>({
    mutationFn: async () => {
      const res = await dashboardFetch(`/api/buy2sell/leads/${lead?._id}/mature`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark matured");
      return data;
    },
    onSuccess: () => { setToast("Investment marked matured"); invalidate(); },
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
    onSuccess: () => { setToast("Payout processed"); invalidate(); },
  });

  async function handleDownload(docType: "certificate" | "agreement" | "payout_confirmation") {
    if (!lead) return;
    try {
      await downloadDocument(`/api/buy2sell/leads/${lead._id}/documents/${docType}`, `${docType}-${lead.referenceNumber || lead._id}.pdf`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to download document");
    }
  }

  if (!lead) return null;

  return (
    <Modal open={!!lead} onClose={onClose} title={`Investment — ${lead.referenceNumber || lead._id.slice(-8).toUpperCase()}`} maxWidth="max-w-3xl">
      <Toast message={toast} onClose={() => setToast(null)} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge tone={STATUS_TONE[lead.status]}>{statusLabel(lead.status)}</Badge>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleDownload("certificate")}>
              <Download size={13} />
              Certificate
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleDownload("agreement")}>
              <Download size={13} />
              Agreement
            </Button>
            {lead.status === "paid_out" && (
              <Button variant="secondary" size="sm" onClick={() => handleDownload("payout_confirmation")}>
                <Download size={13} />
                Payout Receipt
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <InfoRow label="Investor" value={lead.fullName} />
          <InfoRow label="Email" value={lead.email} />
          <InfoRow label="Phone" value={lead.phone} />
          <InfoRow label="Duration" value={lead.duration} />
          <InfoRow label="ROI Rate" value={`${lead.roiPercent}% locked`} />
          <InfoRow label="Principal" value={naira(lead.principalAmount)} />
          <InfoRow label="Amount Paid" value={naira(lead.amountPaid)} />
          <InfoRow label="Expected ROI" value={naira(lead.expectedROI)} />
          <InfoRow label="Expected Payout" value={naira(lead.expectedPayout)} />
          <InfoRow label="Investment Date" value={lead.investmentDate ? new Date(lead.investmentDate).toLocaleDateString() : "-"} />
          <InfoRow label="Maturity Date" value={lead.maturityDate ? new Date(lead.maturityDate).toLocaleDateString() : "-"} />
          {lead.status === "paid_out" && <InfoRow label="Actual Payout" value={naira(lead.actualPayout)} />}
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
                  <span className="text-xs text-customBlack-400">{new Date(p.paidAt).toLocaleDateString()}</span>
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
            <Button size="sm" loading={matureMutation.isPending} onClick={() => matureMutation.mutate()}>
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
              <Button size="sm" loading={payoutMutation.isPending} onClick={() => payoutMutation.mutate(payoutForm)}>
                Process Payout
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
