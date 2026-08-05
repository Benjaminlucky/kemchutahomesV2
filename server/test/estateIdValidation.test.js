/**
 * test/estateIdValidation.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Coverage for the :id guard in estate.controller.js.
 *
 * The bug this locks down: every handler that reads req.params.id passed it
 * straight to Estate.findById(). Mongoose casts at query time, so a malformed
 * id ("not-a-valid-objectid") threw a CastError *inside* the try block, and the
 * generic catch reported it as a 500 "Failed to fetch estate". That is a server
 * error for what is plainly bad client input — it tells the caller to retry
 * something that can never succeed, and it buries genuine 500s in the logs.
 *
 * The three cases that matter are therefore: malformed id → 400, well-formed
 * id for a row that doesn't exist → 404 (unchanged), and a real id → the
 * handler's normal behaviour (also unchanged).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import "./setup.js";
import {
  getEstateById,
  updateEstate,
  deleteEstate,
  deleteGalleryImage,
  toggleEstateStatus,
} from "../controllers/estate.controller.js";
import { mockReq, mockRes } from "./mockExpress.js";
import { makeEstate } from "./fixtures.js";

// Every handler that takes an :id, with the params its route also supplies.
const HANDLERS = [
  { name: "getEstateById", fn: getEstateById, extraParams: {} },
  { name: "updateEstate", fn: updateEstate, extraParams: {} },
  { name: "deleteEstate", fn: deleteEstate, extraParams: {} },
  {
    name: "deleteGalleryImage",
    fn: deleteGalleryImage,
    extraParams: { publicId: "estates%2Fgallery%2Fanything" },
  },
  { name: "toggleEstateStatus", fn: toggleEstateStatus, extraParams: {} },
];

// Shapes a client can realistically send: a slug pasted where an id belongs,
// a hex string of the wrong length, a non-hex 24-char string, and empty-ish
// values from a template that interpolated `undefined`.
const MALFORMED_IDS = [
  "not-a-valid-objectid",
  "123",
  "zzzzzzzzzzzzzzzzzzzzzzzz",
  "oxford-heights-awoyaya",
  "undefined",
];

// Well-formed and correctly shaped, but no such document.
const ABSENT_ID = "507f1f77bcf86cd799439011";

describe("estate :id validation", () => {
  for (const { name, fn, extraParams } of HANDLERS) {
    it(`${name} answers 400, not 500, for a malformed id`, async () => {
      for (const id of MALFORMED_IDS) {
        const res = mockRes();
        await fn(mockReq({ params: { id, ...extraParams } }), res);

        expect(res.statusCode, `${name} with id "${id}"`).toBe(400);
        expect(res.body.message).toBe("Invalid estate ID");
      }
    });

    it(`${name} still answers 404 for a well-formed id that doesn't exist`, async () => {
      const res = mockRes();
      await fn(mockReq({ params: { id: ABSENT_ID, ...extraParams } }), res);

      expect(res.statusCode, name).toBe(404);
      expect(res.body.message).toBe("Estate not found");
    });
  }

  it("getEstateById still returns a real estate untouched", async () => {
    const estate = await makeEstate({ estate: "Oxford Heights" });

    const res = mockRes();
    await getEstateById(mockReq({ params: { id: String(estate._id) } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.estate).toBe("Oxford Heights");
  });

  it("toggleEstateStatus still flips a real estate", async () => {
    const estate = await makeEstate({ isActive: true });

    const res = mockRes();
    await toggleEstateStatus(mockReq({ params: { id: String(estate._id) } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.isActive).toBe(false);
  });
});
