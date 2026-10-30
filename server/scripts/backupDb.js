/**
 * scripts/backupDb.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Nightly database backup, run from the DirectAdmin Cron Jobs page:
 *
 *   node scripts/backupDb.js
 *
 * Writes kemchuta-db-<date>.jsonl.gz to BACKUP_DIR (default ~/db-backups,
 * i.e. /home/kemchut1/db-backups on go54 — outside every web folder) and
 * keeps the newest BACKUP_KEEP files (default 14). Restore with
 * scripts/restoreDb.js.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import "../config/env.js";
// Must load before any other instrumented module — Sentry Node SDK requirement.
import Sentry from "../utils/sentry.js";
import fs from "fs";
import os from "os";
import path from "path";
import mongoose from "mongoose";
import { backupDatabase, backupFileName, pruneBackups } from "../utils/dbBackup.js";
import logger from "../utils/logger.js";

const dir = process.env.BACKUP_DIR || path.join(os.homedir(), "db-backups");
const keep = Number(process.env.BACKUP_KEEP) || 14;

try {
  await fs.promises.mkdir(dir, { recursive: true, mode: 0o700 });
  await mongoose.connect(process.env.MONGODB_URI);

  const filePath = path.join(dir, backupFileName());
  const startedAt = Date.now();
  const counts = await backupDatabase(mongoose.connection.db, filePath);
  const { size } = await fs.promises.stat(filePath);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(
    `💾 Backup: ${total} documents from ${Object.keys(counts).length} collections → ` +
      `${filePath} (${(size / 1024).toFixed(1)} KB, ${((Date.now() - startedAt) / 1000).toFixed(1)}s)`,
  );

  const deleted = await pruneBackups(dir, keep);
  if (deleted.length) console.log(`💾 Backup: removed ${deleted.length} old backup(s), keeping ${keep}`);
} catch (err) {
  logger.error({ err: err.message }, "Database backup failed");
  Sentry.captureException(err, { tags: { job: "db-backup" } });
  process.exitCode = 1;
} finally {
  await Sentry.flush(2000);
  await mongoose.disconnect();
}
