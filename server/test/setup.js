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

// Placeholder credentials for modules that validate their env at import time
// rather than at call time (utils/cloudinary.config.js throws outright), so a
// test can import a controller without dragging in real configuration. Tests
// deliberately never load server/.env — see the note above — and `||=` keeps
// this from clobbering anything a CI environment has already set. Nothing here
// is ever used to reach a real service: no test performs an upload.
process.env.CLOUDINARY_CLOUD_NAME ||= "test-cloud";
process.env.CLOUDINARY_API_KEY ||= "test-key";
process.env.CLOUDINARY_API_SECRET ||= "test-secret";

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
