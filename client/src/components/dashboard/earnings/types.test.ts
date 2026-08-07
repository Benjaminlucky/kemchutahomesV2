import { describe, it, expect } from "vitest";
import { statusLabel, statusTone, sourceLabel, naira } from "./types";

describe("earnings statusLabel", () => {
  it("relabels 'clawedback' as the client-facing 'Reversed'", () => {
    expect(statusLabel("clawedback")).toBe("Reversed");
  });

  it("capitalizes other statuses as-is", () => {
    expect(statusLabel("pending")).toBe("Pending");
    expect(statusLabel("approved")).toBe("Approved");
    expect(statusLabel("paid")).toBe("Paid");
  });

  it("does not crash on an empty or missing status", () => {
    expect(statusLabel("")).toBe("Unknown");
  });
});

describe("statusTone", () => {
  it("returns the mapped tone for a known status", () => {
    expect(statusTone("approved")).toBe("green");
    expect(statusTone("clawedback")).toBe("red");
  });

  it("falls back to gray for a status outside the current enum, instead of rendering an unstyled badge", () => {
    expect(statusTone("New")).toBe("gray");
    expect(statusTone("")).toBe("gray");
  });
});

describe("sourceLabel", () => {
  it("labels subscription as Lands and buy2sell as Buy2Sell", () => {
    expect(sourceLabel("subscription")).toBe("Lands");
    expect(sourceLabel("buy2sell")).toBe("Buy2Sell");
  });

  it("defaults to Lands for a missing/legacy sourceType (pre-migration rows)", () => {
    expect(sourceLabel(undefined)).toBe("Lands");
    expect(sourceLabel("")).toBe("Lands");
  });
});

describe("naira", () => {
  it("formats a number as Naira", () => {
    expect(naira(1_500_000)).toBe("₦1,500,000");
  });

  it("does not render NaN for a null/undefined amount", () => {
    expect(naira(undefined as unknown as number)).toBe("₦0");
    expect(naira(null as unknown as number)).toBe("₦0");
  });
});
