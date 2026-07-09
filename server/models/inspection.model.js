import mongoose from "mongoose";

const inspectionSchema = new mongoose.Schema(
  {
    estateName: {
      type: String,
      required: [true, "Estate name is required"],
      trim: true,
    },
    estateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estate",
      default: null,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    inspectionDate: {
      type: Date,
      required: [true, "Inspection date is required"],
    },
    persons: {
      type: Number,
      required: true,
      min: [1, "At least 1 person required"],
      // Removed enum: [1, 2, 5] — BookInspectionModal now accepts any custom group size
      default: 1,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Non-unique performance indexes — these are correct, no duplicate warning
inspectionSchema.index({ inspectionDate: 1, status: 1 });
inspectionSchema.index({ email: 1 });

const Inspection = mongoose.model("Inspection", inspectionSchema);
export default Inspection;
