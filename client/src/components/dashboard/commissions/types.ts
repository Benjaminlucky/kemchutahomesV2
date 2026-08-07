// Same Commission domain as the realtor-facing earnings page — the status
// tones/labels/level labels are identical concepts, just consumed from a
// different endpoint (admin-wide ledger vs. a realtor's own `/my` records),
// so they're re-exported rather than redefined here.
export {
  COMMISSION_STATUSES,
  STATUS_TONE,
  statusTone,
  statusLabel,
  LEVEL_LABELS,
  SOURCE_TYPES,
  SOURCE_LABELS,
  sourceLabel,
  naira,
  fmtDate,
} from "../earnings/types";
export type { CommissionStatus, SourceType } from "../earnings/types";
import type { CommissionStatus, SourceType } from "../earnings/types";

export type CommissionRealtor = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bank?: string;
  accountName?: string;
  accountNumber?: string;
};

export type AdminCommission = {
  _id: string;
  realtorId: CommissionRealtor | string | null;
  realtorName: string;
  realtorEmail: string;
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
  paidBy?: string;
  paymentRef?: string;
  finalAt?: string | null;
  clawbackAt?: string | null;
  clawbackReason?: string;
  notes?: string;
  createdAt: string;
};

export type CommissionSummary = {
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  clawedbackAmount: number;
  whtAmount: number;
};

export type AdminCommissionListResponse = {
  commissions: AdminCommission[];
  total: number;
  page: number;
  pages: number;
  summary: CommissionSummary;
};

export type CommissionTierSettings = {
  level1Percent: number;
  level2Percent: number;
  level3Percent: number;
  level4Percent: number;
  whtPercent: number;
  clawbackDays: number;
};
