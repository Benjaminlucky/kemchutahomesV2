// models/jobRun.model.js
import mongoose from "mongoose";

// Idempotency ledger for scheduled jobs (PRD §3.6/§4.8: "job-run records
// with unique (job, date) keys before any topology change"). Whichever
// process claims the (jobName, runDate) pair first runs the job; every
// other caller — a second worker instance, or the same instance retrying
// after a crash mid-run on the same day — sees the duplicate-key error and
// skips.
const JobRunSchema = new mongoose.Schema({
  jobName: { type: String, required: true },
  runDate: { type: String, required: true }, // "YYYY-MM-DD" in Africa/Lagos
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ["running", "completed", "failed"],
    default: "running",
  },
  error: { type: String, default: null },
});

JobRunSchema.index({ jobName: 1, runDate: 1 }, { unique: true });

export default mongoose.models.JobRun ||
  mongoose.model("JobRun", JobRunSchema);
