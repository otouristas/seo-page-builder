import { ImageResponse } from "next/og";
export const alt = "RankSushi — useful insights, served fresh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#f7f7ef",
        width: "100%",
        height: "100%",
        display: "flex",
        padding: "65px 75px",
        flexDirection: "column",
        color: "#243c30",
      }}
    >
      <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>
        ranksushi<span style={{ color: "#df8468" }}>.</span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 60,
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: -3,
        }}
      >
        Less SEO overwhelm.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: -3,
        }}
      >
        More “found you.”
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 24,
          marginTop: 30,
          color: "#66725e",
        }}
      >
        Useful insights, served fresh.
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 85,
          bottom: 64,
          background: "#d9e8aa",
          padding: "20px 30px",
          borderRadius: 14,
          fontSize: 22,
        }}
      >
        A little less guesswork. A lot more good stuff.
      </div>
    </div>,
    size,
  );
}
