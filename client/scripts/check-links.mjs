#!/usr/bin/env node
/**
 * scripts/check-links.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Static broken-link / broken-image checker (PRD FR-1: "Fix and prevent
 * broken links... a link-check step runs in CI"). This is exactly the class
 * of bug the PRD's audit found in the legacy site: every homepage hero CTA
 * linked to /oxford-awoyaya, a route that didn't exist, so every hero click
 * 404'd — and nothing caught it before it shipped.
 *
 * What it checks, statically (no server needs to be running):
 *   1. Every literal `href="/..."` in src/** resolves to either a real route
 *      (a directory under src/app with a page.tsx) or an entry in the
 *      KNOWN_PENDING_ROUTES allowlist below — routes intentionally not yet
 *      built in this app because they still live on client-legacy until
 *      Phase 5-6 of the PRD's migration plan (see robots.ts for the same
 *      list of paths this app disallows crawling for the same reason).
 *   2. Every literal `src="/assets/..."` passed to next/image resolves to a
 *      real file under public/.
 *
 * What it deliberately does NOT check: template-literal hrefs/srcs (e.g.
 * `/estate/${slug}`) or values sourced from a variable/API response — those
 * can't be verified without running data, and are covered instead by
 * generateStaticParams()/notFound() at request time.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(CLIENT_ROOT, "src");
const APP_DIR = path.join(SRC_DIR, "app");
const PUBLIC_DIR = path.join(CLIENT_ROOT, "public");

// Routes intentionally not yet built in this Next app — still served by
// client-legacy per the PRD's "migrate last" strategy (§4.6). Keep this in
// sync with the disallow list in src/app/robots.ts.
const KNOWN_PENDING_ROUTES = new Set([
  // /login and /admin/login are built (Phase 6 foundation) — removed since
  // buildRouteSet() now discovers them directly.
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin/signup",
  "/admin/forgot-password",
  "/admin/reset-password",
  // /client/login, /client/register, /client/forgot-password,
  // /client/reset-password, and /client/portal itself are built (Phase 5) —
  // removed from here since buildRouteSet() now discovers them directly.
  // The portal's inner sections below are still legacy-only.
  "/client/portal/subscriptions",
  "/client/portal/inspections",
  "/client/portal/investments",
  "/client/portal/documents",
  // /dashboard itself is built (Phase 6 foundation); its management
  // sub-pages (/dashboard/estates, /dashboard/realtors, etc.) are still
  // legacy-only and referenced only via a computed path in
  // DashboardShell.tsx, not a literal href this checker would need to
  // allowlist.
]);

function walk(dir, exts, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, exts, out);
    } else if (exts.some((ext) => entry.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

// ── Build the set of real static routes from src/app/**/page.tsx ───────────
function buildRouteSet() {
  const pageFiles = walk(APP_DIR, ["page.tsx", "page.ts"]).filter((f) =>
    /page\.tsx?$/.test(f),
  );
  const routes = new Set();
  for (const file of pageFiles) {
    const rel = path.relative(APP_DIR, path.dirname(file)).split(path.sep);
    // Dynamic segments (e.g. "[slug]") are kept as literal bracket text —
    // a literal href string can never equal that, so dynamic routes simply
    // never show up as reachable via this checker, which only inspects
    // literal hrefs in the first place (see collectReferences below).
    const segments = rel.filter((seg) => seg !== "." && !/^\(.*\)$/.test(seg));
    const routePath = "/" + segments.join("/");
    routes.add(routePath === "/." ? "/" : routePath.replace(/\/$/, "") || "/");
  }
  return routes;
}

// ── Collect literal href="/..." and src="/assets/..." references ───────────
function collectReferences() {
  const files = walk(SRC_DIR, [".tsx", ".ts"]);
  const hrefs = []; // { file, value }
  const imageSrcs = [];

  const hrefPattern = /href=(?:"([^"{}]+)"|'([^'{}]+)')/g;
  const srcPattern = /\bsrc=(?:"(\/assets\/[^"{}]+)"|'(\/assets\/[^'{}]+)')/g;

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const match of content.matchAll(hrefPattern)) {
      const value = match[1] ?? match[2];
      if (value.startsWith("/")) hrefs.push({ file, value });
    }
    for (const match of content.matchAll(srcPattern)) {
      const value = match[1] ?? match[2];
      imageSrcs.push({ file, value });
    }
  }
  return { hrefs, imageSrcs };
}

function stripQueryAndHash(p) {
  return p.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
}

function main() {
  const routes = buildRouteSet();
  const { hrefs, imageSrcs } = collectReferences();
  const problems = [];

  for (const { file, value } of hrefs) {
    const clean = stripQueryAndHash(value);
    if (routes.has(clean) || KNOWN_PENDING_ROUTES.has(clean)) continue;
    problems.push(
      `Broken internal link: "${value}" in ${path.relative(CLIENT_ROOT, file)} — no matching route under src/app and not in KNOWN_PENDING_ROUTES`,
    );
  }

  for (const { file, value } of imageSrcs) {
    const assetPath = path.join(PUBLIC_DIR, value.replace(/^\/assets/, "assets"));
    if (existsSync(assetPath)) continue;
    problems.push(
      `Missing image asset: "${value}" in ${path.relative(CLIENT_ROOT, file)} — no file at public${value}`,
    );
  }

  if (problems.length > 0) {
    console.error(`✗ ${problems.length} problem(s) found:\n`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  console.log(
    `✓ Checked ${hrefs.length} internal link(s) and ${imageSrcs.length} static image reference(s) — all resolve.`,
  );
}

main();
