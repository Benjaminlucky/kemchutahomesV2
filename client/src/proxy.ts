import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route guard for the client portal and the admin/realtor dashboard (PRD
// FR-4: "Next middleware guards /dashboard and /client/portal"). Next 16
// renamed "middleware" to "proxy" (see
// node_modules/next/dist/docs/.../16-proxy.md) — behavior is unchanged,
// just the file/export name.
//
// This only checks for the *presence* of the access_token cookie as a fast,
// optimistic gate for the common "not logged in at all" case. It
// deliberately does not verify the JWT here, nor which of the three
// principals it belongs to — that happens once, properly, server-side in
// each area's own layout (client/portal/layout via the page itself,
// dashboard/layout.tsx for admin/realtor via GET /api/auth/me), which is
// the actual security boundary.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("access_token");
  if (!hasSession) {
    const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
    // /dashboard has no way to know admin vs. realtor before a session
    // exists, so it falls back to the realtor login (the more common
    // principal); an admin landing there can navigate to /admin/login.
    const loginPath = isDashboard ? "/login" : "/client/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/client/portal/:path*", "/dashboard/:path*"],
};
