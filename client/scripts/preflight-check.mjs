#!/usr/bin/env node
/**
 * scripts/preflight-check.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Cutover pre-flight smoke test (PRD §4.9 Launch & Acceptance Checklist).
 * Run against a real deployment before flipping DNS at cutover — see
 * docs/CUTOVER_RUNBOOK.md. Not part of CI: it needs a live backend API
 * behind the target URL (home/estate pages fetch real estate data), so it's
 * a manual/deploy-time check rather than something that runs on every push.
 *
 * Usage:
 *   node scripts/preflight-check.mjs https://kemchutahomesltd.com
 *   node scripts/preflight-check.mjs http://localhost:3000   (needs the API running)
 *
 * What it checks:
 *   - robots.txt is reachable, references the sitemap, disallows the
 *     not-yet-ported routes (dashboard/portal/api).
 *   - sitemap.xml is reachable, well-formed, and non-empty.
 *   - Each key public page returns 200 with a non-empty <title>, a
 *     canonical <link>, and at least one valid application/ld+json block.
 *   - The first estate slug found in the sitemap renders with Product
 *     JSON-LD.
 *   - An unknown estate slug returns a real HTTP 404 (PRD FR-1: no more
 *     soft-404s).
 *
 * What it deliberately does NOT check: the canonical-host redirect (that
 * needs control over the Host header against a specific deployment — see
 * the curl example in docs/CUTOVER_RUNBOOK.md) or social-preview rendering
 * (Facebook/WhatsApp debuggers are external tools, checked manually).
 *
 * IMPORTANT — run this against a genuinely fresh deployment, not a
 * long-running `next dev`/`next start` process with a warm cache: Next's
 * persistent fetch cache (.next/cache/fetch-cache) can keep serving stale
 * — but structurally valid — responses for a while after the origin API
 * has gone away, which is the correct resilience behavior per the PRD's
 * NFR ("public pages remain servable from CDN during API outages") but
 * means a warm-cache run can report a page as healthy when the live API
 * behind it is actually unreachable. If a check here looks surprising
 * (e.g. the unknown-slug 404 check passing or failing unexpectedly),
 * re-run against a fresh build/deploy with a confirmed-live API before
 * treating the result as conclusive.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const baseUrl = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

const results = []; // { name, ok, detail }

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
}

async function fetchText(path) {
  const res = await fetch(`${baseUrl}${path}`);
  const text = await res.text();
  return { res, text };
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    try {
      blocks.push(JSON.parse(match[1]));
    } catch {
      blocks.push(null); // malformed JSON-LD — caller treats null as a failure
    }
  }
  return blocks;
}

function extractTitle(html) {
  return html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
}

function extractCanonical(html) {
  return (
    html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null
  );
}

async function checkRobots() {
  try {
    const { res, text } = await fetchText("/robots.txt");
    if (!res.ok) return record("robots.txt reachable", false, `HTTP ${res.status}`);
    record("robots.txt reachable", true);

    const hasSitemap = /sitemap:/i.test(text);
    record("robots.txt references sitemap.xml", hasSitemap);

    const disallowsPrivateRoutes = ["/dashboard", "/client/portal", "/api"].every((p) =>
      text.includes(p),
    );
    record(
      "robots.txt disallows not-yet-ported routes",
      disallowsPrivateRoutes,
      disallowsPrivateRoutes ? "" : "expected /dashboard, /client/portal, /api in disallow list",
    );
  } catch (err) {
    record("robots.txt reachable", false, err.message);
  }
}

async function checkSitemap() {
  try {
    const { res, text } = await fetchText("/sitemap.xml");
    if (!res.ok) {
      record("sitemap.xml reachable", false, `HTTP ${res.status}`);
      return [];
    }
    record("sitemap.xml reachable", true);

    const urls = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    record("sitemap.xml contains at least one URL", urls.length > 0, `found ${urls.length}`);
    return urls;
  } catch (err) {
    record("sitemap.xml reachable", false, err.message);
    return [];
  }
}

async function checkPage(path, { requireJsonLd = true } = {}) {
  try {
    const { res, text } = await fetchText(path);
    if (!res.ok) {
      record(`${path} returns 200`, false, `HTTP ${res.status}`);
      return;
    }
    record(`${path} returns 200`, true);

    const title = extractTitle(text);
    record(`${path} has a non-empty <title>`, title.length > 0, title ? `"${title}"` : "");

    const canonical = extractCanonical(text);
    record(`${path} has a canonical link`, Boolean(canonical), canonical ?? "");

    if (requireJsonLd) {
      const blocks = extractJsonLdBlocks(text);
      const allValid = blocks.length > 0 && blocks.every((b) => b !== null);
      record(
        `${path} has valid JSON-LD`,
        allValid,
        blocks.length === 0 ? "no application/ld+json block found" : `${blocks.length} block(s)`,
      );
    }
  } catch (err) {
    record(`${path} returns 200`, false, err.message);
  }
}

async function checkEstateDetail(sitemapUrls) {
  const estateUrl = sitemapUrls.find((u) => u.includes("/estate/"));
  if (!estateUrl) {
    record("estate detail page has Product JSON-LD", false, "no /estate/* URL found in sitemap");
    return;
  }
  const path = new URL(estateUrl).pathname;
  try {
    const { res, text } = await fetchText(path);
    if (!res.ok) {
      record(`${path} returns 200`, false, `HTTP ${res.status}`);
      return;
    }
    record(`${path} returns 200`, true);
    const blocks = extractJsonLdBlocks(text).filter(Boolean);
    const hasProduct = blocks.some((b) => b["@type"] === "Product");
    record(`${path} has Product JSON-LD`, hasProduct);
  } catch (err) {
    record(`${path} returns 200`, false, err.message);
  }
}

async function checkUnknownSlugIs404() {
  const path = "/estate/this-slug-should-never-exist-preflight-check";
  try {
    const res = await fetch(`${baseUrl}${path}`);
    record("unknown estate slug returns HTTP 404", res.status === 404, `HTTP ${res.status}`);
  } catch (err) {
    record("unknown estate slug returns HTTP 404", false, err.message);
  }
}

async function main() {
  console.log(`Running pre-flight checks against ${baseUrl}\n`);

  await checkRobots();
  const sitemapUrls = await checkSitemap();
  for (const path of ["/", "/company", "/developments", "/contact", "/buy2sell"]) {
    await checkPage(path);
  }
  await checkPage("/faq", { requireJsonLd: false }); // only emits FAQPage JSON-LD when FAQs exist
  await checkEstateDetail(sitemapUrls);
  await checkUnknownSlugIs404();

  const failed = results.filter((r) => !r.ok);
  for (const r of results) {
    console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
  }

  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) process.exit(1);
}

main();
