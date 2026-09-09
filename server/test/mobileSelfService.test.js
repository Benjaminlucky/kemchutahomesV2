/**
 * test/mobileSelfService.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Coverage for the realtor/client self-service + leaderboard endpoints added
 * for the mobile app (Settings screens + Leaderboard). These previously had
 * no backend route at all — the mobile screens called /api/realtors/me,
 * /api/realtors/me/bank, /api/realtors/me/password, /api/realtors/me/preferences
 * and /api/realtors/leaderboard, plus /api/clients/me and
 * /api/clients/me/password, none of which existed, so every one of those
 * screens failed with a 404 every time.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import "./setup.js";
import { mockReq, mockRes } from "./mockExpress.js";
import { makeRealtor, makeClient } from "./fixtures.js";
import { Commission } from "../models/Commission.model.js";
import Realtor from "../models/realtor.model.js";
import Client from "../models/client.model.js";
import {
  updateMyProfile,
  updateMyBank,
  changeMyPassword,
  getMyPreferences,
  updateMyPreferences,
  getLeaderboard,
} from "../controllers/realtor.controller.js";
import {
  updateMyProfile as updateMyClientProfile,
  changeMyPassword as changeMyClientPassword,
} from "../controllers/client.controller.js";

async function makeCommission(realtor, overrides = {}) {
  return Commission.create({
    realtorId: realtor._id,
    realtorName: `${realtor.firstName} ${realtor.lastName}`,
    realtorEmail: realtor.email,
    sourceType: "subscription",
    saleAmount: 1_000_000,
    level: 1,
    percent: 10,
    grossAmount: 100_000,
    whtAmount: 5_000,
    netAmount: 95_000,
    status: "approved",
    ...overrides,
  });
}

describe("realtor self-service profile", () => {
  it("updates firstName/lastName/phone/state and returns the full profile snapshot", async () => {
    const realtor = await makeRealtor({ phone: "+2348010000001" });
    const res = mockRes();

    await updateMyProfile(
      mockReq({
        user: { id: realtor._id.toString() },
        body: { firstName: "Ada", lastName: "Okafor", phone: "+2348099999999", state: "Lagos" },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe("Ada");
    expect(res.body.lastName).toBe("Okafor");
    expect(res.body.phone).toBe("+2348099999999");
    expect(res.body.state).toBe("Lagos");
    expect(String(res.body.id)).toBe(realtor._id.toString());
    // never leaks the hash
    expect(res.body.passwordHash).toBeUndefined();
  });

  it("saving bank details doesn't clobber previously-saved profile fields", async () => {
    const realtor = await makeRealtor({ state: "Abuja" });
    await updateMyProfile(
      mockReq({ user: { id: realtor._id.toString() }, body: { state: "Abuja" } }),
      mockRes(),
    );

    const res = mockRes();
    await updateMyBank(
      mockReq({
        user: { id: realtor._id.toString() },
        body: { bank: "GTBank", accountName: "Ada Okafor", accountNumber: "0123456789" },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.bank).toBe("GTBank");
    expect(res.body.state).toBe("Abuja"); // still present — this is the point of the shared snapshot
  });
});

describe("realtor change password", () => {
  it("changes the password when the current one is correct", async () => {
    const realtor = await makeRealtor({ passwordHash: await bcrypt.hash("oldpass123", 12) });
    const res = mockRes();

    await changeMyPassword(
      mockReq({
        user: { id: realtor._id.toString() },
        body: { currentPassword: "oldpass123", newPassword: "newpass456" },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    const updated = await Realtor.findById(realtor._id);
    expect(await bcrypt.compare("newpass456", updated.passwordHash)).toBe(true);
  });

  it("rejects with 401 when the current password is wrong", async () => {
    const realtor = await makeRealtor({ passwordHash: await bcrypt.hash("oldpass123", 12) });
    const res = mockRes();

    await changeMyPassword(
      mockReq({
        user: { id: realtor._id.toString() },
        body: { currentPassword: "wrong", newPassword: "newpass456" },
      }),
      res,
    );

    expect(res.statusCode).toBe(401);
    const unchanged = await Realtor.findById(realtor._id);
    expect(await bcrypt.compare("oldpass123", unchanged.passwordHash)).toBe(true);
  });
});

describe("realtor notification preferences", () => {
  it("defaults both toggles to true for a realtor who never set them", async () => {
    const realtor = await makeRealtor();
    const res = mockRes();
    await getMyPreferences(mockReq({ user: { id: realtor._id.toString() } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ pushEnabled: true, emailEnabled: true });
  });

  it("saves and returns updated preferences", async () => {
    const realtor = await makeRealtor();
    const res = mockRes();

    await updateMyPreferences(
      mockReq({
        user: { id: realtor._id.toString() },
        body: { pushEnabled: false, emailEnabled: true },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ pushEnabled: false, emailEnabled: true });

    const fetched = mockRes();
    await getMyPreferences(mockReq({ user: { id: realtor._id.toString() } }), fetched);
    expect(fetched.body).toEqual({ pushEnabled: false, emailEnabled: true });
  });
});

describe("realtor leaderboard", () => {
  it("ranks by confirmed (approved+paid) net commission, excluding pending and clawedback", async () => {
    const top = await makeRealtor({ firstName: "Top", lastName: "Earner" });
    const mid = await makeRealtor({ firstName: "Mid", lastName: "Earner" });
    const me = await makeRealtor({ firstName: "Me", lastName: "Realtor" });

    await makeCommission(top, { netAmount: 500_000, status: "paid" });
    await makeCommission(mid, { netAmount: 200_000, status: "approved" });
    await makeCommission(me, { netAmount: 50_000, status: "approved" });
    // Should not count toward anyone's total:
    await makeCommission(top, { netAmount: 999_999, status: "pending" });
    await makeCommission(mid, { netAmount: 999_999, status: "clawedback" });

    const res = mockRes();
    await getLeaderboard(mockReq({ user: { id: me._id.toString() } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.topEarners[0]).toMatchObject({
      rank: 1,
      realtorId: top._id.toString(),
      firstName: "Top",
      totalNet: 500_000,
      commissionCount: 1,
    });
    expect(res.body.topEarners[1]).toMatchObject({ realtorId: mid._id.toString(), totalNet: 200_000 });
    expect(res.body.myStats).toMatchObject({ earningsRank: 3, totalNet: 50_000, commissionCount: 1 });
  });

  it("ranks recruiters by direct downline count", async () => {
    const upline = await makeRealtor({ firstName: "Upline" });
    const me = await makeRealtor({ firstName: "Me" });
    await makeRealtor({ recruitedBy: upline._id });
    await makeRealtor({ recruitedBy: upline._id });
    await makeRealtor({ recruitedBy: me._id });

    const res = mockRes();
    await getLeaderboard(mockReq({ user: { id: me._id.toString() } }), res);

    expect(res.body.topRecruiters[0]).toMatchObject({ realtorId: upline._id.toString(), downlineCount: 2 });
    expect(res.body.myStats).toMatchObject({ recruitRank: 2, downlineCount: 1 });
  });

  it("gives a realtor with zero commissions/recruits a last-place rank instead of crashing", async () => {
    const active = await makeRealtor();
    await makeCommission(active, { netAmount: 100_000, status: "paid" });
    const inactive = await makeRealtor();

    const res = mockRes();
    await getLeaderboard(mockReq({ user: { id: inactive._id.toString() } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.myStats).toMatchObject({
      earningsRank: 2,
      totalNet: 0,
      commissionCount: 0,
      recruitRank: 1,
      downlineCount: 0,
    });
  });
});

describe("client self-service profile", () => {
  it("updates firstName/lastName/phone and never returns the password hash", async () => {
    const client = await makeClient();
    const res = mockRes();

    await updateMyClientProfile(
      mockReq({
        user: { id: client._id.toString() },
        body: { firstName: "Chinwe", lastName: "Eze", phone: "+2348088888888" },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe("Chinwe");
    expect(res.body.phone).toBe("+2348088888888");
    expect(res.body.passwordHash).toBeUndefined();
  });
});

describe("client change password", () => {
  it("changes the password when the current one is correct", async () => {
    const client = await makeClient({ passwordHash: await bcrypt.hash("oldpass123", 12) });
    const res = mockRes();

    await changeMyClientPassword(
      mockReq({
        user: { id: client._id.toString() },
        body: { currentPassword: "oldpass123", newPassword: "newpass456" },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    const updated = await Client.findById(client._id);
    expect(await bcrypt.compare("newpass456", updated.passwordHash)).toBe(true);
  });

  it("rejects with 401 when the current password is wrong", async () => {
    const client = await makeClient({ passwordHash: await bcrypt.hash("oldpass123", 12) });
    const res = mockRes();

    await changeMyClientPassword(
      mockReq({
        user: { id: client._id.toString() },
        body: { currentPassword: "wrong", newPassword: "newpass456" },
      }),
      res,
    );

    expect(res.statusCode).toBe(401);
  });
});
