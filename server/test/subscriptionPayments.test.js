/**
 * Characterization tests for the payment-confirmation and plot-allocation
 * controllers (subscription.controller.js) — the other half of the PRD's
 * named highest-risk migration area, alongside commissions (see
 * commissionCalculator.test.js). These exercise the real controller
 * functions against an in-memory MongoDB; email/SMS/PDF generation are
 * mocked out since they're unrelated side effects that would otherwise hit
 * real third-party APIs (Resend, Termii) using whatever credentials happen
 * to be in server/.env.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import "./setup.js";

vi.mock("../utils/notifications.js", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  sendSMS: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../utils/pdfGenerator.js", () => ({
  generateAcknowledgement: vi.fn().mockResolvedValue(Buffer.from("pdf")),
  generateContractOfSale: vi.fn().mockResolvedValue(Buffer.from("pdf")),
  generatePaymentInvoice: vi.fn().mockResolvedValue(Buffer.from("pdf")),
  generateInstallmentSchedule: vi.fn().mockResolvedValue(Buffer.from("pdf")),
  generateReceipt: vi.fn().mockResolvedValue(Buffer.from("pdf")),
  generateAllocationLetter: vi.fn().mockResolvedValue(Buffer.from("pdf")),
  generateDeedOfAssignment: vi.fn().mockResolvedValue(Buffer.from("pdf")),
}));

const { recordPayment, confirmPayment, allocatePlot } = await import(
  "../controllers/subscription.controller.js"
);
const { Commission } = await import("../models/Commission.model.js");
const { makeRealtor, makeSubscription } = await import("./fixtures.js");

function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

// Waits for any in-flight fire-and-forget promises inside the controller
// (email sending, doc generation, commission calculation) to settle before
// asserting — the controllers respond to the client before those finish,
// matching real production behavior.
const flush = () => new Promise((resolve) => setTimeout(resolve, 20));

// calculateCommissions is fired-and-forgotten from confirmPayment (its own
// promise chain, several sequential awaits deep), so a fixed delay is
// inherently a guess about how fast the machine running the test is. Poll
// instead of guessing: wait until the expected commission count shows up, or
// fail after a generous timeout.
async function waitForCommissionCount(subscriptionId, atLeast, timeoutMs = 2000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const count = await Commission.countDocuments({ subscriptionId });
    if (count >= atLeast) return count;
    await flush();
  }
  return Commission.countDocuments({ subscriptionId });
}

describe("confirmPayment — outright payment plan", () => {
  it("marks the subscription completed once the full amount is confirmed", async () => {
    const sub = await makeSubscription({
      paymentPlan: "Outright",
      totalAmount: 10_000_000,
    });
    const req1 = {
      params: { id: sub._id.toString() },
      body: { amount: 10_000_000 },
      user: { email: "admin@test.com" },
    };
    await recordPayment(req1, mockRes());

    const fresh = await (
      await import("../models/Subscription.model.js")
    ).default.findById(sub._id);
    const paymentId = fresh.payments[0]._id.toString();

    const res = mockRes();
    await confirmPayment(
      { params: { id: sub._id.toString(), paymentId }, user: { email: "admin@test.com" } },
      res,
    );
    await flush();

    expect(res.statusCode).toBe(200);
    expect(res.body.subscription.status).toBe("completed");
    expect(res.body.subscription.amountPaid).toBe(10_000_000);
    expect(res.body.subscription.payments[0].confirmed).toBe(true);
  });

  it("rejects confirming the same payment twice instead of double-counting amountPaid", async () => {
    const sub = await makeSubscription({
      paymentPlan: "Outright",
      totalAmount: 10_000_000,
    });
    const SubscriptionModel = (await import("../models/Subscription.model.js"))
      .default;
    await recordPayment(
      { params: { id: sub._id.toString() }, body: { amount: 5_000_000 } },
      mockRes(),
    );
    const fresh = await SubscriptionModel.findById(sub._id);
    const paymentId = fresh.payments[0]._id.toString();

    const first = mockRes();
    await confirmPayment(
      { params: { id: sub._id.toString(), paymentId }, user: {} },
      first,
    );
    await flush();
    expect(first.statusCode).toBe(200);

    const second = mockRes();
    await confirmPayment(
      { params: { id: sub._id.toString(), paymentId }, user: {} },
      second,
    );

    expect(second.statusCode).toBe(400);
    expect(second.body.message).toBe("Already confirmed.");
    const afterBoth = await SubscriptionModel.findById(sub._id);
    expect(afterBoth.amountPaid).toBe(5_000_000); // not double-counted
  });
});

describe("confirmPayment — instalment payment plan", () => {
  it("advances through inst_N_paid statuses and only reaches completed on the final instalment", async () => {
    const realtor = await makeRealtor();
    const now = new Date();
    const inMonth = (n) => new Date(now.getTime() + n * 30 * 24 * 60 * 60 * 1000);

    const sub = await makeSubscription({
      paymentPlan: "Instalment",
      instalmentMonths: 2,
      totalAmount: 10_000_000,
      realtorId: realtor._id,
      instalmentSchedule: [
        { instalmentNumber: 1, dueDate: now, amount: 3_000_000, isPaid: false },
        { instalmentNumber: 2, dueDate: inMonth(1), amount: 3_500_000, isPaid: false },
        { instalmentNumber: 3, dueDate: inMonth(2), amount: 3_500_000, isPaid: false },
      ],
    });
    const SubscriptionModel = (await import("../models/Subscription.model.js"))
      .default;

    async function payAndConfirm(amount) {
      await recordPayment(
        { params: { id: sub._id.toString() }, body: { amount } },
        mockRes(),
      );
      const fresh = await SubscriptionModel.findById(sub._id);
      const unconfirmed = fresh.payments.find((p) => !p.confirmed);
      const res = mockRes();
      await confirmPayment(
        {
          params: { id: sub._id.toString(), paymentId: unconfirmed._id.toString() },
          user: { email: "admin@test.com" },
        },
        res,
      );
      await flush();
      return res;
    }

    const afterDeposit = await payAndConfirm(3_000_000);
    expect(afterDeposit.body.subscription.status).toBe("inst_1_paid");
    expect(afterDeposit.body.subscription.instalmentSchedule[0].isPaid).toBe(true);

    // First confirmed payment with a linked realtor triggers commission calc.
    const commissionCountAfterFirstPayment = await waitForCommissionCount(
      sub._id,
      1,
    );
    expect(commissionCountAfterFirstPayment).toBeGreaterThan(0);

    const afterSecond = await payAndConfirm(3_500_000);
    expect(afterSecond.body.subscription.status).toBe("inst_2_paid");

    const afterFinal = await payAndConfirm(3_500_000);
    expect(afterFinal.body.subscription.status).toBe("completed");
    expect(
      afterFinal.body.subscription.instalmentSchedule.every((s) => s.isPaid),
    ).toBe(true);

    // Commission calc must not re-fire on subsequent payments (idempotency
    // is calculateCommissions' job, already covered directly in
    // commissionCalculator.test.js — this just confirms the trigger only
    // fires once from the payment-confirmation flow too).
    const commissionCountAtEnd = await Commission.countDocuments({
      subscriptionId: sub._id,
    });
    expect(commissionCountAtEnd).toBe(commissionCountAfterFirstPayment);
  });
});

describe("allocatePlot", () => {
  it("sets the plot number, allocation date, and status on a completed subscription", async () => {
    const sub = await makeSubscription({ status: "completed" });
    const res = mockRes();

    await allocatePlot(
      {
        params: { id: sub._id.toString() },
        body: { plotNumber: "B-14", plotDescription: "Facing the main road" },
      },
      res,
    );
    await flush();

    expect(res.statusCode).toBe(200);
    expect(res.body.subscription.status).toBe("allocated");
    expect(res.body.subscription.plotNumber).toBe("B-14");
    expect(res.body.subscription.allocationDate).toBeTruthy();
  });

  it("rejects allocation when no plot number is provided", async () => {
    const sub = await makeSubscription({ status: "completed" });
    const res = mockRes();

    await allocatePlot({ params: { id: sub._id.toString() }, body: {} }, res);

    expect(res.statusCode).toBe(400);
  });
});
