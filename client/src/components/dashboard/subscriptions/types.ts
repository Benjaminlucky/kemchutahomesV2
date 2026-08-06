import type { BadgeTone } from "@/components/ui/Badge";

export const SUBSCRIPTION_STATUSES = [
  "pending",
  "confirmed",
  "partial_paid",
  "outright_paid",
  "inst_1_paid",
  "inst_2_paid",
  "inst_3_paid",
  "inst_4_paid",
  "inst_5_paid",
  "inst_6_paid",
  "completed",
  "allocated",
  "rejected",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// The only statuses an admin can pick directly from the inline dropdown —
// everything else (partial_paid, outright_paid, inst_N_paid, completed,
// allocated) is derived from real payments or a real plot assignment via
// the dedicated payment/allocation flows on the subscription detail page,
// and is rejected by the server if sent here (see updateSubscriptionStatus
// in subscription.controller.js).
export const EDITABLE_STATUSES: SubscriptionStatus[] = ["pending", "confirmed", "rejected"];

export const STATUS_TONE: Record<SubscriptionStatus, BadgeTone> = {
  pending: "amber",
  confirmed: "purple",
  partial_paid: "purple",
  outright_paid: "green",
  inst_1_paid: "purple",
  inst_2_paid: "purple",
  inst_3_paid: "purple",
  inst_4_paid: "purple",
  inst_5_paid: "purple",
  inst_6_paid: "purple",
  completed: "green",
  allocated: "green",
  rejected: "red",
};

// Live data can (and does) contain status values older than the current
// STATUSES enum — e.g. a pre-migration "approved" string from before the
// granular payment-status model existed. Indexing STATUS_TONE directly with
// such a value returns undefined, which Badge/TONES silently render as an
// unstyled, colorless pill. Falling back to "gray" here means an unrecognized
// status still reads clearly instead of looking broken.
export function statusTone(status: string): BadgeTone {
  return (STATUS_TONE as Record<string, BadgeTone>)[status] ?? "gray";
}

export function statusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => (w === "inst" ? "Inst" : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

export type Subscription = {
  _id: string;
  referenceNumber?: string;
  estateName: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  plotType: "Residential" | "Commercial" | "Investment";
  paymentPlan: "Outright" | "Instalment";
  numberOfPlots: number;
  totalAmount: number;
  amountPaid: number;
  status: SubscriptionStatus;
  createdAt: string;
};

export type SubscriptionListResponse = {
  subscriptions: Subscription[];
  total: number;
  page: number;
  pages: number;
};

export type SubscriptionPayment = {
  _id: string;
  amount: number;
  paidAt: string;
  method: string;
  reference?: string;
  note?: string;
  recordedBy?: string;
  confirmed: boolean;
  confirmedBy?: string;
  confirmedAt?: string | null;
};

export type SubscriptionDocument = {
  _id: string;
  type: "acknowledgement" | "invoice" | "contract" | "schedule" | "receipt" | "allocation" | "deed";
  label: string;
  generatedAt: string;
};

export type SubscriptionInstalment = {
  _id: string;
  instalmentNumber: number;
  dueDate: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string | null;
};

export type SubscriptionNote = {
  _id: string;
  content: string;
  type: "call" | "email" | "chat" | "note";
  addedBy: string;
  addedAt: string;
};

export type ReferringRealtor = {
  _id: string;
  firstName: string;
  lastName: string;
  referralCode: string;
};

export type SubscriptionDetail = Subscription & {
  instalmentMonths?: number | null;
  plotSize: string;
  surveyType: string;
  payments: SubscriptionPayment[];
  instalmentSchedule: SubscriptionInstalment[];
  notes: SubscriptionNote[];
  documents: SubscriptionDocument[];
  confirmedByAdmin?: string;
  confirmedAt?: string | null;
  plotNumber?: string;
  plotDescription?: string;
  allocationDate?: string | null;
  titleDocument?: string;
  balanceRemaining: number;
  paymentProgressPercent: number;
  isPaymentComplete: boolean;

  // Populated by getSubscriptionById — null when the subscription wasn't
  // referred by a realtor.
  realtorId?: ReferringRealtor | null;
  estateId?: string | null;

  // Personal / KYC — required by the model but previously never surfaced
  // anywhere in the admin UI despite the server always returning them.
  maritalStatus: string;
  dateOfBirth: string;
  gender: string;
  spouseFirstName?: string;
  spouseLastName?: string;
  nationality?: string;
  employerName?: string;
  residentialAddress: string;
  cityTown: string;
  lga: string;
  state: string;
  countryOfResidence?: string;

  // Next of kin
  kinFirstName: string;
  kinLastName: string;
  kinAddress: string;
  kinCity?: string;
  kinLga?: string;
  kinPhone: string;
};

export const DOC_LABELS: Record<SubscriptionDocument["type"], string> = {
  acknowledgement: "Subscription Acknowledgement",
  invoice: "Payment Invoice",
  contract: "Contract of Sale",
  schedule: "Instalment Schedule",
  receipt: "Payment Receipt",
  allocation: "Letter of Allocation",
  deed: "Deed of Assignment",
};
