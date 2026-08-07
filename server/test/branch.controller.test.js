/**
 * test/branch.controller.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Characterization + regression tests for controllers/branch.controller.js.
 * Covers the case-insensitive :id lookup fix (getBranch/updateBranch/
 * deleteBranch now lowercase req.params.id before querying, matching how
 * branchId is always stored) and the createBranch duplicate-key race: the
 * in-code findOne pre-check isn't atomic, so two concurrent creates for the
 * same branchId can both pass it — the unique index is what actually
 * prevents the dupe, and the catch block must turn that into a clean 409
 * instead of a generic 500.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import "./setup.js";
import { mockReq, mockRes } from "./mockExpress.js";
import Branch from "../models/branch.model.js";
import {
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../controllers/branch.controller.js";

async function makeBranch(overrides = {}) {
  return Branch.create({
    branchId: "lagos",
    label: "Lagos",
    isHQ: false,
    ...overrides,
  });
}

describe("createBranch", () => {
  it("creates a branch with a lowercased branchId", async () => {
    const res = mockRes();
    await createBranch(mockReq({ body: { branchId: "PH", label: "Port Harcourt" } }), res);

    expect(res.statusCode).toBe(201);
    expect(res.body.branch.branchId).toBe("ph");
  });

  it("rejects a duplicate branchId with 409 via the findOne pre-check", async () => {
    await makeBranch({ branchId: "lagos" });

    const res = mockRes();
    await createBranch(mockReq({ body: { branchId: "lagos", label: "Lagos Again" } }), res);

    expect(res.statusCode).toBe(409);
  });

  it("still answers 409, not 500, when two concurrent creates race past the findOne pre-check", async () => {
    const resA = mockRes();
    const resB = mockRes();

    await Promise.all([
      createBranch(mockReq({ body: { branchId: "abuja", label: "Abuja" } }), resA),
      createBranch(mockReq({ body: { branchId: "abuja", label: "Abuja" } }), resB),
    ]);

    const statuses = [resA.statusCode, resB.statusCode].sort();
    expect(statuses).toEqual([201, 409]);
    expect(await Branch.countDocuments({ branchId: "abuja" })).toBe(1);
  });
});

describe("case-insensitive :id lookups", () => {
  it("getBranch finds a branch regardless of param casing", async () => {
    await makeBranch({ branchId: "lagos" });

    const res = mockRes();
    await getBranch(mockReq({ params: { id: "LAGOS" } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.branchId).toBe("lagos");
  });

  it("updateBranch finds a branch regardless of param casing", async () => {
    await makeBranch({ branchId: "lagos" });

    const res = mockRes();
    await updateBranch(
      mockReq({ params: { id: "Lagos" }, body: { label: "Lagos HQ" } }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.branch.label).toBe("Lagos HQ");
  });

  it("deleteBranch finds a non-HQ branch regardless of param casing", async () => {
    await makeBranch({ branchId: "asaba", isHQ: false });

    const res = mockRes();
    await deleteBranch(mockReq({ params: { id: "ASABA" } }), res);

    expect(res.statusCode).toBe(200);
    expect(await Branch.findOne({ branchId: "asaba" })).toBeNull();
  });
});

describe("deleteBranch", () => {
  it("refuses to delete the headquarters branch", async () => {
    await makeBranch({ branchId: "lagos", isHQ: true });

    const res = mockRes();
    await deleteBranch(mockReq({ params: { id: "lagos" } }), res);

    expect(res.statusCode).toBe(400);
    expect(await Branch.findOne({ branchId: "lagos" })).not.toBeNull();
  });
});
