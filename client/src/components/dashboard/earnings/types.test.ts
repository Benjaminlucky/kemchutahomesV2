import { describe, it, expect } from "vitest";
import { statusLabel } from "./types";

describe("earnings statusLabel", () => {
  it("relabels 'clawedback' as the client-facing 'Reversed'", () => {
    expect(statusLabel("clawedback")).toBe("Reversed");
  });

  it("capitalizes other statuses as-is", () => {
    expect(statusLabel("pending")).toBe("Pending");
    expect(statusLabel("approved")).toBe("Approved");
    expect(statusLabel("paid")).toBe("Paid");
  });
});
