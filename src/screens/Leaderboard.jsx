
import { useState, useEffect } from "react";
import { C, gr, grGold } from "../tokens";
import { getLevelInfo } from "../data/levels";
import { supabase } from "../lib/supabase";

export default function Leaderboard({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadLeaderboard() {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, username, avatar, xp, streak, is_pro")
          .order("xp", { ascending: false })
          .limit(50);

        if (error) throw error;
        if (active) setUsers(data || []);
      } catch (error) {
        console.error("Leaderboard loading error:", error);
        if (active) setUsers([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLeaderboard();

    return () => {
      active = false;
    };
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div
      style={{
        boxSizing: "border-box",
        padding: "26px 16px 38px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        minHeight: "100%",
        background: `radial-gradient(ellipse 90% 40% at 50% 0%, rgba(245,158,11,0.14) 0%, ${C.bg} 75%)`,
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(245,158,11,0.10)",
            border: "1px solid rgba(245,158,11,0.2)",
            color: C.gold,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          ✨ COMMUNITY RANKINGS
        </div>

        <h1
          style={{
            fontSize: 27,
            fontWeight: 900,
            color: "white",
            margin: 0,
            letterSpacing: "-0.7px",
          }}
        >
          Leaderboard 🏆
        </h1>

        <p
          style={{
            fontSize: 13,
            color: C.sub,
            margin: "7px 0 0",
            lineHeight: 1.6,
          }}
        >
          The community's top decision makers, ranked by XP.
        </p>
      </div>

      {/* Top three */}
      {!loading && users.length >= 3 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8,
            alignItems: "end",
          }}
        >
          {[1, 0, 2].map((position) => {
            const u = users[position];
            const first = position === 0;

            return (
              <div
                key={u.id}
                style={{
                  minWidth: 0,
                  textAlign: "center",
                  padding: first ? "18px 7px 16px" : "14px 6px 12px",
                  borderRadius: 18,
                  background: first
                    ? "linear-gradient(180deg, rgba(245,158,11,0.15), rgba(245,158,11,0.04))"
                    : C.glass,
                  border: `1px solid ${
                    first ? "rgba(245,158,11,0.35)" : C.glassBdr
                  }`,
                  transform: first ? "translateY(-6px)" : "none",
                }}
              >
                <div style={{ fontSize: first ? 27 : 22, marginBottom: 8 }}>
                  {medals[position]}
                </div>

                <div
                  style={{
                    width: first ? 54 : 46,
                    height: first ? 54 : 46,
                    borderRadius: "50%",
                    background: first ? grGold() : gr(),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 9px",
                    fontSize: first ? 25 : 21,
                    border: first
                      ? "2px solid rgba(245,158,11,0.5)"
                      : `1px solid ${C.glassBdr}`,
                  }}
                >
                  {u.avatar || "🎲"}
                </div>

                <div
                  style={{
                    color: "white",
                    fontSize: 11,
                    fontWeight: 800,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {u.username ? `@${u.username}` : "Player"}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: C.gold,
                    marginTop: 6,
                  }}
                >
                  {u.xp || 0} XP
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List heading */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.09em",
            color: C.muted,
          }}
        >
          {loading ? "LOADING RANKINGS" : "ALL PLAYERS"}
        </div>

        {!loading && (
          <div style={{ fontSize: 11, color: C.muted }}>
            {users.length} {users.length === 1 ? "player" : "players"}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            ...{
              background: C.glass,
              border: `1px solid ${C.glassBdr}`,
              borderRadius: 16,
              padding: "28px 16px",
              textAlign: "center",
            },
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 10 }}>🏆</div>
          <div style={{ fontSize: 13, color: C.sub }}>
            Loading leaderboard...
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <div
          style={{
            background: C.glass,
            border: `1px solid ${C.glassBdr}`,
            borderRadius: 18,
            padding: "30px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 34, marginBottom: 10 }}>🌱</div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "white",
              marginBottom: 6,
            }}
          >
            It's quiet up here
          </div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
            No rankings to show yet. Come back as the community grows.
          </div>
        </div>
      )}

      {/* Player list */}
      {!loading && users.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {users.map((u, i) => {
            const lvl = getLevelInfo(u.xp || 0);
            const isMe = u.id === user?.id;
            const isTopThree = i < 3;

            return (
              <div
                key={u.id}
                style={{
                  boxSizing: "border-box",
                  background: isMe
                    ? "rgba(139,92,246,0.13)"
                    : C.glass,
                  border: `1px solid ${
                    isMe
                      ? "rgba(139,92,246,0.42)"
                      : isTopThree
                        ? "rgba(245,158,11,0.16)"
                        : C.glassBdr
                  }`,
                  borderRadius: 16,
                  padding: "13px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  boxShadow: isMe
                    ? "0 5px 22px rgba(139,92,246,0.08)"
                    : "none",
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    width: 32,
                    flexShrink: 0,
                    textAlign: "center",
                    fontSize: isTopThree ? 21 : 12,
                    fontWeight: 800,
                    color: C.muted,
                  }}
                >
                  {isTopThree ? medals[i] : `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: 14,
                    background: isTopThree
                      ? "rgba(245,158,11,0.12)"
                      : gr(),
                    border: `1px solid ${
                      isTopThree
                        ? "rgba(245,158,11,0.22)"
                        : C.glassBdr
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 21,
                  }}
                >
                  {u.avatar || "🎲"}
                </div>

                {/* Player info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "white",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "145px",
                      }}
                    >
                      @{u.username || "player"}
                    </span>

                    {u.is_pro && (
                      <span style={{ fontSize: 12 }} title="Pro member">
                        👑
                      </span>
                    )}

                    {isMe && (
                      <span
                        style={{
                          fontSize: 8,
                          fontWeight: 900,
                          color: C.grape,
                          background: "rgba(139,92,246,0.16)",
                          border: "1px solid rgba(139,92,246,0.2)",
                          borderRadius: 6,
                          padding: "2px 5px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      marginTop: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {lvl.emoji} {lvl.title} · Level {lvl.level}
                  </div>
                </div>

                {/* XP */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: isTopThree ? C.gold : "white",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {u.xp || 0}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: C.muted,
                      marginTop: 2,
                      letterSpacing: "0.05em",
                    }}
                  >
                    XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          textAlign: "center",
          padding: "8px 0 0",
          color: C.muted,
          fontSize: 10,
          lineHeight: 1.6,
        }}
      >
        Keep making decisions and earning XP to climb the rankings.
      </div>
    </div>
  );
}
