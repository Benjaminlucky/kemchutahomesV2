/**
 * Unit tests for utils/dataCache.js — the generic TTL cache backing the
 * knowledge-base/ROI-settings/branches/estate-by-slug reads (PRD FR-3).
 * Pure in-memory logic, no DB needed.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getCached, invalidateCache } from "../utils/dataCache.js";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getCached", () => {
  it("calls build on a miss and returns its value", async () => {
    const build = vi.fn().mockResolvedValue("fresh-value");
    const value = await getCached("k1", 1000, build);
    expect(value).toBe("fresh-value");
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("serves the cached value on a hit within the TTL, without calling build again", async () => {
    const build = vi.fn().mockResolvedValue("v1");
    await getCached("k2", 1000, build);
    build.mockResolvedValue("v2"); // would be returned if build ran again
    const second = await getCached("k2", 1000, build);
    expect(second).toBe("v1");
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("rebuilds once the TTL has elapsed", async () => {
    const build = vi.fn().mockResolvedValueOnce("v1").mockResolvedValueOnce("v2");
    await getCached("k3", 1000, build);
    vi.advanceTimersByTime(1001);
    const second = await getCached("k3", 1000, build);
    expect(second).toBe("v2");
    expect(build).toHaveBeenCalledTimes(2);
  });

  it("caches null results (a successful lookup that found nothing) rather than treating them as a miss", async () => {
    const build = vi.fn().mockResolvedValue(null);
    await getCached("k4", 1000, build);
    const second = await getCached("k4", 1000, build);
    expect(second).toBeNull();
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("keeps independent keys independently cached", async () => {
    const buildA = vi.fn().mockResolvedValue("a");
    const buildB = vi.fn().mockResolvedValue("b");
    expect(await getCached("k5a", 1000, buildA)).toBe("a");
    expect(await getCached("k5b", 1000, buildB)).toBe("b");
    expect(await getCached("k5a", 1000, buildA)).toBe("a");
    expect(buildA).toHaveBeenCalledTimes(1);
    expect(buildB).toHaveBeenCalledTimes(1);
  });
});

describe("invalidateCache", () => {
  it("forces the next read to rebuild", async () => {
    const build = vi.fn().mockResolvedValueOnce("before").mockResolvedValueOnce("after");
    await getCached("k6", 60_000, build);
    invalidateCache("k6");
    const second = await getCached("k6", 60_000, build);
    expect(second).toBe("after");
    expect(build).toHaveBeenCalledTimes(2);
  });

  it("is a no-op for a key that was never cached", () => {
    expect(() => invalidateCache("never-cached-key")).not.toThrow();
  });
});
