import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },

  // RBAC — defaults preserve today's behavior for existing documents
  // (role:"admin", status:"active" with no permissions restriction, since
  // hasPermission() short-circuits for role:"superadmin" only). Only the
  // invite flow and the superadmin seed script explicitly set
  // status:"pending".
  role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
  permissions: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["pending", "active", "suspended"],
    default: "active",
  },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },

  // ✅ Password reset fields — also reused for the account-setup flow
  // (invite → set-first-password), just with a longer expiry.
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },

  // Brute-force lockout (see utils/loginLockout.js)
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
});

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
