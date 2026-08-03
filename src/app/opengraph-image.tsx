import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${BRAND.name} — ${BRAND.slogan} Camisas de futebol tailandesas 1:1.`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: BRAND.colors.black,
          color: BRAND.colors.white,
          fontFamily: "Arial, sans-serif",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 40 }}>
          <span
            style={{
              backgroundColor: BRAND.colors.green,
              color: BRAND.colors.black,
              padding: "10px 20px",
              borderRadius: 6,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            CAMISAS TAILANDESAS 1:1
          </span>
        </div>
        <div
          style={{
            fontSize: 140,
            fontWeight: 800,
            letterSpacing: 6,
            lineHeight: 1,
            color: BRAND.colors.white,
          }}
        >
          ALAMBRADO
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: 14,
            marginTop: 24,
            color: BRAND.colors.green,
          }}
        >
          WEAR THE GAME.
        </div>
      </div>
    ),
    { ...size },
  );
}
