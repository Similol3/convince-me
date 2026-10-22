
import { C, gr, grGold } from "../tokens";
import {
  getTodayDecisionCount,
  FREE_DAILY_LIMIT,
  getRemainingDecisions,
} from "../lib/decisions";

export default function Home({ go, user }) {
  const isPro = user?.is_pro || false;
  const remaining = getRemainingDecisions(isPro);
  const usedToday = getTodayDecisionCount();

  const panel = {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.085)",
    borderRadius: 20,
  };

  const sectionLabel = {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.15em",
    color: C.muted,
  };

  const categoryCard = {
    ...panel,
    padding: "19px 15px",
    minWidth: 0,
    minHeight: 143,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
    color: "#FFFFFF",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        minHeight: "100%",
        boxSizing: "border-box",
        padding: "26px 18px 34px",
        display: "flex",
        flexDirection: "column",
        gap: 23,
        overflow: "hidden",
        background: C.bg,
        color: "#FFFFFF",
        fontFamily: "inherit",
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 360,
          height: 360,
          top: -170,
          right: -145,
          borderRadius: "50%",
          background: "rgba(139,92,246,0.17)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Hero */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: 10,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 100,
            padding: "8px 12px",
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.09)",
            marginBottom: 23,
          }}
        >
          <span style={{ fontSize: 13 }}>🎲</span>
          <span
            style={{
              ...sectionLabel,
              color: "#DDD6FE",
              letterSpacing: "0.09em",
            }}
          >
            YOUR DECISION SPACE
          </span>
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#A78BFA",
            letterSpacing: "0.17em",
            marginBottom: 10,
          }}
        >
          LESS OVERTHINKING. MORE LIVING.
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(34px, 9vw, 43px)",
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: "-0.06em",
          }}
        >
          Can't decide?
          <span
            style={{
              display: "block",
              background: "linear-gradient(100deg, #C4B5FD, #67E8F9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              paddingBottom: 4,
            }}
          >
            We got you.
          </span>
        </h1>

        <p
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: C.sub,
            margin: "12px 0 0",
            maxWidth: 300,
          }}
        >
          Fast choices for indecisive humans. Pick a dilemma and let the fun
          begin.
        </p>
      </div>

      {/* Pro promotion */}
      {!isPro && (
        <button
          type="button"
          onClick={() => go(13)}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "15px",
            textAlign: "left",
            background:
              "linear-gradient(115deg, rgba(245,158,11,0.13), rgba(236,72,153,0.045))",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: 17,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 12,
              background: "rgba(245,158,11,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            ✨
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1.4,
              }}
            >
              Unlock unlimited AI messages
            </div>

            <div
              style={{
                fontSize: 11,
                color: C.muted,
                marginTop: 4,
              }}
            >
              Take your experience further
            </div>
          </div>

          <span
            style={{
              color: C.gold,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}
          >
            UPGRADE ↗
          </span>
        </button>
      )}

      {/* Daily decision battery */}
      {!isPro && (
        <div
          style={{
            ...panel,
            padding: "18px 17px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 15,
            }}
          >
            <div>
              <div
                style={{
                  ...sectionLabel,
                  marginBottom: 7,
                }}
              >
                TODAY'S ALLOWANCE
              </div>

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#FFFFFF",
                }}
              >
                ⚡ Daily Decisions
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 25,
                  fontWeight: 900,
                  letterSpacing: "-0.06em",
                  color:
                    remaining === 0
                      ? C.red
                      : remaining === 1
                      ? C.gold
                      : C.emerald,
                }}
              >
                {remaining}
              </span>

              <span
                style={{
                  fontSize: 12,
                  color: C.muted,
                  fontWeight: 700,
                }}
              >
                /{FREE_DAILY_LIMIT}
              </span>

              <div
                style={{
                  fontSize: 10,
                  color: C.muted,
                  marginTop: 1,
                }}
              >
                remaining
              </div>
            </div>
          </div>

          <div
            style={{
              height: 7,
              borderRadius: 100,
              background: "rgba(255,255,255,0.075)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 100,
                width: `${(remaining / FREE_DAILY_LIMIT) * 100}%`,
                background:
                  remaining === 0
                    ? C.red
                    : remaining === 1
                    ? C.gold
                    : C.emerald,
                transition: "width 0.4s ease",
              }}
            />
          </div>

          {remaining === 0 && (
            <button
              type="button"
              onClick={() => go(13)}
              style={{
                marginTop: 14,
                width: "100%",
                background: grGold(),
                border: "none",
                borderRadius: 11,
                padding: "11px 13px",
                color: "#1A1208",
                fontSize: 12,
                fontWeight: 900,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Unlock more decisions →
            </button>
          )}
        </div>
      )}

      {/* Main decision CTA */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          type="button"
          onClick={() =>
            go(1, undefined, undefined, undefined, "general")
          }
          style={{
            background: gr(),
            border: "none",
            borderRadius: 17,
            padding: "19px 18px",
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 900,
            cursor: "pointer",
            width: "100%",
            boxSizing: "border-box",
            letterSpacing: "0.025em",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 10px 28px rgba(139,92,246,0.23)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 19 }}>🎲</span>
            HELP ME DECIDE
          </span>

          <span style={{ fontSize: 22, lineHeight: 1 }}>→</span>
        </button>

        <p
          style={{
            fontSize: 11,
            color: C.muted,
            margin: 0,
            textAlign: "center",
          }}
        >
          Got two choices? We'll help you pick one.
        </p>
      </div>

      {/* Category selection */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 13,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={sectionLabel}>MAKE IT SPECIFIC</div>

            <h2
              style={{
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: "-0.035em",
                margin: "6px 0 0",
                color: "#FFFFFF",
              }}
            >
              What are we deciding?
            </h2>
          </div>

          <span
            style={{
              fontSize: 11,
              color: C.muted,
              fontWeight: 700,
            }}
          >
            PICK A CATEGORY
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 12,
          }}
        >
          {[
            {
              e: "🍔",
              l: "FOOD",
              cat: "food",
              desc: "What to eat",
              accent: "rgba(245,158,11,0.11)",
              border: "rgba(245,158,11,0.22)",
            },
            {
              e: "🎬",
              l: "WATCH",
              cat: "watch",
              desc: "What to watch",
              accent: "rgba(139,92,246,0.13)",
              border: "rgba(167,139,250,0.24)",
            },
          ].map((c) => (
            <button
              type="button"
              key={c.l}
              onClick={() =>
                go(1, undefined, undefined, undefined, c.cat)
              }
              style={{
                ...categoryCard,
                background: `linear-gradient(145deg, ${c.accent}, rgba(255,255,255,0.025))`,
                border: `1px solid ${c.border}`,
              }}
            >
              <div
                style={{
                  width: 43,
                  height: 43,
                  borderRadius: 13,
                  background: "rgba(255,255,255,0.065)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {c.e}
              </div>

              <div style={{ marginTop: 17, width: "100%" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: "0.065em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 5,
                  }}
                >
                  {c.l}
                  <span
                    style={{
                      fontSize: 16,
                      color: C.muted,
                    }}
                  >
                    ↗
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    marginTop: 5,
                  }}
                >
                  {c.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Connect */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            ...sectionLabel,
            marginBottom: 12,
          }}
        >
          MORE THAN DECISIONS
        </div>

        <button
          type="button"
          onClick={() => go(9)}
          style={{
            ...panel,
            width: "100%",
            boxSizing: "border-box",
            padding: "17px 15px",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 13,
            textAlign: "left",
            background:
              "linear-gradient(110deg, rgba(23,198,217,0.075), rgba(255,255,255,0.025))",
            border: "1px solid rgba(23,198,217,0.19)",
          }}
        >
          <div
            style={{
              width: 45,
              height: 45,
              borderRadius: 14,
              background: "rgba(23,198,217,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            💬
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#FFFFFF",
              }}
            >
              Need something to say?
            </div>

            <div
              style={{
                fontSize: 11,
                color: C.muted,
                marginTop: 5,
                lineHeight: 1.5,
              }}
            >
              Get AI help replying to friends or starting chats
            </div>
          </div>

          <span
            style={{
              fontSize: 20,
              color: "#67E8F9",
              flexShrink: 0,
            }}
          >
            ↗
          </span>
        </button>
      </div>

      {/* Trending row — retains original display-only behaviour */}
      <button
        type="button"
        style={{
          ...panel,
          position: "relative",
          zIndex: 1,
          width: "100%",
          boxSizing: "border-box",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          textAlign: "left",
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            flexShrink: 0,
            background: "rgba(236,72,153,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 21,
          }}
        >
          🔥
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              ...sectionLabel,
              color: "#F9A8D4",
              marginBottom: 6,
            }}
          >
            TRENDING NOW · CROWD SOURCED
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.4,
            }}
          >
            Pizza vs Sushi
            <span
              style={{
                fontSize: 11,
                color: "#F472B6",
                marginLeft: 7,
              }}
            >
              847 votes
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: 20,
            color: C.muted,
          }}
        >
          ›
        </span>
      </button>

      <p
        style={{
          margin: "0 0 3px",
          fontSize: 11,
          color: C.muted,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Less debating. More deciding.
      </p>
    </div>
  );
}
