import { describe, it, expect } from "vitest";
import { statusLabel } from "./types";

describe("subscriptions statusLabel", () => {
  it("title-cases plain statuses", () => {
    expect(statusLabel("pending")).toBe("Pending");
    expect(statusLabel("allocated")).toBe("Allocated");
  });

  it("capitalizes 'Inst' instead of leaving it lowercase in instalment statuses", () => {
    expect(statusLabel("inst_1_paid")).toBe("Inst 1 Paid");
    expect(statusLabel("inst_6_paid")).toBe("Inst 6 Paid");
  });

  it("title-cases every underscore-separated word", () => {
    expect(statusLabel("outright_paid")).toBe("Outright Paid");
    expect(statusLabel("partial_paid")).toBe("Partial Paid");
  });
});
