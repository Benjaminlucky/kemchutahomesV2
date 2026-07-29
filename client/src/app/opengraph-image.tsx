import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME } from "@/lib/seo";

// Sitewide fallback OG image (PRD FR-1: "dynamic OG image per estate" plus
// closing the gap flagged in the platform audit — every page without a more
// specific opengraph-image previously fell back to a raw .svg logo, which
// most social scrapers (WhatsApp, Facebook, LinkedIn) don't render at all).
// A more specific opengraph-image deeper in the route tree (e.g.
// estate/[slug]/opengraph-image.tsx) takes precedence over this one per
// Next's file-convention resolution — see that file for the per-estate
// version. Copy here ("We Build Communities.") is lifted from the mission
// section on /company rather than invented fresh, so the link-preview and
// the page it points to say the same thing.
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/assets/logoWhite.png"))
    .then((buf) => `data:image/png;base64,${buf.toString("base64")}`)
    .catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "linear-gradient(160deg, #0a0614 0%, #170a2b 45%, #24103f 75%, #170a2b 100%)",
          padding: "64px 80px",
        }}
      >
        {/* Premium ambient glow accents */}
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(112,12,235,0.4) 0%, rgba(112,12,235,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -240,
            left: -180,
            width: 580,
            height: 580,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(138,47,240,0.28) 0%, rgba(138,47,240,0) 70%)",
            display: "flex",
          }}
        />

        {logo && (
          // eslint-disable-next-line @next/next/no-img-element -- next/image isn't usable inside ImageResponse's satori renderer
          <img src={logo} width={220} height={31} alt="" style={{ objectFit: "contain", zIndex: 1 }} />
        )}

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 0.98,
              letterSpacing: -3,
              color: "#fff",
            }}
          >
            <span style={{ display: "flex" }}>We Build</span>
            <span style={{ display: "flex", color: "#c084fc", fontStyle: "italic" }}>Communities.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 32,
              maxWidth: 820,
              fontSize: 26,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            We envision a future where every individual&rsquo;s dream of owning their ideal home is realized —
            through real estate that inspires and elevates.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <div style={{ display: "flex", width: "100%", height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 24 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>
              {SITE_NAME.toUpperCase()}
            </div>
            <div style={{ display: "flex", fontSize: 20, color: "rgba(255,255,255,0.55)" }}>
              Leadership by Dr. Ikem Nwabueze — Chairman &amp; CEO
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
