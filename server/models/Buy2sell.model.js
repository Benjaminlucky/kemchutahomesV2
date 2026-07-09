import mongoose from "mongoose";

// ── ROI Settings (singleton, admin-controlled) ────────────────────────────────
const roiSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "global", unique: true },
    roiPercent6Months: { type: Number, required: true, default: 22 },
    roiPercent12Months: { type: Number, required: true, default: 48 },
    roiPercent18Months: { type: Number, required: true, default: 75 },
    minInvestment: { type: Number, default: 1000000 },
    maxInvestment: { type: Number, default: 50000000 },
    description: { type: String, default: "" },
    updatedBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

const b2sPaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    paidAt: { type: Date, required: true },
    method: { type: String, default: "Bank Transfer" },
    reference: { type: String, default: "" },
    note: { type: String, default: "" },
    type: { type: String, enum: ["principal", "payout"], default: "principal" },
    confirmedBy: { type: String, default: "" },
  },
  { _id: true, timestamps: true },
);

const b2sDocSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, default: "" },
    generatedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

// Statuses: pending → partial_paid | active → matured → paid_out | closed
export const B2S_STATUSES = [
  "pending",
  "partial_paid",
  "active",
  "matured",
  "paid_out",
  "closed",
];

const buy2SellLeadSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, unique: true, sparse: true },

    // Linked client account (if the investor registered/logged in)
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },

    // KYC
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, default: "" },
    nationality: { type: String, default: "Nigerian" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    idType: { type: String, default: "" }, // NIN | BVN | International Passport | Driver's Licence | Voter's Card
    idNumber: { type: String, default: "" }, // The ID number — no file upload required

    // Investment
    duration: {
      type: String,
      enum: ["6 Months", "12 Months", "18 Months"],
      default: "12 Months",
    },
    principalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },

    // ROI SNAPSHOTTED at submission — never changes
    roiPercent: { type: Number, required: true },

    // Set when admin approves
    expectedROI: { type: Number, default: 0 },
    expectedPayout: { type: Number, default: 0 },
    investmentDate: { type: Date, default: null },
    maturityDate: { type: Date, default: null },
    actualPayout: { type: Number, default: 0 },
    payoutDate: { type: Date, default: null },

    payments: { type: [b2sPaymentSchema], default: [] },
    documents: { type: [b2sDocSchema], default: [] },

    status: { type: String, enum: B2S_STATUSES, default: "pending" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

buy2SellLeadSchema.index({ email: 1 });
buy2SellLeadSchema.index({ status: 1, createdAt: -1 });
buy2SellLeadSchema.index({ maturityDate: 1, status: 1 });

buy2SellLeadSchema.virtual("maturityProgressPercent").get(function () {
  if (!this.investmentDate || !this.maturityDate) return 0;
  const total = new Date(this.maturityDate) - new Date(this.investmentDate);
  const elapsed = Math.min(new Date() - new Date(this.investmentDate), total);
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
});

buy2SellLeadSchema.virtual("daysRemaining").get(function () {
  if (!this.maturityDate) return null;
  return Math.max(
    0,
    Math.ceil((new Date(this.maturityDate) - new Date()) / 86400000),
  );
});

buy2SellLeadSchema.virtual("balanceOutstanding").get(function () {
  return Math.max(0, this.principalAmount - this.amountPaid);
});

buy2SellLeadSchema.set("toJSON", { virtuals: true });
buy2SellLeadSchema.set("toObject", { virtuals: true });

export const ROISettings =
  mongoose.models.ROISettings ||
  mongoose.model("ROISettings", roiSettingsSchema);

export const Buy2SellLead =
  mongoose.models.Buy2SellLead ||
  mongoose.model("Buy2SellLead", buy2SellLeadSchema);
