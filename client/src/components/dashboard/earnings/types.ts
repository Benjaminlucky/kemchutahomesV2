import type { BadgeTone } from "@/components/ui/Badge";

export const COMMISSION_STATUSES = ["pending", "approved", "paid", "clawedback"] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export const STATUS_TONE: Record<CommissionStatus, BadgeTone> = {
  pending: "amber",
  approved: "green",
  paid: "purple",
  clawedback: "red",
};

// Live data can contain a status value outside the current enum (a legacy
// record, or a future addition) — indexing STATUS_TONE directly with such a
// value returns undefined, which Badge/TONES silently render as an unstyled,
// colorless pill. Falling back to "gray" means an unrecognized status still
// reads clearly instead of looking broken.
export function statusTone(status: string): BadgeTone {
  return (STATUS_TONE as Record<string, BadgeTone>)[status] ?? "gray";
}

export function statusLabel(status: string): string {
  if (!status) return "Unknown";
  return status === "clawedback" ? "Reversed" : status[0].toUpperCase() + status.slice(1);
}

export const LEVEL_LABELS: Record<number, string> = {
  1: "Direct Sale (L1)",
  2: "Recruiter Override (L2)",
  3: "Upline Override (L3)",
  4: "Top Level (L4)",
};

export const SOURCE_TYPES = ["subscription", "buy2sell"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const SOURCE_LABELS: Record<SourceType, string> = {
  subscription: "Lands",
  buy2sell: "Buy2Sell",
};

export function sourceLabel(sourceType?: string): string {
  return (SOURCE_LABELS as Record<string, string>)[sourceType ?? ""] ?? "Lands";
}

export function naira(n: number) {
  return `₦${Math.round(n || 0).toLocaleString()}`;
}

export function fmtDate(d?: string | null) {
  return d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

export type Commission = {
  _id: string;
  sourceType?: SourceType;
  subscriptionId?: string;
  buy2sellId?: string;
  referenceNumber?: string;
  estateName?: string;
  saleLabel?: string;
  saleAmount: number;
  level: 1 | 2 | 3 | 4;
  percent: number;
  grossAmount: number;
  whtAmount: number;
  netAmount: number;
  status: CommissionStatus;
  paidAt?: string | null;
  finalAt?: string | null;
  clawbackAt?: string | null;
  clawbackReason?: string;
  notes?: string;
  createdAt: string;
};

export type CommissionTotal = {
  _id: CommissionStatus;
  totalNet: number;
  totalGross: number;
  count: number;
};

export type LevelTotal = {
  _id: 1 | 2 | 3 | 4;
  total: number;
  count: number;
};

export type MyCommissionsResponse = {
  commissions: Commission[];
  total: number;
  page: number;
  pages: number;
  totals: CommissionTotal[];
  levelTotals: LevelTotal[];
};
