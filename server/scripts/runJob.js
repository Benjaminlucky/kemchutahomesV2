/**
 * scripts/runJob.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-shot runner for a single scheduled job, for hosts that can't keep
 * worker.js alive (DirectAdmin/cPanel Passenger only runs web apps). Trigger
 * each job from the panel's Cron Jobs page instead, e.g.:
 *
 *   node scripts/runJob.js payment-reminders
 *
 * Uses the same runOnce() guard as worker.js, so running both (or a cron
 * that fires twice) still sends each job at most once per day.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import "../config/env.js";
// Must load before any other instrumented module — Sentry Node SDK requirement.
import Sentry from "../utils/sentry.js";
import mongoose from "mongoose";
import { jobs } from "../utils/followup.js";
import { runOnce } from "../utils/jobRunGuard.js";
import logger from "../utils/logger.js";

const jobName = process.argv[2];

if (!jobs[jobName]) {
  console.error(
    `Unknown job "${jobName ?? ""}". Available: ${Object.keys(jobs).join(", ")}`,
  );
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await runOnce(jobName, jobs[jobName]);
} catch (err) {
  logger.error({ err: err.message, job: jobName }, "Job run failed");
  Sentry.captureException(err, { tags: { job: jobName, phase: "runJob" } });
  process.exitCode = 1;
} finally {
  await Sentry.flush(2000);
  await mongoose.disconnect();
}
