/**
 * utils/jobRunGuard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps a scheduled job body with an idempotency claim so it can only run
 * once per calendar day (Africa/Lagos), no matter how many worker instances
 * are running or how many times the process restarts at the scheduled
 * minute. See models/jobRun.model.js for the ledger this relies on.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { DateTime } from "luxon";
import JobRun from "../models/jobRun.model.js";
import Sentry from "./sentry.js";

const TIMEZONE = "Africa/Lagos";

/**
 * Runs `fn` only if no JobRun exists yet for (jobName, today). Returns
 * true if the job ran (regardless of whether `fn` itself threw — the run is
 * still recorded as attempted for today), false if it was skipped because
 * another process already claimed today's run.
 */
export async function runOnce(jobName, fn) {
  const runDate = DateTime.now().setZone(TIMEZONE).toFormat("yyyy-MM-dd");

  let claim;
  try {
    claim = await JobRun.create({ jobName, runDate });
  } catch (err) {
    if (err?.code === 11000) {
      console.log(`📅 Cron: ${jobName} already claimed for ${runDate}, skipping`);
      return false;
    }
    throw err;
  }

  try {
    await fn();
    await JobRun.findByIdAndUpdate(claim._id, {
      status: "completed",
      finishedAt: new Date(),
    });
  } catch (err) {
    await JobRun.findByIdAndUpdate(claim._id, {
      status: "failed",
      finishedAt: new Date(),
      error: err.message,
    });
    Sentry.captureException(err, { tags: { job: jobName, runDate } });
    throw err;
  }
  return true;
}
