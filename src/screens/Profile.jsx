import { useState, useEffect } from "react";
import { C, gr, grGold } from "../tokens";
import { getLevelInfo, BADGES, RARITY } from "../data/levels";
import { supabase } from "../lib/supabase";

export default function Profile({ user, go, avatar, onSignIn, onSignUp }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Guest users: use local data directly, no Supabase fetch
    if (user.is_guest) {
      setStats(user);
      setLoading(false);
      return;
    }

    // Real logged-in users: fetch fresh data from Supabase
    supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Profile fetch error:", error);
          setStats(user); // fallback to what we already have
        } else {
          setStats(data);
        }
        setLoading(false);
      });
  }, [user]);

  if (loading || !stats) {
    return (
      <div
        style={{
          padding: "60px 16px",
          textAlign: "center",
          color: C.muted,
          fontSize: 14,
        }}
      >
        Loading profile...
      </div>
    );
  }

  const lvl = getLevelInfo(stats.xp || 0);

  const badgeState = {
    totalDecisions: stats.total_decisions || 0,
    streak: stats.streak || 0,
    coinFlipWins: 0,
    shares: 0,
  };

  return (
    <div
      style={{
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        minHeight: "100%",
        background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(139,92,246,0.2) 0%, ${C.bg} 60%)`,
      }}
    >
      {/* Avatar + name */}
      <div style={{ textAlign: "center", paddingTop: 8 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: gr(),
            margin: "0 auto 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            overflow: "hidden",
          }}
        >
          {stats.avatar_image ? (
            <img
              src={stats.avatar_image}
              alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            avatar || "🎲"
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 800, color: "white" }}>
            @{stats.username}
          </span>
          {stats.is_pro && <span style={{ fontSize: 16 }}>👑</span>}
        </div>

        <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>
          {lvl.emoji} {lvl.title}
        </div>
      </div>

      {/* Guest banner */}
      {stats.is_guest && (
        <div
          style={{
            background: "rgba(139,92,246,0.1)",
            border: "1px solid rgba(139,92,246,0.3)",
            borderRadius: 18,
            padding: "18px 16px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "white",
              marginBottom: 4,
            }}
          >
            💾 Save your progress
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.sub,
              marginBottom: 14,
              lineHeight: 1.5,
            }}
          >
            Create a free account to save your decisions, appear on the
            leaderboard, and unlock Pro features.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onSignUp}
              style={{
                flex: 1,
                background: gr(),
                border: "none",
                borderRadius: 12,
                padding: "12px",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Create Account
            </button>
            <button
              onClick={onSignIn}
              style={{
                flex: 1,
                background: C.glass,
                border: `1px solid ${C.glassBdr}`,
                borderRadius: 12,
                padding: "12px",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Log In
            </button>
          </div>
        </div>
      )}

      {/* XP card */}
      <div
        style={{
          background: C.glass,
          border: `1px solid ${C.glassBdr}`,
          borderRadius: 20,
          padding: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
            Level {lvl.level}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>
            {stats.xp || 0} XP {lvl.nextXP ? `/ ${lvl.nextXP}` : "· MAX"}
          </span>
        </div>
        <div
          style={{
            height: 8,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${lvl.progress}%`,
              background: grGold(),
              borderRadius: 4,
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}
      >
        {[
          { e: "🪙", v: stats.coins || 0, l: "Coins" },
          { e: "🔥", v: stats.streak || 0, l: "Day Streak" },
          { e: "📊", v: stats.total_decisions || 0, l: "Decisions" },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              background: C.glass,
              border: `1px solid ${C.glassBdr}`,
              borderRadius: 16,
              padding: "14px 8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.e}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>
              {s.v}
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: C.muted,
            margin: "0 0 10px",
          }}
        >
          BADGES · {BADGES.filter((b) => b.check(badgeState)).length}/
          {BADGES.length}
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {BADGES.map((badge) => {
            const earned = badge.check(badgeState);
            const color = RARITY[badge.rarity];
            return (
              <div
                key={badge.id}
                style={{
                  background: earned ? C.glass : "rgba(255,255,255,0.02)",
                  border: `1px solid ${earned ? color + "50" : C.glassBdr}`,
                  borderRadius: 16,
                  padding: "14px",
                  opacity: earned ? 1 : 0.4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    filter: earned ? "none" : "grayscale(1)",
                  }}
                >
                  {badge.emoji}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>
                  {badge.name}
                </div>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.3 }}>
                  {badge.desc}
                </div>
                {earned && (
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color,
                      letterSpacing: "0.08em",
                      marginTop: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    {badge.rarity}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard button */}
      <button
        onClick={() => go(14)}
        style={{
          background: C.glass,
          border: `1px solid ${C.glassBdr}`,
          borderRadius: 16,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          width: "100%",
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🏆</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
            Leaderboard
          </span>
        </div>
        <span style={{ color: C.muted, fontSize: 16 }}>›</span>
      </button>

      {/* Upgrade button */}
      <button
        onClick={() => go(13)}
        style={{
          background:
            "linear-gradient(90deg, rgba(245,158,11,0.15), rgba(252,211,77,0.1))",
          border: `1px solid rgba(245,158,11,0.3)`,
          borderRadius: 16,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          width: "100%",
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>👑</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
            {stats.is_pro ? "Pro Member" : "Upgrade to Pro"}
          </span>
        </div>
        <span style={{ color: C.muted, fontSize: 16 }}>›</span>
      </button>

      {/* Settings button */}
      <button
        onClick={() => go(7)}
        style={{
          background: C.glass,
          border: `1px solid ${C.glassBdr}`,
          borderRadius: 16,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          width: "100%",
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚙️</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
            Settings
          </span>
        </div>
        <span style={{ color: C.muted, fontSize: 16 }}>›</span>
      </button>
    </div>
  );
}
