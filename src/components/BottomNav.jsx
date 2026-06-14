import { C, gr } from "../tokens";
import { getPlatform } from "../lib/platform";

const NAV_ITEMS = [
  { icon: "⚡", label: "Decide" },
  { icon: "💬", label: "Connect" },
  { icon: "📊", label: "Battles" },
  { icon: "👤", label: "Profile" },
];

export default function BottomNav({ active, setActive }) {
  const platform = getPlatform();

  // ── ANDROID: Material-style full-width bar ──────────────
  if (platform === "android") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "10px 8px",
          boxSizing: "border-box",
          background: "#15131F",
          borderTop: `1px solid ${C.border}`,
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
          zIndex: 50,
        }}
      >
        {NAV_ITEMS.map((item, i) => {
          const on = active === i;
          return (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                fontFamily: "inherit",
                padding: "6px 16px",
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 30,
                  borderRadius: 16,
                  background: on ? "rgba(139,92,246,0.25)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
              >
                <span style={{ fontSize: 18, opacity: on ? 1 : 0.6 }}>
                  {item.icon}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: on ? 700 : 500,
                  color: on ? C.grape : C.muted,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── iOS: floating glass pill (original design) ──────────
  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 24px)",
        maxWidth: 406,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "10px 16px 14px",
        borderRadius: 32,
        boxSizing: "border-box",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map((item, i) => {
        const on = active === i;
        return (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              background: on ? gr() : "transparent",
              border: "none",
              borderRadius: on ? 50 : 0,
              width: on ? 48 : "auto",
              height: on ? 48 : "auto",
              padding: on ? 0 : "6px 12px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              fontFamily: "inherit",
              transition: "all 0.2s ease",
              boxShadow: on ? "0 4px 16px rgba(139,92,246,0.45)" : "none",
            }}
          >
            <span style={{ fontSize: on ? 20 : 17 }}>{item.icon}</span>
            {!on && (
              <span
                style={{
                  fontSize: 9,
                  color: C.muted,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
