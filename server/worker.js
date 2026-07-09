/**
 * worker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Standalone entry point for scheduled jobs (payment reminders, inspection
 * follow-ups, commission finalisation, Buy2Sell maturation) — PRD §3.6/§4.8:
 * "move cron out of the web process ... with idempotent job records."
 *
 * Previously node-cron ran inside index.js's web process, which meant a
 * deploy or crash at the scheduled minute silently skipped a run, and
 * scaling the API to more than one instance would duplicate every send.
 * This process now owns the scheduler exclusively; index.js no longer
 * starts it. Deploy this as its own service (e.g. a second Railway service
 * with `node worker.js` as its start command) — it does not listen on a
 * port and does not need one.
 *
 * Job runs are additionally guarded by utils/jobRunGuard.js so that even if
 * this process is accidentally scaled to more than one instance, or restarts
 * mid-run, each job still fires at most once per calendar day.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import "./config/env.js";
// Must load before any other instrumented module — Sentry Node SDK requirement.
import Sentry from "./utils/sentry.js";
import mongoose from "mongoose";
import { startScheduler } from "./utils/followup.js";

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Worker connected to MongoDB");
  } catch (err) {
    console.error("❌ Worker MongoDB connection error:", err.message);
    Sentry.captureException(err, { tags: { phase: "worker-startup" } });
    await Sentry.flush(2000);
    process.exit(1);
  }

  startScheduler();
}

start();
