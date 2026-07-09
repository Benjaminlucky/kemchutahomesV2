// models/notification.model.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "birthday_reminder"
  realtor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Realtor",
    required: true,
  },
  targetDate: { type: Date, required: true }, // the birthday date for which this notification was created (year normalized)
  daysBefore: { type: Number, required: true }, // 7 for a 7-day reminder, 0 for same-day
  delivered: { type: Boolean, default: false },
  deliveredAt: { type: Date, default: null },
  channels: [{ type: String }], // e.g., ["email","in_app","socket"]
  metadata: { type: Object, default: {} }, // store snapshot of realtor name/email for auditing
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index(
  { type: 1, realtor: 1, targetDate: 1, daysBefore: 1 },
  { unique: true }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
