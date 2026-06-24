import { useState, useEffect, useRef } from "react";
import { C, gr, grGold } from "../tokens";
import { XP } from "../data/levels";
import { generateVotes } from "../lib/algorithm";
import { saveDecision, updateUserStats } from "../lib/db";

function Confetti() {
  const COLORS = [C.grape, C.pink, C.gold, C.emerald, "#F87171", "#A78BFA"];
  const pieces = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    color: COLORS[i % 6],
    left: `${(i / 22) * 105}%`,
    size: `${6 + (i % 4) * 2}px`,
    delay: `${(i * 0.07) % 1.1}s`,
    circle: i % 3 === 0,
  }));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 2,
      }}
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: 0,
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.circle ? "50%" : "3px",
            animation: `confettiFall 1.6s ${p.delay} ease-in infinite`,
          }}
        />
      ))}
    </div>
  );
}

const REASONS = [
  (w) => `${w} wins. Your future self already ordered it.`,
  (w) => `The universe checked your vibe. ${w} won.`,
  (w) => `Science. Gut feeling. Destiny. ${w}.`,
  (w) => `${w} — because you clearly needed permission.`,
  (w) => `${w}. No further questions.`,
];
function AIReasonCard({ winner, loser, category, aiRecommendation, reason }) {
  const [autoRec, setAutoRec] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
    // For food and watch, auto-fetch a recommendation even if user didn't ask
    if ((category === "food" || category === "watch") && !aiRecommendation) {
      setLoadingRec(true);

      fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionA: winner,
          optionB: loser,
          category,
          wantRecommendation: true,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          setAutoRec(data.recommendation || null);
          setLoadingRec(false);
        })
        .catch(() => setLoadingRec(false));
    }
  }, []);

  const displayRec = aiRecommendation || autoRec;

  return (
    <div
      style={{
        background: displayRec ? "rgba(139,92,246,0.1)" : C.glass,
        border: `1px solid ${
          displayRec ? "rgba(139,92,246,0.35)" : C.glassBdr
        }`,
        borderRadius: 16,
        padding: "16px 20px",
        width: "100%",
      }}
    >
      {loadingRec ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: C.muted }}>
            Getting AI recommendation...
          </span>

          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.4)",
                animation: `popIn 0.5s ${
                  i * 0.15
                }s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
      ) : displayRec ? (
        <>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: C.grape,
              marginBottom: 8,
            }}
          >
            ✨ AI SAYS
          </div>

          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {displayRec}
          </p>
        </>
      ) : (
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.82)",
            lineHeight: 1.55,
            fontStyle: "italic",
            textAlign: "center",
            margin: 0,
          }}
        >
          "{reason}"
        </p>
      )}
    </div>
  );
}
export default function Reveal({
  optA,
  optB,
  answers,
  user,
  category,
  aiRecommendation,
  go,
  onDecided,
}) {
  const [phase, setPhase] = useState("counting");
  const [saved, setSaved] = useState(false);

  const result = useRef(generateVotes(answers || [1, 1, 1]));
  const { vA, vB, isDraw, isCloseCall, diff } = result.current;

  const winner = useRef("");
  const loser = useRef("");
  const reason = useRef("");

  const xpGained =
    XP.decision +
    (isDraw ? XP.draw_win : 0) +
    (isCloseCall ? XP.close_call : 0);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (isDraw) {
        setPhase("draw_flip");
        setTimeout(async () => {
          winner.current = Math.random() > 0.5 ? optA : optB;
          loser.current = winner.current === optA ? optB : optA;
          reason.current = REASONS[Math.floor(Math.random() * REASONS.length)](
            winner.current
          );
          onDecided?.({
            optA,
            optB,
            winner: winner.current,
            loser: loser.current,
            category,
          });
          setPhase("result");
          await handleSave(winner.current, loser.current);
        }, 2500);
      } else {
        winner.current = vA > vB ? optA : optB;
        loser.current = winner.current === optA ? optB : optA;
        reason.current = REASONS[Math.floor(Math.random() * REASONS.length)](
          winner.current
        );
        onDecided?.({
          optA,
          optB,
          winner: winner.current,
          loser: loser.current,
          category,
        });
        setPhase("result");
        await handleSave(winner.current, loser.current);
      }
    }, 1800);

    return () => clearTimeout(t);
  }, []);

  async function handleSave(win, lose) {
    if (saved || !user) return;
    setSaved(true);

    await saveDecision({
      userId: user.id,
      optionA: optA,
      optionB: optB,
      winner: win,
      loser: lose,
      votesA: vA,
      votesB: vB,
      category,
      wasDraw: isDraw,
      wasCloseCall: isCloseCall,
    });

    await updateUserStats({
      userId: user.id,
      xpToAdd: xpGained,
      coinsToAdd: 5,
    });
  }

  return (
    <div
      style={{
        padding: "16px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        minHeight: "100%",
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(ellipse 90% 60% at 50% 30%, rgba(139,92,246,0.25) 0%, ${C.bg} 65%)`,
      }}
    >
      {phase === "result" && <Confetti />}

      {/* COUNTING */}
      {phase === "counting" && (
        <div
          style={{
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: C.muted,
              margin: 0,
              textAlign: "center",
            }}
          >
            COUNTING VOTES...
          </p>
          {[
            { label: optA, votes: vA, color: gr() },
            {
              label: optB,
              votes: vB,
              color: `linear-gradient(90deg, ${C.pink}, ${C.gold})`,
            },
          ].map((opt, i) => (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.sub }}>
                  {opt.votes} votes
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: C.glass,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(opt.votes / (vA + vB)) * 100}%`,
                    background: opt.color,
                    borderRadius: 4,
                    transition: "width 1.2s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DRAW COIN FLIP */}
      {phase === "draw_flip" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <p
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: C.text,
              textAlign: "center",
              margin: 0,
            }}
          >
            It's a draw! 🤝
          </p>
          <p style={{ fontSize: 14, color: C.sub, margin: 0 }}>
            The coin decides...
          </p>
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: "50%",
              background: gr(),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              animation: "coinSpin 2.3s ease-in-out forwards",
              boxShadow: "0 0 60px rgba(139,92,246,0.5)",
            }}
          >
            🪙
          </div>
        </div>
      )}

      {/* RESULT */}
      {phase === "result" && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            paddingTop: 8,
            position: "relative",
            zIndex: 3,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: C.muted,
              margin: 0,
            }}
          >
            {isDraw ? "🪙 THE COIN HAS SPOKEN" : "🏆 THE WINNER IS"}
          </p>

          <div
            style={{
              fontSize: 40,
              fontWeight: 900,
              background: grGold(),
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "popIn 0.5s ease",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {winner.current.toUpperCase()}
          </div>

          <div style={{ position: "relative", display: "inline-block" }}>
            <span
              style={{
                fontSize: 18,
                color: C.muted,
                fontWeight: 400,
                opacity: 0.5,
              }}
            >
              {loser.current}
            </span>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: -4,
                right: -4,
                height: 2,
                background: C.red,
                borderRadius: 2,
                boxShadow: `0 0 8px ${C.red}`,
                transform: "rotate(-1.5deg)",
              }}
            />
          </div>

          {isCloseCall && (
            <div
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 99,
                padding: "5px 14px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 12 }}>🔥</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.red }}>
                CLOSE CALL · Only {diff} vote{diff > 1 ? "s" : ""} apart
              </span>
            </div>
          )}

          <AIReasonCard
            winner={winner.current}
            loser={loser.current}
            category={category}
            aiRecommendation={aiRecommendation}
            reason={reason.current}
          />

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 99,
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ fontSize: 13 }}>⚡</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>
                +{xpGained} XP
              </span>
            </div>
            <div
              style={{
                background: C.glass,
                border: `1px solid ${C.glassBdr}`,
                borderRadius: 99,
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ fontSize: 13 }}>🪙</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                +5 Coins
              </span>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <button
              onClick={() => go(4)}
              style={{
                background: gr(),
                border: "none",
                borderRadius: 14,
                padding: "17px",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
                fontFamily: "inherit",
              }}
            >
              Share Result 🔗
            </button>
            <button
              onClick={() => go(5)}
              style={{
                background: C.glass,
                border: `1px solid ${C.glassBdr}`,
                borderRadius: 14,
                padding: "17px",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
                fontFamily: "inherit",
              }}
            >
              Rematch 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
