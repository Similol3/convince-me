
import { useState, useEffect } from "react";
import { C, gr, grGold } from "../tokens";
import { getLevelInfo, BADGES, RARITY } from "../data/levels";
import { supabase } from "../lib/supabase";

export default function Profile({ user, go, avatar, onSignIn, onSignUp }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user) {
        setStats(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Guest accounts use their local data.
      if (user.is_guest) {
        setStats(user);
        setLoading(false);
        return;
      }

      // Logged-in accounts fetch their latest profile.
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!active) return;

        if (error) {
          console.error("Profile fetch error:", error);
          setStats(user);
        } else {
          setStats(data || user);
        }
      } catch (error) {
        if (!active) return;
        console.error("Profile fetch error:", error);
        setStats(user);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
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

  if (!stats) {
    return (
      <div
        style={{
          padding: "60px 16px",
          textAlign: "center",
          color: C.muted,
          fontSize: 14,
        }}
      >
        Sign in to view your profile.
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }}>
          <button onClick={onSignIn} style={secondaryButton}>
            Log In
          </button>
          <button onClick={onSignUp} style={primaryButton}>
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const xp = Number(stats.xp) || 0;
  const coins = Number(stats.coins) || 0;
  const streak = Number(stats.streak) || 0;
  const decisions = Number(stats.total_decisions) || 0;
  const lvl = getLevelInfo(xp);

  const badgeState = {
    totalDecisions: decisions,
    streak,
    coinFlipWins: Number(stats.coin_flip_wins) || 0,
    shares: Number(stats.shares) || 0,
  };

  const earnedBadges = BADGES.filter((badge) => badge.check(badgeState)).length;

  return (
    <div
      style={{
        boxSizing: "border-box",
        padding: "24px 16px 36px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        minHeight: "100%",
        color: "white",
        background: `radial-gradient(ellipse 90% 40% at 50% 0%, rgba(139,92,246,0.18) 0%, ${C.bg} 75%)`,
      }}
    >
      {/* Profile header */}
      <div style={{ textAlign: "center", paddingTop: 8 }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: gr(),
            border: "2px solid rgba(255,255,255,0.14)",
            boxShadow: "0 8px 30px rgba(139,92,246,0.2)",
            margin: "0 auto 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            overflow: "hidden",
          }}
        >
          {stats.avatar_image ? (
            <img
              src={stats.avatar_image}
              alt="Profile avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
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
            gap: 7,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 800 }}>
            @{stats.username || "player"}
          </span>
          {stats.is_pro && <span title="Pro member">👑</span>}
        </div>

        <div style={{ fontSize: 13, color: C.sub, marginTop: 5 }}>
          {lvl.emoji} {lvl.title}
        </div>

        <div
          style={{
            display: "inline-flex",
            marginTop: 12,
            padding: "5px 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${C.glassBdr}`,
            color: C.sub,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {stats.is_guest ? "GUEST ACCOUNT" : stats.is_pro ? "PRO MEMBER" : "FREE MEMBER"}
        </div>
      </div>

      {/* Guest account banner */}
      {stats.is_guest && (
        <div
          style={{
            background: "rgba(139,92,246,0.1)",
            border: "1px solid rgba(139,92,246,0.3)",
            borderRadius: 18,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 5 }}>
            💾 Save your progress
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.sub,
              marginBottom: 14,
              lineHeight: 1.6,
            }}
          >
            Create a free account to save your decisions, appear on the
            leaderboard, and keep your progress across sessions.
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onSignUp} style={primaryButton}>
              Create Account
            </button>
            <button onClick={onSignIn} style={secondaryButton}>
              Log In
            </button>
          </div>
        </div>
      )}

      {/* XP and level */}
      <div style={glassCard}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 800 }}>
            ⭐ Level {lvl.level}
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>
            {xp.toLocaleString()} XP {lvl.nextXP ? `/ ${lvl.nextXP}` : "· MAX"}
          </span>
        </div>

        <div
          style={{
            height: 9,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.max(0, lvl.progress || 0))}%`,
              background: grGold(),
              borderRadius: 999,
              transition: "width 0.6s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 9,
            color: C.muted,
            fontSize: 11,
          }}
        >
          <span>{lvl.title}</span>
          <span>{lvl.nextXP ? `${Math.max(0, lvl.nextXP - xp)} XP to next level` : "Maximum level reached"}</span>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {[
          { emoji: "🪙", value: coins, label: "Coins" },
          { emoji: "🔥", value: streak, label: "Day Streak" },
          { emoji: "📊", value: decisions, label: "Decisions" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              ...glassCard,
              padding: "16px 6px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 7 }}>{item.emoji}</div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>
              {item.value.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.muted,
                marginTop: 5,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: C.muted,
              margin: 0,
            }}
          >
            YOUR BADGES
          </p>
          <span style={{ fontSize: 11, color: C.sub }}>
            {earnedBadges}/{BADGES.length} unlocked
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          {BADGES.map((badge) => {
            const earned = badge.check(badgeState);
            const color = RARITY[badge.rarity] || C.gold;

            return (
              <div
                key={badge.id}
                style={{
                  background: earned ? C.glass : "rgba(255,255,255,0.02)",
                  border: `1px solid ${earned ? `${color}70` : C.glassBdr}`,
                  borderRadius: 16,
                  padding: "16px 12px",
                  opacity: earned ? 1 : 0.48,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 7,
                  textAlign: "center",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 29,
                    filter: earned ? "none" : "grayscale(1)",
                  }}
                >
                  {badge.emoji}
                </div>

                <div style={{ fontSize: 12, fontWeight: 800 }}>
                  {badge.name}
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color: C.muted,
                    lineHeight: 1.5,
                  }}
                >
                  {badge.desc}
                </div>

                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: earned ? color : C.muted,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {earned ? badge.rarity : "LOCKED"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Navigation actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <ProfileAction
          emoji="🏆"
          title="Leaderboard"
          subtitle="See how you rank against others"
          onClick={() => go(14)}
        />

        <ProfileAction
          emoji="👑"
          title={stats.is_pro ? "Pro Membership" : "Upgrade to Pro"}
          subtitle={stats.is_pro ? "You're enjoying Pro" : "Unlock more possibilities"}
          gold
          onClick={() => go(13)}
        />

        <ProfileAction
          emoji="⚙️"
          title="Settings"
          subtitle="Manage your account and preferences"
          onClick={() => go(7)}
        />
      </div>
    </div>
  );
}

const glassCard = {
  background: C.glass,
  border: `1px solid ${C.glassBdr}`,
  borderRadius: 20,
  padding: 18,
};

const primaryButton = {
  flex: 1,
  background: gr(),
  border: "none",
  borderRadius: 12,
  padding: "12px 10px",
  color: "white",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "inherit",
};

const secondaryButton = {
  flex: 1,
  background: C.glass,
  border: `1px solid ${C.glassBdr}`,
  borderRadius: 12,
  padding: "12px 10px",
  color: "white",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "inherit",
};

function ProfileAction({ emoji, title, subtitle, onClick, gold = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: gold
          ? "linear-gradient(100deg, rgba(245,158,11,0.14), rgba(252,211,77,0.06))"
          : C.glass,
        border: gold
          ? "1px solid rgba(245,158,11,0.28)"
          : `1px solid ${C.glassBdr}`,
        borderRadius: 17,
        padding: "15px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        color: "white",
        fontFamily: "inherit",
      }}
    >
      <span style={{ fontSize: 22 }}>{emoji}</span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 800 }}>
          {title}
        </span>
        <span
          style={{
            display: "block",
            fontSize: 11,
            color: C.muted,
            marginTop: 4,
          }}
        >
          {subtitle}
        </span>
      </span>

      <span style={{ color: C.muted, fontSize: 20 }}>›</span>
    </button>
  );
}
