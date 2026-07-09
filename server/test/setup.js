/**
 * test/setup.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared Vitest setup: spins up an in-memory MongoDB (mongodb-memory-server)
 * once per test file, connects mongoose to it, and wipes all collections
 * between tests so each test starts from a clean slate. Never touches the
 * real MONGODB_URI — these tests must be safe to run against a repo that has
 * live production credentials sitting in server/.env.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll } from "vitest";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
