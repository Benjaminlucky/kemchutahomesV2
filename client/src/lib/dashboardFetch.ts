"use client";

// Every mutation made from the admin/realtor dashboard goes through cookie
// auth (PRD FR-4). protect() enforces a double-submit CSRF check on
// non-GET requests authenticated via cookie — a request missing the header
// gets a 403 regardless of how valid the session otherwise is (see
// server/middlewares/csrf.js) — so this wraps fetch() to attach it
// automatically instead of relying on every call site to remember.
function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function dashboardFetch(path: string, options: RequestInit = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers);

  if (method !== "GET" && method !== "HEAD") {
    const csrfToken = readCookie("csrf_token");
    if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
  }

  return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
}
