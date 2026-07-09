/**
 * models/estateTombstone.model.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Records every slug a hard-deleted estate ever used (its live slug plus its
 * full previousSlugs rename history), so a request for that slug after
 * deletion can be told "this used to exist, redirect to /developments"
 * instead of just 404ing like a slug that never existed at all (PRD FR-1).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import mongoose from "mongoose";

const estateTombstoneSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    estateName: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.EstateTombstone ||
  mongoose.model("EstateTombstone", estateTombstoneSchema);
