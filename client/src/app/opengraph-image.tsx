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
// version.
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3F0C91 0%, #700CEB 55%, #8A2FF0 100%)",
        }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- next/image isn't usable inside ImageResponse's satori renderer
          <img src={logo} width={340} height={88} alt="" style={{ objectFit: "contain" }} />
        ) : (
          <div style={{ fontSize: 72, fontWeight: 900, color: "#fff", letterSpacing: -2 }}>{SITE_NAME}</div>
        )}
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            fontWeight: 600,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: -0.5,
          }}
        >
          Land Subscriptions · Buy2Sell Investments · Property Marketing
        </div>
      </div>
    ),
    { ...size },
  );
}
