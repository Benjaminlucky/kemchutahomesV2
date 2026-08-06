import type { BadgeTone } from "@/components/ui/Badge";

export const B2S_STATUSES = ["pending", "partial_paid", "active", "matured", "paid_out", "closed"] as const;
export type B2SStatus = (typeof B2S_STATUSES)[number];

export const STATUS_TONE: Record<B2SStatus, BadgeTone> = {
  pending: "amber",
  partial_paid: "purple",
  active: "purple",
  matured: "green",
  paid_out: "green",
  closed: "gray",
};

export function statusLabel(status: string): string {
  return status.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

// Live data can contain a status value outside the current B2S_STATUSES
// union (a hand-edited record, or a future enum addition) — indexing
// STATUS_TONE directly with such a value returns undefined, which Badge/
// TONES silently render as an unstyled, colorless pill. Falling back to
// "gray" means an unrecognized status still reads clearly.
export function statusTone(status: string): BadgeTone {
  return (STATUS_TONE as Record<string, BadgeTone>)[status] ?? "gray";
}

export type ROISettings = {
  roiPercent6Months: number;
  roiPercent12Months: number;
  roiPercent18Months: number;
  minInvestment: number;
  maxInvestment: number;
  description: string;
};

export type B2SPayment = {
  _id: string;
  amount: number;
  paidAt: string;
  method: string;
  reference?: string;
  note?: string;
  type: "principal" | "payout";
  confirmedBy?: string;
};

export type Lead = {
  _id: string;
  referenceNumber?: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  city?: string;
  state?: string;
  idType?: string;
  idNumber?: string;
  duration: "6 Months" | "12 Months" | "18 Months";
  principalAmount: number;
  amountPaid: number;
  roiPercent: number;
  expectedROI: number;
  expectedPayout: number;
  investmentDate?: string;
  maturityDate?: string;
  actualPayout: number;
  payoutDate?: string;
  payments: B2SPayment[];
  status: B2SStatus;
  notes?: string;
  createdAt: string;

  // Computed server-side (model virtuals / getAllLeads' manual .lean() copy)
  // but never previously declared on the client type, so the UI never
  // rendered any of them.
  maturityProgressPercent?: number;
  daysRemaining?: number | null;
  balanceOutstanding?: number;
};

export type LeadListResponse = {
  leads: Lead[];
  total: number;
  page: number;
  pages: number;
};
