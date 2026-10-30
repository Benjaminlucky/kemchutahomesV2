/**
 * test/dbBackup.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Round-trips utils/dbBackup.js against the in-memory MongoDB: a backup must
 * restore with identical _ids and BSON types (so cross-collection references
 * survive), a restore must refuse to overwrite live data unless told to, and
 * pruning must keep only the newest files.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import "./setup.js";
import {
  backupDatabase,
  backupFileName,
  pruneBackups,
  restoreDatabase,
  summarizeBackup,
} from "../utils/dbBackup.js";

const { ObjectId, Decimal128 } = mongoose.mongo;

let dir;
let db;

beforeEach(async () => {
  dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "dbbackup-"));
  db = mongoose.connection.db;
  await db.dropDatabase();
});

afterEach(async () => {
  await fs.promises.rm(dir, { recursive: true, force: true });
});

async function seed() {
  const clientId = new ObjectId();
  await db.collection("clients").insertOne({ _id: clientId, name: "Ada", joined: new Date("2026-01-02T03:04:05Z") });
  await db.collection("subscriptions").insertMany([
    { client: clientId, amount: Decimal128.fromString("1500000.50"), payments: [{ paidAt: new Date("2026-02-01") }] },
    { client: clientId, amount: Decimal128.fromString("20.00"), payments: [] },
  ]);
  return clientId;
}

describe("backupDatabase / restoreDatabase", () => {
  it("restores every document with the same _ids and BSON types", async () => {
    const clientId = await seed();
    const file = path.join(dir, backupFileName());

    const counts = await backupDatabase(db, file);
    expect(counts).toEqual({ clients: 1, subscriptions: 2 });
    expect(fs.existsSync(`${file}.partial`)).toBe(false);

    await db.dropDatabase();
    const restored = await restoreDatabase(db, file);
    expect(restored).toEqual({ clients: 1, subscriptions: 2 });

    const client = await db.collection("clients").findOne({ _id: clientId });
    expect(client.joined).toBeInstanceOf(Date);
    expect(client.joined.toISOString()).toBe("2026-01-02T03:04:05.000Z");

    const subs = await db.collection("subscriptions").find({ client: clientId }).toArray();
    expect(subs).toHaveLength(2);
    expect(subs[0].client).toBeInstanceOf(ObjectId);
    expect(subs.map((s) => s.amount.toString()).sort()).toEqual(["1500000.50", "20.00"]);
    expect(subs.find((s) => s.payments.length).payments[0].paidAt).toBeInstanceOf(Date);
  });

  it("refuses to restore over collections that already have data", async () => {
    await seed();
    const file = path.join(dir, backupFileName());
    await backupDatabase(db, file);

    await expect(restoreDatabase(db, file)).rejects.toThrow(/already have data: clients, subscriptions/);
    expect(await db.collection("clients").countDocuments()).toBe(1);
  });

  it("replaces existing data with --drop, leaving other collections alone", async () => {
    await seed();
    const file = path.join(dir, backupFileName());
    await backupDatabase(db, file);

    await db.collection("clients").insertOne({ name: "added after backup" });
    await db.collection("unrelated").insertOne({ keep: true });

    await restoreDatabase(db, file, { drop: true });
    expect(await db.collection("clients").countDocuments()).toBe(1);
    expect(await db.collection("unrelated").countDocuments()).toBe(1);
  });

  it("summarizes a backup without a database", async () => {
    await seed();
    const file = path.join(dir, backupFileName());
    await backupDatabase(db, file);
    expect(await summarizeBackup(file)).toEqual({ clients: 1, subscriptions: 2 });
  });
});

describe("pruneBackups", () => {
  it("keeps only the newest N backups and ignores other files", async () => {
    const days = ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"];
    for (const d of days) {
      await fs.promises.writeFile(path.join(dir, backupFileName(new Date(`${d}T12:00:00Z`))), "");
    }
    await fs.promises.writeFile(path.join(dir, "notes.txt"), "");

    const deleted = await pruneBackups(dir, 2);
    expect(deleted).toEqual([
      "kemchuta-db-2026-10-02_1300.jsonl.gz",
      "kemchuta-db-2026-10-01_1300.jsonl.gz",
    ]);
    expect((await fs.promises.readdir(dir)).sort()).toEqual([
      "kemchuta-db-2026-10-03_1300.jsonl.gz",
      "kemchuta-db-2026-10-04_1300.jsonl.gz",
      "notes.txt",
    ]);
  });
});
