import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card: the coals, the line, the wordmark with its live coal. */
export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "assets/images/embers.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: site.brand.soot, color: site.brand.ash, fontFamily: "sans-serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={1200} height={800} style={{ position: "absolute", top: -60, left: 0, width: 1200, height: 800, objectFit: "cover", opacity: 0.8 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg, rgba(18,14,12,0.9) 0%, rgba(18,14,12,0.35) 60%, rgba(18,14,12,0.1) 100%)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "flex-end", fontSize: 54, fontWeight: 700, letterSpacing: -3 }}>
            {site.wordmark}
            <div style={{ width: 12, height: 12, borderRadius: 12, background: site.brand.ember, marginLeft: 4, marginBottom: 12, boxShadow: "0 0 18px 6px rgba(255,107,44,0.7)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 128, lineHeight: 0.86, letterSpacing: -6, fontWeight: 300 }}>
            <span>sit by</span>
            <span>the fire.</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, opacity: 0.8 }}>{site.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
