export function fmtNGN(n = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
}

export function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type StatusMeta = { label: string; color: string; bg: string; border: string };

const STATUS_META: Record<string, StatusMeta> = {
  pending: { label: "Pending", color: "#d97706", bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.25)" },
  confirmed: { label: "Confirmed", color: "#700CEB", bg: "rgba(112,12,235,0.1)", border: "rgba(112,12,235,0.25)" },
  outright_paid: { label: "Paid", color: "#059669", bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.25)" },
  partial_paid: { label: "Partial Paid", color: "#0891b2", bg: "rgba(8,145,178,0.1)", border: "rgba(8,145,178,0.25)" },
  completed: { label: "Completed", color: "#059669", bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.25)" },
  allocated: { label: "Allocated", color: "#700CEB", bg: "rgba(112,12,235,0.06)", border: "rgba(112,12,235,0.2)" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.25)" },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.25)" },
  active: { label: "Active", color: "#059669", bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.25)" },
  matured: { label: "Matured", color: "#d97706", bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.25)" },
  paid_out: { label: "Paid Out", color: "#059669", bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.25)" },
};
// inst_1_paid .. inst_6_paid all read the same visually as "in progress"
for (let i = 1; i <= 6; i++) {
  STATUS_META[`inst_${i}_paid`] = {
    label: `Instalment ${i} Paid`,
    color: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    border: "rgba(8,145,178,0.25)",
  };
}

export function getStatusMeta(status: string): StatusMeta {
  return STATUS_META[status] || { label: status, color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.25)" };
}
