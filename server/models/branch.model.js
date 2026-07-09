import mongoose from "mongoose";

const socialSchema = new mongoose.Schema(
  {
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },
  { _id: false },
);

const officeHoursSchema = new mongoose.Schema(
  {
    weekdays: { type: String, default: "Mon – Fri: 8:00am – 6:00pm" },
    saturday: { type: String, default: "Sat: 9:00am – 3:00pm" },
    sunday: { type: String, default: "Closed" },
  },
  { _id: false },
);

const branchSchema = new mongoose.Schema(
  {
    branchId: { type: String, required: true, unique: true }, // "lagos" | "asaba"
    label: { type: String, required: true }, // "Lagos"
    isHQ: { type: Boolean, default: false },
    address: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },
    mapLink: { type: String, default: "" },
    phones: { type: [String], default: [] },
    emails: { type: [String], default: [] },
    hours: { type: officeHoursSchema, default: () => ({}) },
    social: { type: socialSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// NOTE: branchId index is already created by unique:true — do not add .index({ branchId: 1 })

export default mongoose.models.Branch || mongoose.model("Branch", branchSchema);
