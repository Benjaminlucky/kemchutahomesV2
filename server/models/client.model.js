import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // unique:true already creates the index — no .index({ email: 1 }) needed
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },

    // ── Password reset ──────────────────────────────────────────────────────
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },

    // ── Profile ─────────────────────────────────────────────────────────────
    avatar: {
      type: String,
      default:
        "https://ui-avatars.com/api/?name=Client&background=700CEB&color=fff",
    },

    role: { type: String, default: "client", enum: ["client"] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// NOTE: email index is already created by unique:true above — do NOT add
// clientSchema.index({ email: 1 }) as that causes a duplicate index warning.
clientSchema.index({ createdAt: -1 });

export default mongoose.models.Client || mongoose.model("Client", clientSchema);
