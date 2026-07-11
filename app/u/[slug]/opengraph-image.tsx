import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/services/public-profile/public-profile-service";

export const alt = "Profil ValoStats";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);

  const displayName =
    "code" in profile
      ? "Joueur"
      : profile.user.name || profile.user.riotAccount?.gameName || "Joueur";

  const rank =
    "code" in profile
      ? "Non classé"
      : profile.user.riotAccount?.currentRank || "Non classé";

  const winrate =
    "code" in profile ? "—" : `${profile.stats.winRate.toFixed(1)}%`;

  const kd =
    "code" in profile ? "—" : profile.stats.kdRatio.toFixed(2);

  const matchCount =
    "code" in profile ? "0" : `${profile.stats.matchCount}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #050505 0%, #1a0a0e 50%, #050505 100%)",
        color: "white",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-50%",
          right: "-20%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "-10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f43f5e, #fb923c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            fontWeight: 700,
            color: "white",
            boxShadow: "0 0 40px rgba(244,63,94,0.3)",
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "48px", fontWeight: 700, color: "white", lineHeight: 1.1 }}>
            {displayName}
          </div>
          <div style={{ fontSize: "24px", color: "#f43f5e", marginTop: "4px" }}>
            {rank}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "48px",
          marginTop: "16px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#f43f5e" }}>{winrate}</div>
          <div style={{ fontSize: "16px", color: "#94a3b8", marginTop: "4px" }}>Winrate</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "white" }}>{kd}</div>
          <div style={{ fontSize: "16px", color: "#94a3b8", marginTop: "4px" }}>K/D</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "white" }}>{matchCount}</div>
          <div style={{ fontSize: "16px", color: "#94a3b8", marginTop: "4px" }}>Matchs</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          fontSize: "18px",
          color: "#334155",
          fontWeight: 500,
          letterSpacing: "2px",
        }}
      >
        VALOSTATS
      </div>
    </div>,
    { ...size },
  );
}
