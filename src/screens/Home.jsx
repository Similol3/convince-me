import { C, gr } from "../tokens";

export default function Home({ go, user }) {
  const isPro = user?.is_pro || false;

  return (
    <div
      style={{
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        minHeight: "100%",
        background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(139,92,246,0.35) 0%, ${C.bg} 65%)`,
      }}
    >
      <div style={{ textAlign: "center", paddingTop: 8 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🤔</div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1.1,
          }}
        >
          CAN'T DECIDE?
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 8,
            background: gr(135),
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          WE GOT YOU.
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
          Fast choices for indecisive humans.
        </div>
      </div>
      {!isPro && (
        <button
          onClick={() => go(13)}
          style={{
            background:
              "linear-gradient(90deg, rgba(245,158,11,0.15), rgba(236,72,153,0.1))",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 14,
            padding: "12px 16px",
            cursor: "pointer",
            width: "100%",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
            ✨ Unlock unlimited AI messages
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>
            UPGRADE →
          </span>
        </button>
      )}

      <button
        onClick={() => go(1, undefined, undefined, undefined, "general")}
        style={{
          background: gr(),
          border: "none",
          borderRadius: 14,
          padding: "17px 24px",
          color: "#FFFFFF",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          width: "100%",
          letterSpacing: "0.03em",
          fontFamily: "inherit",
        }}
      >
        HELP ME DECIDE
      </button>

      {/* Category cards — now 3: Food, Watch, Social */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { e: "🍔", l: "FOOD", cat: "food" },
          { e: "🎬", l: "WATCH", cat: "watch" },
        ].map((c) => (
          <button
            key={c.l}
            onClick={() => go(1, undefined, undefined, undefined, c.cat)}
            style={{
              backgroundColor: "#15131F",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "20px 16px",
              textAlign: "center",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{c.e}</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "0.06em",
              }}
            >
              {c.l}
            </div>
          </button>
        ))}
      </div>

      {/* Social card — full width, goes to Connect */}
      <button
        onClick={() => go(9)}
        style={{
          backgroundColor: "#15131F",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "18px 16px",
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 14,
          width: "100%",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "rgba(6,182,212,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          💬
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
            Need something to say?
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            Get AI help replying to friends or starting chats
          </div>
        </div>
        <span style={{ color: C.muted, fontSize: 18, marginLeft: "auto" }}>
          ›
        </span>
      </button>

      {/* Trending row */}
      <button
        style={{
          backgroundColor: "#15131F",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "14px 16px",
          cursor: "pointer",
          width: "100%",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
              Pizza vs Sushi ·{" "}
              <span style={{ color: "#EC4899" }}>847 votes</span>
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              TRENDING NOW · CROWD SOURCED
            </div>
          </div>
        </div>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>›</span>
      </button>
    </div>
  );
}
