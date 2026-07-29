import { ImageResponse } from "next/og";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getEstateBySlug } from "@/lib/api";
import { SITE_NAME } from "@/lib/seo";

// Per-estate branded OG image (PRD FR-1: "dynamic OG image per estate
// (featured photo + name + price overlay) generated at the edge") — this is
// the highest-value SEO/sharing gap identified in the platform audit, since
// estate links are shared by the realtor network primarily via WhatsApp,
// which only ever reads the og:image tag (never the raw photo URL that used
// to be set here).
export const alt = "Kemchuta Homes estate listing";
export const size = { width: 1200, height: 630 };
// JPEG, not PNG — see the JPEG_QUALITY comment below for why.
export const contentType = "image/jpeg";

// Matches getEstateBySlug's own `next.revalidate` window (client/src/lib/api.ts)
// so this route's own cached output doesn't go stale any sooner than the data
// it's built from — without this, a route that reads a cached fetch can still
// end up re-run per-request on some hosts, which is exactly the ~8.7s cold
// path that made the very first WhatsApp crawl of a freshly-shared link time
// out (and get its "no image" result cached client-side for days/weeks,
// since WhatsApp doesn't retry). Explicit revalidate keeps warm requests
// (including WhatsApp's retry-less crawl) served from cache in well under a
// second instead of re-fetching + re-rendering every time.
export const revalidate = 3600;

// `next/og`'s ImageResponse itself only ever rasterizes to lossless PNG (see
// next/dist/compiled/@vercel/og/index.node.js: the render path is either
// `sharp(svg).png()` or `resvgJS.render().asPng()` — no JPEG/WebP option is
// exposed), and a lossless encode of real photographic detail is just
// inherently large — the unmodified route embedded the full-resolution
// Cloudinary photo and produced a ~1.0MB PNG (measured against real
// production data). WhatsApp's crawler enforces a hard og:image size cap
// (widely corroborated around 600KB) and a short, non-retrying timeout, so
// that 1MB PNG failed outright, and the ~8.7s cold-generation time (also
// measured against production) blew the timeout on top of that.
//
// Degrading the source photo (grayscale/blur) to shrink the *PNG* was the
// first fix attempted here, and it worked, but at a real cost: it strips
// color and sharpness from the one thing that actually sells the property.
// The better fix is to stop asking ImageResponse's PNG encoder to compress
// a photo at all — `sharp` is already a resolved dependency of this project
// (Next bundles it for `next/image` optimization, already working in this
// exact production deployment), so instead of returning ImageResponse's PNG
// directly, this route re-encodes it through sharp's JPEG encoder, whose
// lossy DCT compression handles photographic detail far better than PNG's
// lossless DEFLATE ever could. Verified against 8 real production estate
// photos at quality 90: 87KB–252KB (max ~58% *under* the 600KB cap), in
// full color, with no visible quality loss — vs. the grayscale+blur PNG
// route's 303KB-477KB best case, which was already washed-out and blurry.
const JPEG_QUALITY = 90;

// Still worth capping the *source* fetch to roughly the output canvas size —
// cuts fetch latency and memory for the (irrelevant to final size, but very
// relevant to staying under WhatsApp's ~5s crawl timeout) photo download,
// independent of the JPEG re-encode above.
const OG_PHOTO_TRANSFORM = "w_1200,h_630,c_fill,g_auto,q_auto,f_jpg";

function toOgTransformedUrl(url: string): string {
  const marker = "/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url; // Not a recognizable Cloudinary delivery URL — use as-is.
  const insertAt = i + marker.length;
  return `${url.slice(0, insertAt)}${OG_PHOTO_TRANSFORM}/${url.slice(insertAt)}`;
}

const PURPOSE_COLOR: Record<string, string> = {
  Residential: "#c084fc",
  Commercial: "#fb923c",
  Investment: "#34d399",
};

async function loadLocalImage(relativePath: string): Promise<string | null> {
  return readFile(join(process.cwd(), relativePath))
    .then((buf) => `data:image/png;base64,${buf.toString("base64")}`)
    .catch(() => null);
}

