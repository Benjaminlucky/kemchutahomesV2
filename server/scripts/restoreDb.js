/**
 * scripts/restoreDb.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Restores a backup made by scripts/backupDb.js into MONGODB_URI.
 *
 *   node scripts/restoreDb.js <file>                 # dry run: shows what's inside
 *   node scripts/restoreDb.js <file> --yes           # restore into empty collections
 *   node scripts/restoreDb.js <file> --yes --drop    # REPLACE existing collections
 *
 * Nothing is written without --yes. Without --drop it refuses to touch any
 * collection that already has data. Restart the API afterwards so Mongoose
 * rebuilds the indexes on any dropped collections.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import "../config/env.js";
import mongoose from "mongoose";
import { restoreDatabase, summarizeBackup } from "../utils/dbBackup.js";

const args = process.argv.slice(2);
const filePath = args.find((a) => !a.startsWith("--"));
const confirmed = args.includes("--yes");
const drop = args.includes("--drop");

if (!filePath) {
  console.error("Usage: node scripts/restoreDb.js <backup-file> [--yes] [--drop]");
  process.exit(1);
}

// Host only — never print the credentials embedded in the URI.
const targetHost = (process.env.MONGODB_URI || "").replace(/^mongodb(\+srv)?:\/\/[^@]*@/, "").split(/[/?]/)[0];

try {
  const summary = await summarizeBackup(filePath);
  console.log(`Backup ${filePath} contains:`);
  for (const [name, count] of Object.entries(summary)) console.log(`  ${name}: ${count}`);

  if (!confirmed) {
    console.log(`\nDry run — nothing written. Target would be: ${targetHost}`);
    console.log("Re-run with --yes to restore (add --drop to replace existing data).");
  } else {
    console.log(`\nRestoring into ${targetHost}${drop ? " (dropping existing collections first)" : ""}…`);
    await mongoose.connect(process.env.MONGODB_URI);
    const counts = await restoreDatabase(mongoose.connection.db, filePath, { drop });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    console.log(`Restored ${total} documents. Restart the API so indexes are rebuilt.`);
  }
} catch (err) {
  console.error(`Restore failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
