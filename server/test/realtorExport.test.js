/**
 * test/realtorExport.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Coverage for exportRealtors in realtor.controller.js — the endpoint behind
 * the admin dashboard's "Export Emails / Export Phones" buttons.
 *
 * The bug this replaces: those buttons read straight off the paginated table
 * state, so an admin with 200 realtors clicked "Export Emails" and silently
 * got only the 10 rows on screen. The export must therefore be defined by the
 * *search filter*, not by the page — and it must reuse the exact filter the
 * list endpoint uses (buildRealtorSearchFilter) so the two can never drift.
 *
 * `field` is projected straight into a Mongoose .select(), so the
 * reject-anything-not-in-the-enum branch is a security test, not a UX one:
 * without it the endpoint reads arbitrary columns (passwordHash,
 * resetPasswordToken, …).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import "./setup.js";
import Realtor from "../models/realtor.model.js";
import { exportRealtors, getRealtors } from "../controllers/realtor.controller.js";
import { mockReq, mockRes } from "./mockExpress.js";
import { makeRealtor } from "./fixtures.js";

describe("exportRealtors", () => {
  it("returns every matching realtor, not just the first page", async () => {
    // Comfortably more than getRealtors' default limit of 10 — if the export
    // ever gets re-plumbed through the paginated query, this drops to 10.
    const TOTAL = 25;
    for (let i = 0; i < TOTAL; i += 1) {
      await makeRealtor({ email: `bulk-${i}@example.com` });
    }

    const res = mockRes();
    await exportRealtors(mockReq({ query: { field: "email" } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(TOTAL);
    expect(res.body.values).toHaveLength(TOTAL);
    expect(new Set(res.body.values).size).toBe(TOTAL);

    // The contrast the fix is about: the same data through the list endpoint
    // yields one page, while the export yields the whole result set.
    const listRes = mockRes();
    await getRealtors(mockReq({ query: {} }), listRes);
    expect(listRes.body.docs).toHaveLength(10);
    expect(res.body.values.length).toBeGreaterThan(listRes.body.docs.length);
  });

  it("exports the phone column when asked for it", async () => {
    await makeRealtor({ phone: "+2348011112222" });
    await makeRealtor({ phone: "+2348033334444" });

    const res = mockRes();
    await exportRealtors(mockReq({ query: { field: "phone" } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.values.sort()).toEqual(["+2348011112222", "+2348033334444"]);
  });

  it("respects the search filter, matching the list endpoint's fields", async () => {
    await makeRealtor({ firstName: "Adaeze", email: "adaeze@example.com" });
    await makeRealtor({ lastName: "Adaeze", email: "surname-match@example.com" });
    await makeRealtor({ email: "adaeze.contact@example.com" });
    await makeRealtor({ referralCode: "REF-ADAEZE-01", email: "code-match@example.com" });
    await makeRealtor({ firstName: "Chinedu", email: "unrelated@example.com" });

    const res = mockRes();
    await exportRealtors(mockReq({ query: { field: "email", search: "adaeze" } }), res);

    expect(res.statusCode).toBe(200);
    // First name, last name, email and referral code all match — case
    // insensitively — and the unrelated realtor is excluded.
    expect(res.body.total).toBe(4);
    expect(res.body.values.sort()).toEqual([
      "adaeze.contact@example.com",
      "adaeze@example.com",
      "code-match@example.com",
      "surname-match@example.com",
    ]);
    expect(res.body.values).not.toContain("unrelated@example.com");
  });

  it("treats regex metacharacters in the search as literal text", async () => {
    await makeRealtor({ firstName: "A.B", email: "literal-dot@example.com" });
    await makeRealtor({ firstName: "AXB", email: "regex-wildcard@example.com" });

    const res = mockRes();
    await exportRealtors(mockReq({ query: { field: "email", search: "A.B" } }), res);

    // An unescaped "." would also match "AXB" — escapeRegex must prevent that.
    expect(res.body.values).toEqual(["literal-dot@example.com"]);
  });

  it("rejects a field outside the export whitelist with a 400", async () => {
    await makeRealtor();

    for (const field of ["passwordHash", "resetPasswordToken", "_id"]) {
      const res = mockRes();
      await exportRealtors(mockReq({ query: { field } }), res);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/email.*phone/);
      expect(res.body.values).toBeUndefined();
    }
  });

  it("rejects a missing field with a 400 rather than exporting whole documents", async () => {
    await makeRealtor();

    const res = mockRes();
    await exportRealtors(mockReq({ query: {} }), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.values).toBeUndefined();
  });

  it("filters out realtors with a missing or blank value for the column", async () => {
    const withPhone = await makeRealtor({ phone: "+2348055556666" });
    const missing = await makeRealtor();
    const blank = await makeRealtor();
    const padded = await makeRealtor();

    // Written past the model's `required`/`trim` so the test reflects legacy
    // documents that predate those constraints — exactly the rows that used to
    // land in the clipboard as ", , ".
    await Realtor.collection.updateOne({ _id: missing._id }, { $unset: { phone: 1 } });
    await Realtor.collection.updateOne({ _id: blank._id }, { $set: { phone: "   " } });
    await Realtor.collection.updateOne(
      { _id: padded._id },
      { $set: { phone: "  +2348077778888  " } },
    );

    const res = mockRes();
    await exportRealtors(mockReq({ query: { field: "phone" } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.values.sort()).toEqual(["+2348055556666", "+2348077778888"]);
    // total counts what actually got exported, so the UI's "Copied N phones"
    // can never over-report.
    expect(res.body.total).toBe(2);
    expect(res.body.values).not.toContain(withPhone.phone.replace("+", "X"));
  });

  it("returns an empty result set rather than erroring when nothing matches", async () => {
    await makeRealtor({ firstName: "Chinedu" });

    const res = mockRes();
    await exportRealtors(
      mockReq({ query: { field: "email", search: "no-such-realtor" } }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ values: [], total: 0 });
  });
});
