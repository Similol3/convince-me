import { useState, useRef } from "react";
import { toBlob } from "html-to-image";
import { C, gr } from "../tokens";

export default function Share({ optA, aiRecommendation, go }) {
  const winner = optA || "Pizza Night";
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const cardRef = useRef(null);

  async function handleShareImage() {
    if (!cardRef.current) return;
    setBusy(true);

    try {
      const blob = await toBlob(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
      });
      if (!blob) throw new Error("blob failed");
      const file = new File([blob], "convince-me.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Convince Me",
          text: `${winner.toUpperCase()} wins! Decided by Convince Me 🎲`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "convince-me.png";
        a.click();
        URL.revokeObjectURL(url);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }
    } catch (e) {
      console.error("Share error:", e);
    }
    setBusy(false);
  }

  function handleCopyCaption() {
    const text = `${winner.toUpperCase()} wins! "Because salad is just a cry for help, and we deserve a cheesy hug." — decided by Convince Me 🎲`;
    navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <div
      style={{
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minHeight: "100%",
        background: C.bg,
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>
        Share Your Result
      </h2>

      {/* Shareable card — captured as image */}
      <div
        ref={cardRef}
        style={{
          borderRadius: 28,
          padding: "28px 24px",
          textAlign: "center",
          background: gr(145),
          boxShadow: "0 24px 60px rgba(139,92,246,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "white" }}>
              Convince
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                background: "rgba(255,255,255,0.25)",
                borderRadius: 4,
                padding: "0 5px",
                display: "inline-block",
                color: "white",
              }}
            >
              Me
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "0.1em",
              }}
            >
              Decision
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "white" }}>
              Made ✓
            </div>
          </div>
        </div>

        <div style={{ fontSize: 44, marginBottom: 8 }}>🏆</div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.65)",
            marginBottom: 8,
          }}
        >
          THE VERDICT IS IN
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: "white",
            marginBottom: 12,
          }}
        >
          {winner.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.85)",
            fontStyle: aiRecommendation ? "normal" : "italic",
            lineHeight: 1.55,
            marginBottom: 20,
          }}
        >
          {aiRecommendation
            ? `✨ ${aiRecommendation}`
            : `"Because sometimes you just need someone to decide for you."`}
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: 14,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            🎲 CONVINCE ME
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              marginTop: 4,
            }}
          >
            Join the vote → convinceme.app/vote-392
          </div>
        </div>
      </div>

      {/* Primary: image share */}
      <button
        onClick={handleShareImage}
        disabled={busy}
        style={{
          background: gr(),
          border: "none",
          borderRadius: 14,
          padding: "16px",
          color: "white",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          width: "100%",
          fontFamily: "inherit",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? "Preparing image..." : done ? "✓ Saved!" : "📸 Share as Image"}
      </button>

      {/* Secondary: text caption */}
      <button
        onClick={handleCopyCaption}
        style={{
          background: C.glass,
          border: `1px solid ${C.glassBdr}`,
          borderRadius: 14,
          padding: "16px",
          color: "white",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          width: "100%",
          fontFamily: "inherit",
        }}
      >
        📋 Copy Caption
      </button>

      <button
        onClick={() => go(0)}
        style={{
          background: "transparent",
          border: `1px solid ${C.glassBdr}`,
          borderRadius: 14,
          padding: "16px",
          color: "white",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          width: "100%",
          fontFamily: "inherit",
        }}
      >
        DECIDE AGAIN 🔄
      </button>
    </div>
  );
}
