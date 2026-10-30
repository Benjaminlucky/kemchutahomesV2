/**
 * utils/dbBackup.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Logical backup/restore of the whole MongoDB database, for an Atlas tier
 * with no (or too little) built-in backup. Used by scripts/backupDb.js
 * (nightly cron) and scripts/restoreDb.js (manual recovery).
 *
 * Format: one gzipped file per backup, one line per document:
 *   {"c":"<collection>","d":<document as canonical Extended JSON>}
 * Canonical EJSON keeps ObjectIds, Dates, Decimal128 etc. exact, so a restore
 * writes back the same _ids and types, and references between collections
 * still line up. Indexes aren't stored — Mongoose rebuilds them from the
 * schemas when the app restarts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import zlib from "zlib";
import { once } from "events";
import { pipeline } from "stream/promises";
import mongoose from "mongoose";
import { DateTime } from "luxon";

const { EJSON } = mongoose.mongo.BSON;

const FILE_PREFIX = "kemchuta-db-";
const FILE_SUFFIX = ".jsonl.gz";
const RESTORE_BATCH_SIZE = 500;

/** e.g. kemchuta-db-2026-10-30_0300.jsonl.gz — sorts chronologically by name. */
export function backupFileName(date = new Date()) {
  const stamp = DateTime.fromJSDate(date).setZone("Africa/Lagos").toFormat("yyyy-MM-dd_HHmm");
  return `${FILE_PREFIX}${stamp}${FILE_SUFFIX}`;
}

async function listUserCollections(db) {
  const infos = await db.listCollections({ type: "collection" }).toArray();
  return infos
    .map((c) => c.name)
    .filter((name) => !name.startsWith("system."))
    .sort();
}

/**
 * Streams every document of every collection into `filePath`. Writes to a
 * `.partial` file first and renames on success, so a crash mid-backup never
 * leaves a truncated file that looks like a good backup.
 * Returns { [collection]: documentCount }.
 */
export async function backupDatabase(db, filePath) {
  const tmpPath = `${filePath}.partial`;
  const gzip = zlib.createGzip();
  const written = pipeline(gzip, fs.createWriteStream(tmpPath));
  const counts = {};

  try {
    for (const name of await listUserCollections(db)) {
      counts[name] = 0;
      for await (const doc of db.collection(name).find()) {
        const line = `${EJSON.stringify({ c: name, d: doc }, { relaxed: false })}\n`;
        if (!gzip.write(line)) await once(gzip, "drain");
        counts[name] += 1;
      }
    }
    gzip.end();
    await written;
  } catch (err) {
    gzip.destroy(err);
    await written.catch(() => {});
    await fs.promises.rm(tmpPath, { force: true });
    throw err;
  }

  await fs.promises.rename(tmpPath, filePath);
  return counts;
}

/** Deletes all but the newest `keep` backups in `dir`. Returns deleted names. */
export async function pruneBackups(dir, keep) {
  const files = (await fs.promises.readdir(dir))
    .filter((f) => f.startsWith(FILE_PREFIX) && f.endsWith(FILE_SUFFIX))
    .sort()
    .reverse();
  const stale = files.slice(keep);
  await Promise.all(stale.map((f) => fs.promises.rm(path.join(dir, f), { force: true })));
  return stale;
}

async function* readBackup(filePath) {
  const lines = readline.createInterface({
    input: fs.createReadStream(filePath).pipe(zlib.createGunzip()),
    crlfDelay: Infinity,
  });
  for await (const line of lines) {
    if (line.trim()) yield EJSON.parse(line, { relaxed: false });
  }
}

/** Reads a backup without touching any database. Returns { [collection]: count }. */
export async function summarizeBackup(filePath) {
  const counts = {};
  for await (const { c } of readBackup(filePath)) counts[c] = (counts[c] || 0) + 1;
  return counts;
}

/**
 * Loads a backup into `db`. Refuses to write into a collection that already
 * has documents unless `drop` is set, in which case each collection in the
 * backup is dropped and replaced. Collections not in the backup are left
 * alone. Returns { [collection]: insertedCount }.
 */
export async function restoreDatabase(db, filePath, { drop = false } = {}) {
  const inBackup = Object.keys(await summarizeBackup(filePath));
  const existing = new Set(await listUserCollections(db));

  if (!drop) {
    const nonEmpty = [];
    for (const name of inBackup) {
      if (existing.has(name) && (await db.collection(name).estimatedDocumentCount()) > 0) {
        nonEmpty.push(name);
      }
    }
    if (nonEmpty.length) {
      throw new Error(
        `Refusing to restore over collections that already have data: ${nonEmpty.join(", ")}. ` +
          "Re-run with --drop to replace them.",
      );
    }
  } else {
    for (const name of inBackup) {
      if (existing.has(name)) await db.collection(name).drop();
    }
  }

  const counts = {};
  const batches = {};
  const flush = async (name) => {
    if (!batches[name]?.length) return;
    await db.collection(name).insertMany(batches[name], { ordered: false });
    counts[name] = (counts[name] || 0) + batches[name].length;
    batches[name] = [];
  };

  for await (const { c, d } of readBackup(filePath)) {
    (batches[c] ||= []).push(d);
    if (batches[c].length >= RESTORE_BATCH_SIZE) await flush(c);
  }
  for (const name of Object.keys(batches)) await flush(name);
  return counts;
}
