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
