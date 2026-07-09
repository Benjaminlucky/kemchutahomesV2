# Cutover Runbook — Public Site to `client` (Next.js)

Covers PRD §4.6 (Migration Strategy) and §4.9 (Launch & Acceptance Checklist)
made concrete for this repo. This is Phase 4 of the PRD's development plan —
everything it depends on (Phases 0–3) is already built. This document is the
plan; **executing it is a deployment action and is not done by running any
script in this repo** — treat each step below as something a human runs
against the actual hosting/DNS provider.

## Where things stand

- `client` (Next.js) — code-complete for the public site: home, company,
  developments, estate detail, contact, buy2sell, FAQ. SSR/ISR, metadata,
  JSON-LD, sitemap, robots, on-demand revalidation from admin writes, error
  boundaries, canonical-host redirect (see `next.config.ts`).
- **Cookie auth (Phase 5) is already built**, ahead of this runbook's
  original assumption: `server` issues both Bearer tokens (unchanged, for
  `client-legacy`) and httpOnly cookie + CSRF-protected sessions with
  refresh-token rotation (`server/controllers/auth.controller.js`,
  `server/middlewares/authMiddleware.js`'s `extractToken`). `client` already
  has admin/realtor/client login forms wired to the cookie flow.
- `client`'s admin dashboard port (Phase 6) is **partial** — only
  `dashboard` (overview), `dashboard/estates`, and `dashboard/inspections`
  exist under `client/src/app/dashboard`. The other 11 sections
  (`ManageBankAccounts`, `ManageBuy2Sell`, `ManageContact`,
  `ManageKnowledgeBase`, `ManageRealtors`, `ManageSubscriptions`,
  `RealtorDashboard`, `Earnings`, `Recruits`, `Reports`,
  `SubscriptionProfile`) are still `client-legacy`-only.
- `client` also already has the client-portal pages (`/client/login`,
  `/client/register`, `/client/portal`, password reset) on cookie auth.
- `client-legacy` (Vite SPA) — still serves the not-yet-ported admin
  dashboard sections listed above, and remains on Bearer-token
  `localStorage` auth (`client-legacy/src/context/AuthContext.jsx`) rather
  than the new cookie flow. It is not touched by this cutover; only the
  *public* routes move to `client` here.
- `server` (Express API) — system of record for both frontends throughout.

## Architecture during the cutover window

The PRD suggests splitting traffic so the legacy SPA keeps serving the
private, not-yet-ported areas. The **subdomain split** is the simpler of the
two ways to do this — it's plain DNS, no reverse proxy to run or maintain:

```
kemchutahomesltd.com            → client (Next.js)   — public site
app.kemchutahomesltd.com        → client-legacy       — /dashboard/*, /client/portal/*, auth pages
kemchutahomes-production.up.railway.app → server       — API, unchanged, both frontends call it
```

(A path-based split at a CDN/proxy layer is the alternative if you'd rather
keep everything under one host — it needs a reverse proxy in front of both
deployments and is more infrastructure to stand up for the same result, so
this runbook assumes the subdomain split unless you tell me otherwise.)

Because both frontends call the same `server`, and `server` accepts either
credential (Bearer header or `access_token`/`refresh_token` cookies — see
`extractToken` in `authMiddleware.js`), a user who is logged into
`client-legacy` today stays logged in after this cutover on their existing
Bearer token; nothing about `client-legacy`'s auth changes in this phase.
This cutover only moves *public, unauthenticated* routes to `client` — the
dual-credential window exists to support Phase 6 (finishing the dashboard
port), not this phase.

## Pre-cutover checklist

Run through this before touching DNS. Each item should be a fact, not a
guess — confirm, don't assume.

- [ ] All Critical/High findings from PRD §3.5 (security) are closed —
      secrets rotated, `/api/admin/signup` gated, rate limits live. These
      protect both frontends equally and should already be true regardless
      of this cutover.
- [ ] CI is green on `main` (`.github/workflows/ci.yml`): server tests,
      client lint/typecheck/link-check, and — if a staging
      `NEXT_PUBLIC_API_BASE_URL` repo variable is set — the production
      build.
- [ ] `client` is deployed to its real hosting target (Vercel, or Netlify's
      Next runtime) with production environment variables set:
      `NEXT_PUBLIC_API_BASE_URL` / `API_BASE_URL` pointing at the real
      Express API, and — once you have them — `SENTRY_DSN`,
      `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_GA_ID`,
      `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- [ ] `server`'s `NEXTJS_REVALIDATE_URL` and `REVALIDATE_SECRET` env vars
      point at the deployed `client` instance and match the secret it
      expects (`client/src/app/api/revalidate/route.ts`) — otherwise admin
      estate/KB/branch edits won't invalidate the new site's cache.
- [ ] `node client/scripts/preflight-check.mjs <deployed-preview-url>`
      passes against a **fresh** deployment/build with a confirmed-live API
      behind it — not a long-running dev server. While building this
      script, running it against a stale local `next dev` (warm
      `.next/cache/fetch-cache`, no API actually reachable) produced
      passing results that weren't trustworthy: Next's fetch cache kept
      serving structurally-valid stale content even with the origin down,
      which is correct resilience behavior in production but means a
      warm-cache run can mask a real problem during this specific check.
      Redeploy or hard-restart before trusting the output.
- [ ] Google Search Console property verified for the domain (the
      verification meta tag goes out automatically once
      `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` is set — see PRD FR-6).
- [ ] `client-legacy`'s deployment is reachable at whatever host it'll keep
      serving `/dashboard/*` and `/client/portal/*` from (e.g.
      `app.kemchutahomesltd.com`), and its `VITE_API_BASE_URL` still points
      at the same `server`.

## Cutover steps

1. Confirm `client-legacy` responds correctly at `app.kemchutahomesltd.com`
   (or whatever subdomain you choose) — visit `/dashboard` and
   `/client/portal`, log in, confirm the API calls succeed.
2. Point the apex domain (`kemchutahomesltd.com`) DNS at the `client`
   (Next.js) deployment, per your host's instructions (A/ALIAS record for
   Vercel, or Netlify's custom-domain flow).
3. Once DNS propagates, re-run
   `node client/scripts/preflight-check.mjs https://kemchutahomesltd.com`
   against the live domain.
4. Confirm the canonical-host redirect actually fires in production: the
   old Netlify default host (`kemchutahomes.netlify.app`) and `www.` should
   308 to the apex (`next.config.ts` → `redirects()`).
5. Submit `https://kemchutahomesltd.com/sitemap.xml` in Google Search
   Console.
6. Spot-check social previews: paste a couple of `/estate/[slug]` URLs into
   the [Facebook Sharing
   Debugger](https://developers.facebook.com/tools/debug/) and a WhatsApp
   chat to yourself, and confirm the OG image/title/price render (PRD's
   "100% of public URLs render image + title + price" success metric).
7. Watch Search Console's coverage report daily for two weeks — this is the
   PRD's named mitigation for the "SEO transition dips rankings" risk
   (§4.8). Slugs are unchanged and the estate-redirect/tombstone system
   (`estateTombstone.model.js`) already handles renamed/removed estates, so
   there shouldn't be a wave of new 404s, but confirm it.

## Rollback

`client-legacy`'s current Netlify deployment is not modified by any of the
above — it keeps running exactly as it does today. If something is
seriously wrong after cutover:

1. Point the apex domain's DNS back at the old Netlify deployment.
2. That's it — no code or data changes need to be reverted, because none
   were made to the legacy deployment or the database.

The only thing to watch for post-rollback: if any admin edits happened
*after* cutover (new estates, price changes), those are already in
`server`'s database and the legacy SPA will reflect them correctly — it
reads from the same API.

## What this phase does not include

Per the PRD's own migration strategy, `/dashboard/*` and `/client/portal/*`
keep being served by `client-legacy` through this cutover — only the public
marketing/estate routes move to `client`. Cookie auth (Phase 5) is already
built (see above), but finishing the dashboard port (Phase 6 — the 11
remaining admin sections listed above) is a separate, larger body of work
and not part of this runbook. Once that's done, `client-legacy` and the
`app.<domain>` subdomain in this runbook's DNS split can be retired.
