import type { BadgeTone } from "@/components/ui/Badge";

export const COMMISSION_STATUSES = ["pending", "approved", "paid", "clawedback"] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export const STATUS_TONE: Record<CommissionStatus, BadgeTone> = {
  pending: "amber",
  approved: "green",
  paid: "purple",
  clawedback: "red",
};

export function statusLabel(status: string): string {
  return status === "clawedback" ? "Reversed" : status[0].toUpperCase() + status.slice(1);
}

export const LEVEL_LABELS: Record<number, string> = {
  1: "Direct Sale (L1)",
  2: "Recruiter Override (L2)",
  3: "Upline Override (L3)",
  4: "Top Level (L4)",
};

export type Commission = {
  _id: string;
  referenceNumber?: string;
  estateName?: string;
  saleAmount: number;
  level: 1 | 2 | 3 | 4;
  percent: number;
  grossAmount: number;
  whtAmount: number;
  netAmount: number;
  status: CommissionStatus;
  paidAt?: string | null;
  finalAt?: string | null;
  createdAt: string;
};

export type CommissionTotal = {
  _id: CommissionStatus;
  totalNet: number;
  totalGross: number;
  count: number;
};

export type MyCommissionsResponse = {
  commissions: Commission[];
  total: number;
  page: number;
  pages: number;
  totals: CommissionTotal[];
};