// Fetched and inlined as a data URI ourselves (rather than passing the
// Cloudinary URL straight to satori's `<img src>`) so a slow/unreachable
// photo host can never crash image generation for the whole route — on
// failure this just renders the gradient-only branded card instead. Capped
// with its own short timeout (independent of getEstateBySlug's 10s data
// fetch budget) so a slow Cloudinary response can't by itself push total
// generation time past what WhatsApp's crawler will wait for — better to
// fall back to the gradient-only card fast than to render a photo nobody's
// crawler sticks around to see.
const PHOTO_FETCH_TIMEOUT_MS = 4_000;

async function loadRemoteImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(toOgTransformedUrl(url), { signal: AbortSignal.timeout(PHOTO_FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const type = res.headers.get("content-type") || "image/jpeg";
    return `data:${type};base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}

// Renders the JSX tree via satori/ImageResponse (still the only way to lay
// out this card), then re-encodes its PNG output as JPEG through sharp
// before returning it — see the JPEG_QUALITY comment above. Both branches of
// this route go through this so the single `contentType` export above stays
// accurate for whichever one actually runs.
async function toJpegResponse(tree: React.ReactElement): Promise<Response> {
  const pngResponse = new ImageResponse(tree, { ...size });
  const pngBuffer = Buffer.from(await pngResponse.arrayBuffer());
  const jpegBuffer = await sharp(pngBuffer).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpegBuffer), {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": pngResponse.headers.get("cache-control") ?? "public, max-age=0, must-revalidate",
    },
  });
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const estate = await getEstateBySlug(slug).catch(() => null);
  const [logo, photo] = await Promise.all([
    loadLocalImage("public/assets/logoWhite.png"),
    estate ? loadRemoteImage(estate.img) : Promise.resolve(null),
  ]);

  if (!estate) {
    // Unknown/removed slug — same generic branded card as the sitewide
    // fallback rather than erroring the whole image route.
    return toJpegResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3F0C91 0%, #700CEB 55%, #8A2FF0 100%)",
          fontSize: 64,
          fontWeight: 900,
          color: "#fff",
        }}
      >
        {SITE_NAME}
      </div>,
    );
  }

  const purposeColor = PURPOSE_COLOR[estate.purpose] || PURPOSE_COLOR.Residential;

  return toJpegResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          // `background: undefined` (rather than the key being absent) makes
          // satori throw "Cannot read properties of undefined (reading
          // 'toString')" — the actual cause of the 500s that broke every
          // estate share thumbnail with a real photo. The conditional spread
          // keeps the key out of the object entirely when there's a photo.
          ...(!photo && { background: "linear-gradient(135deg, #3F0C91 0%, #700CEB 55%, #8A2FF0 100%)" }),
        }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element -- next/image isn't usable inside ImageResponse's satori renderer
          <img
            src={photo}
            width={size.width}
            height={size.height}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {/* Legibility gradient — same treatment as the homepage Hero overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(to top, rgba(5,0,15,0.92) 0%, rgba(5,0,15,0.55) 40%, rgba(5,0,15,0.15) 70%, rgba(5,0,15,0.35) 100%)",
          }}
        />

        {logo && (
          // eslint-disable-next-line @next/next/no-img-element -- next/image isn't usable inside ImageResponse's satori renderer
          <img
            src={logo}
            width={200}
            height={52}
            alt=""
            style={{ position: "absolute", top: 48, left: 56, objectFit: "contain" }}
          />
        )}

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            padding: "0 56px 56px",
          }}
        >
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                color: purposeColor,
                fontSize: 22,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {estate.purpose}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.75)",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {estate.location}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            {estate.estate}
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 22 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Starting from
              </div>
              {/* "NGN" rather than "₦" — the bundled OG-image font has no glyph
                  for the Naira sign, and satori falls back to fetching a
                  supplemental Google Font for it at request time, which is
                  slow and fails outright in some serverless environments
                  (this crashed the whole route with a 500 in production). */}
              <div style={{ display: "flex", fontSize: 56, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>
                NGN {estate.price}
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.6)", paddingBottom: 8 }}>
              {estate.sqm} · {estate.title}
            </div>
          </div>
        </div>
      </div>
    ),
  );
}
