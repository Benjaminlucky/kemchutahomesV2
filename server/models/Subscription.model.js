import mongoose from "mongoose";

// ── Payment record ────────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    paidAt: { type: Date, required: true },
    method: { type: String, default: "Bank Transfer" },
    reference: { type: String, default: "" },
    note: { type: String, default: "" },
    recordedBy: { type: String, default: "admin" },
    confirmed: { type: Boolean, default: false },
    confirmedBy: { type: String, default: "" },
    confirmedAt: { type: Date, default: null },
  },
  { _id: true, timestamps: true },
);

// ── Document record ───────────────────────────────────────────────────────────
const documentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, default: "" },
    generatedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

// ── Instalment schedule entry ─────────────────────────────────────────────────
const instalmentSchema = new mongoose.Schema(
  {
    instalmentNumber: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    paymentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    remindersSent: { type: Number, default: 0 },
    lastReminderAt: { type: Date, default: null },
  },
  { _id: true },
);

// ── Admin follow-up note ──────────────────────────────────────────────────────
const noteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["call", "email", "chat", "note"],
      default: "note",
    },
    addedBy: { type: String, default: "admin" },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

// ── Granular status machine ───────────────────────────────────────────────────
export const STATUSES = [
  "pending", // submitted, awaiting admin review
  "confirmed", // admin confirmed subscription with client
  "outright_paid", // outright — full payment received
  "partial_paid", // outright — partial payment (balance outstanding)
  "inst_1_paid", // instalment 1 (deposit) confirmed
  "inst_2_paid",
  "inst_3_paid",
  "inst_4_paid",
  "inst_5_paid",
  "inst_6_paid",
  "completed", // all payments received (auto-set)
  "allocated", // plot assigned, all docs issued
  "rejected",
];

// ── Main subscription schema ───────────────────────────────────────────────────
const subscriptionSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, unique: true, sparse: true },

    // Linked records
    estateName: { type: String, required: true, trim: true },
    estateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estate",
      default: null,
    },
    realtorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Realtor",
      default: null,
    },

    // Personal
    title: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    maritalStatus: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    spouseFirstName: { type: String, default: "" },
    spouseLastName: { type: String, default: "" },
    nationality: { type: String, default: "Nigerian" },
    employerName: { type: String, default: "" },

    // Contact
    residentialAddress: { type: String, required: true },
    cityTown: { type: String, required: true },
    lga: { type: String, required: true },
    state: { type: String, required: true },
    countryOfResidence: { type: String, default: "Nigeria" },
    phone: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },

    // Subscription details
    plotType: {
      type: String,
      required: true,
      enum: ["Residential", "Commercial", "Investment"],
    },
    paymentPlan: {
      type: String,
      required: true,
      enum: ["Outright", "Instalment"],
    },
    instalmentMonths: { type: Number, min: 1, max: 6, default: null }, // null for Outright
    numberOfPlots: { type: Number, required: true, min: 1 },
    plotSize: {
      type: String,
      required: true,
      enum: ["500sqm", "300sqm", "Corner Piece"],
    },
    surveyType: { type: String, required: true },
    totalAmount: { type: Number, required: true },

    // Payment tracking
    amountPaid: { type: Number, default: 0 },
    payments: { type: [paymentSchema], default: [] },
    instalmentSchedule: { type: [instalmentSchema], default: [] },

    // Admin workflow
    notes: { type: [noteSchema], default: [] },
    confirmedByAdmin: { type: String, default: "" },
    confirmedAt: { type: Date, default: null },

    // Allocation
    plotNumber: { type: String, default: "" },
    plotDescription: { type: String, default: "" }, // e.g. "Block B, Plot 14 — facing the main road"
    allocationDate: { type: Date, default: null },
    titleDocument: { type: String, default: "" },

    // Documents
    documents: { type: [documentSchema], default: [] },

    // Next of kin
    kinFirstName: { type: String, required: true },
    kinLastName: { type: String, required: true },
    kinAddress: { type: String, required: true },
    kinCity: { type: String, default: "" },
    kinLga: { type: String, default: "" },
    kinPhone: { type: String, required: true },

    status: { type: String, enum: STATUSES, default: "pending" },
  },
  { timestamps: true },
);

subscriptionSchema.index({ email: 1 });
subscriptionSchema.index({ status: 1, createdAt: -1 });
// NOTE: referenceNumber index is already created by unique:true — do not add .index({ referenceNumber: 1 })
subscriptionSchema.index({
  "instalmentSchedule.dueDate": 1,
  "instalmentSchedule.isPaid": 1,
});

subscriptionSchema.virtual("balanceRemaining").get(function () {
  return Math.max(0, this.totalAmount - this.amountPaid);
});
subscriptionSchema.virtual("paymentProgressPercent").get(function () {
  if (!this.totalAmount) return 0;
  return Math.min(100, Math.round((this.amountPaid / this.totalAmount) * 100));
});
subscriptionSchema.virtual("nextInstalmentDue").get(function () {
  return this.instalmentSchedule?.find((s) => !s.isPaid) || null;
});
subscriptionSchema.virtual("isPaymentComplete").get(function () {
  return this.amountPaid >= this.totalAmount;
});

subscriptionSchema.set("toJSON", { virtuals: true });
subscriptionSchema.set("toObject", { virtuals: true });

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);
