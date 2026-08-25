import { NextRequest, NextResponse } from "next/server";

// TEMPORARY DIAGNOSTIC ROUTE — remove once the realtor-dashboard-render bug
// is found. Reads the raw (non-redacted) server error stashed by
// onRequestError in instrumentation.ts, so it can be inspected directly
// instead of hunting through Netlify's log UI. Gated by a hardcoded,
// one-off secret (not an env var — this file is deleted before it would
// ever need rotating) so an unauthenticated prober just gets a 404.
const DEBUG_KEY = "kemchuta-dashboard-render-bug-temp-2026";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (key !== DEBUG_KEY) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const g = globalThis as unknown as { __lastRenderError?: unknown };
  return NextResponse.json({ lastRenderError: g.__lastRenderError ?? null });
}
