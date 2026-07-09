import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true, trim: true },
    accountName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    sortCode: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: false }, // primary shown first in emails/PDFs
    note: { type: String, default: "" }, // e.g. "For property payments only"
  },
  { timestamps: true },
);

bankAccountSchema.index({ isPrimary: -1, createdAt: 1 });

export default mongoose.models.BankAccount ||
  mongoose.model("BankAccount", bankAccountSchema);
