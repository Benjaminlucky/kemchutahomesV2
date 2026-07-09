import mongoose from "mongoose";

const RealtorSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: { type: String, required: true, trim: true },
  birthDate: { type: Date, required: true },
  state: { type: String },
  bank: { type: String },
  accountName: { type: String },
  accountNumber: { type: String },
  passwordHash: { type: String, required: true },

  avatar: {
    type: String,
    default: "https://ui-avatars.com/api/?name=Realtor",
  },

  referralCode: { type: String, required: true, unique: true },

  recruitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Realtor",
    default: null,
  },

  role: { type: String, enum: ["admin", "realtor"], default: "realtor" },

  // ✅ Password reset
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now },
});

RealtorSchema.index({ recruitedBy: 1 });

RealtorSchema.virtual("referralLink").get(function () {
  return `https://kemchutahomesltd.com/signup?ref=${this.referralCode}`;
});

RealtorSchema.virtual("recruitCount", {
  ref: "Realtor",
  localField: "_id",
  foreignField: "recruitedBy",
  count: true,
});

RealtorSchema.set("toJSON", { virtuals: true });
RealtorSchema.set("toObject", { virtuals: true });

export default mongoose.models.Realtor ||
  mongoose.model("Realtor", RealtorSchema);
