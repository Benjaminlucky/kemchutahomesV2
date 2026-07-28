import { fmtNGN, fmtDate } from "./portalFormat";
import type { SubscriptionDetail } from "./types";

export type Milestone = {
  label: string;
  detail: string;
  done: boolean;
  overdue?: boolean;
  isFinal?: boolean;
};

export function getClientMilestones(sub: SubscriptionDetail): Milestone[] {
  const isInst = sub.paymentPlan === "Instalment";
  const isConfirmed = !!sub.confirmedAt || (sub.status !== "pending" && sub.status !== "rejected");

  const milestones: Milestone[] = [
    {
      label: "Application Submitted",
      detail: `Ref: ${sub.referenceNumber} · ${fmtDate(sub.createdAt)}`,
      done: true,
    },
    {
      label: "Subscription Confirmed",
      detail: sub.confirmedAt
        ? `Confirmed on ${fmtDate(sub.confirmedAt)}`
        : isConfirmed
          ? "Confirmed — please proceed to payment"
          : "Our team will contact you within 24–48 hours",
      done: isConfirmed,
    },
  ];

  if (isInst) {
    (sub.instalmentSchedule || []).forEach((inst, i) => {
      milestones.push({
        label: i === 0 ? "Deposit Paid" : `Instalment ${i + 1} Paid`,
        detail: inst.isPaid
          ? `${fmtNGN(inst.amount)} received · ${fmtDate(inst.paidAt)}`
          : `${fmtNGN(inst.amount)} due on ${fmtDate(inst.dueDate)}`,
        done: inst.isPaid,
        overdue: !inst.isPaid && new Date(inst.dueDate) < new Date(),
      });
    });
  } else {
    const paid = sub.amountPaid || 0;
    milestones.push({
      label: sub.status === "outright_paid" ? "Full Payment Received" : "Payment",
      detail: paid > 0 ? `${fmtNGN(paid)} of ${fmtNGN(sub.totalAmount)} received` : `${fmtNGN(sub.totalAmount)} outstanding`,
      done: paid >= sub.totalAmount,
    });
  }

  milestones.push({
    label: "All Payments Complete",
    detail: ["completed", "allocated"].includes(sub.status)
      ? "Full payment received"
      : `${fmtNGN(Math.max(0, sub.totalAmount - (sub.amountPaid || 0)))} remaining`,
    done: ["completed", "allocated"].includes(sub.status),
  });

  milestones.push({
    label: "Plot Allocated",
    detail: sub.plotNumber ? `Your plot: ${sub.plotNumber}` : "Pending full payment completion",
    done: sub.status === "allocated",
    isFinal: true,
  });

  return milestones;
}
