import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { dashboardFetch } from "./dashboardFetch";

function setCookie(value: string) {
  Object.defineProperty(document, "cookie", { writable: true, value });
}

describe("dashboardFetch", () => {
  const originalFetch = global.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    global.fetch = vi.fn().mockResolvedValue(new Response("{}"));
    setCookie("");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
  });

  it("prefixes the path with the API base URL and always sends credentials", async () => {
    await dashboardFetch("/api/estates");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/api/estates",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("does not attach a CSRF header to GET requests", async () => {
    setCookie("csrf_token=abc123");
    await dashboardFetch("/api/estates");
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get("X-CSRF-Token")).toBeNull();
  });

  it("attaches the CSRF header from the csrf_token cookie on mutating requests", async () => {
    setCookie("csrf_token=abc123; other=1");
    await dashboardFetch("/api/estates/1", { method: "PATCH" });
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get("X-CSRF-Token")).toBe("abc123");
  });

  it("does not attach a CSRF header on mutating requests when the cookie is absent", async () => {
    setCookie("");
    await dashboardFetch("/api/estates/1", { method: "DELETE" });
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get("X-CSRF-Token")).toBeNull();
  });

  it("URL-decodes the CSRF cookie value", async () => {
    setCookie("csrf_token=abc%2F123");
    await dashboardFetch("/api/estates/1", { method: "POST" });
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get("X-CSRF-Token")).toBe("abc/123");
  });
});
