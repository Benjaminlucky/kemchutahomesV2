"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { FormField, textInputClass } from "@/components/client-auth/FormField";
import { useDashboardMutation } from "@/lib/useDashboardMutation";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { naira } from "./types";

export default function MarkPaidModal({
  commissionIds,
  totalNet,
  onClose,
  onSuccess,
}: {
  commissionIds: string[];
  totalNet: number;
  onClose: () => void;
  onSuccess: (message?: string) => void;
}) {
  const [paymentRef, setPaymentRef] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isBatch = commissionIds.length > 1;

  const mutation = useDashboardMutation<{ message?: string }, void>({
    mutationFn: async () => {
      const res = isBatch
        ? await dashboardFetch("/api/commissions/pay-batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: commissionIds, paymentRef: paymentRef.trim() || undefined }),
          })
        : await dashboardFetch(`/api/commissions/${commissionIds[0]}/pay`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentRef: paymentRef.trim() || undefined,
              note: note.trim() || undefined,
            }),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark as paid");
      return data;
    },
    onSuccess: (data) => {
      onSuccess(data.message);
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to mark as paid"),
  });

  return (
    <Modal open onClose={onClose} title={isBatch ? `Pay ${commissionIds.length} Commissions` : "Mark Commission Paid"} maxWidth="max-w-md">
      <p className="mb-5 text-sm text-customBlack-500">
        Confirms a payout of <span className="font-bold text-customBlack-900">{naira(totalNet)}</span> across{" "}
        {commissionIds.length} commission{commissionIds.length !== 1 ? "s" : ""}. This only records that the transfer
        happened — it doesn&rsquo;t move any money.
      </p>

      <div className="space-y-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <FormField label="Payment reference (optional)">
          <input
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            placeholder="Bank transfer reference"
            className={textInputClass()}
          />
        </FormField>

        {!isBatch && (
          <FormField label="Note (optional)">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal note"
              className={textInputClass()}
            />
          </FormField>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1 rounded-lg" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 rounded-lg" loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Confirm Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
