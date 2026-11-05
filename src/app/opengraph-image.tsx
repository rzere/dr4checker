import { ImageResponse } from "next/og";

export const alt = "DR4 Checker: compare Ahrefs Domain Rating DR3 vs DR4";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f172a",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#86efac",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#059669",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            DR
          </div>
          DR4 Checker
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: "white",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1,
              maxWidth: 980,
            }}
          >
            Current DR vs the new DR4 model
          </div>
          <div style={{ color: "#94a3b8", fontSize: 28, maxWidth: 900 }}>
            Preview Ahrefs Domain Rating changes before December 1, 2026
          </div>
        </div>

        <div style={{ display: "flex", color: "#64748b", fontSize: 22 }}>
          dr4checker.com · Domain Rating by Ahrefs
        </div>
      </div>
    ),
    { ...size },
  );
}
