import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// On-demand ISR invalidation (PRD FR-3): the Express API calls this after
// estate/branch/knowledge-base writes so cached pages refresh immediately
// instead of waiting out their revalidate window. See server/utils/revalidate.js
// for the caller side.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ message: "Invalid or missing secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tags: unknown = body?.tags;

  if (!Array.isArray(tags) || tags.length === 0 || !tags.every((t) => typeof t === "string")) {
    return NextResponse.json(
      { message: "Body must include a non-empty string array 'tags'" },
      { status: 400 },
    );
  }

  // "max" profile: purge unconditionally rather than only within some
  // configured cacheLife expiry window — this route exists precisely to
  // invalidate on demand, independent of the fetch()-level revalidate times
  // configured in lib/api.ts.
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: true, tags });
}
