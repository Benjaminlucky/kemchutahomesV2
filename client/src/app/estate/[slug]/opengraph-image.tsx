import { ImageResponse } from "next/og";
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
export const contentType = "image/png";

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
// failure this just renders the gradient-only branded card instead.
async function loadRemoteImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const type = res.headers.get("content-type") || "image/jpeg";
    return `data:${type};base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
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
    return new ImageResponse(
      (
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
        </div>
      ),
      { ...size },
    );
  }

  const purposeColor = PURPOSE_COLOR[estate.purpose] || PURPOSE_COLOR.Residential;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: photo ? undefined : "linear-gradient(135deg, #3F0C91 0%, #700CEB 55%, #8A2FF0 100%)",
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
    { ...size },
  );
}
