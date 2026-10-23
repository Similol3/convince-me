
import { useState, useRef } from "react";
import { toBlob } from "html-to-image";
import { C, gr } from "../tokens";

const APP_URL = "https://convince-me-tau.vercel.app";

export default function Share({ winner, aiRecommendation, go }) {
  const displayWinner = winner || "Your choice";
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState("");
  const cardRef = useRef(null);
  const copyTimer = useRef(null);

  function showCopied() {
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2200);
  }

  async function handleShareImage() {
    if (!cardRef.current || busy) return;

    setBusy(true);
    setShareError("");

    try {
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#171329",
      });

      if (!blob) throw new Error("Could not create the image.");

      const file = new File([blob], "convince-me.png", {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Convince Me",
          text: `${displayWinner} wins! Decided by Convince Me 🎲`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "convince-me.png";
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showCopied();
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share image error:", error);
        setShareError("Couldn't prepare the image. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyCaption() {
    const recommendation = aiRecommendation
      ? `\n\n"${aiRecommendation}"`
      : "";

    const caption = `${displayWinner.toUpperCase()} wins! 🏆${recommendation}\n\nDecided by Convince Me 🎲\nTry it free → ${APP_URL}`;

    try {
      await navigator.clipboard.writeText(caption);
      showCopied();
      setShareError("");
    } catch (error) {
      console.error("Copy caption error:", error);
      setShareError("Couldn't copy the caption. Check your browser permissions.");
    }
  }

  const buttonStyle = {
    width: "100%",
    minHeight: 52,
    borderRadius: 14,
    padding: "14px 16px",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    transition: "transform 0.18s ease, opacity 0.18s ease",
  };

  const cardStyle = {
    background: C.glass,
    border: `1px solid ${C.glassBdr}`,
    borderRadius: 20,
  };

  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "100%",
        minHeight: "100%",
        padding: "24px 16px 36px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        background: `radial-gradient(ellipse 100% 35% at 50% 0%, rgba(139,92,246,0.14) 0%, ${C.bg} 100%)`,
        color: "white",
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: C.grape,
            marginBottom: 8,
          }}
        >
          YOUR DECISION IS MADE
        </div>

        <h1
          style={{
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: "-0.7px",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Share your result
        </h1>

        <p
          style={{
            fontSize: 13,
            color: C.sub,
            lineHeight: 1.65,
            margin: "8px 0 0",
          }}
        >
          Save the moment or send your verdict to your friends.
        </p>
      </div>

      {/* Shareable result card */}
      <div
        ref={cardRef}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          padding: "24px 20px 20px",
          background:
            "linear-gradient(145deg, #302052 0%, #1C1933 52%, #151525 100%)",
          border: "1px solid rgba(196,181,253,0.22)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.22)",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            top: -100,
            right: -65,
            borderRadius: "50%",
            background: "rgba(139,92,246,0.2)",
            filter: "blur(35px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.1 }}>
              Convince Me
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.58)",
                marginTop: 5,
              }}
            >
              YOUR PERSONAL DECISION MAKER
            </div>
          </div>

          <div
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 99,
              padding: "6px 10px",
              fontSize: 10,
              fontWeight: 800,
              color: "#D8B4FE",
              whiteSpace: "nowrap",
            }}
          >
            ✓ DECIDED
          </div>
        </div>

        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "2px 0 24px",
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 12 }}>🏆</div>

          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.16em",
              color: "#C4B5FD",
              marginBottom: 10,
            }}
          >
            THE VERDICT IS IN
          </div>

          <div
            style={{
              fontSize: "clamp(23px, 7vw, 32px)",
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: "-0.6px",
              overflowWrap: "anywhere",
            }}
          >
            {displayWinner.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 15,
            padding: "15px 14px",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#C4B5FD",
              marginBottom: 8,
            }}
          >
            ✨ THE TAKE
          </div>

          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.86)",
              lineHeight: 1.7,
              overflowWrap: "anywhere",
            }}
          >
            {aiRecommendation
              ? `“${aiRecommendation}”`
              : "The universe has spoken. No further questions."}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 15,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.13em",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            🎲 CONVINCE ME
          </div>

          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.48)",
              marginTop: 5,
            }}
          >
            {APP_URL.replace("https://", "")}
          </div>
        </div>
      </div>

      {/* Sharing actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={handleShareImage}
          disabled={busy}
          style={{
            ...buttonStyle,
            background: gr(),
            border: "none",
            color: "white",
            boxShadow: "0 8px 24px rgba(139,92,246,0.2)",
            opacity: busy ? 0.65 : 1,
          }}
        >
          <span>{busy ? "⏳" : "📸"}</span>
          {busy ? "Preparing your image..." : "Share result as image"}
        </button>

        <button
          onClick={handleCopyCaption}
          style={{
            ...buttonStyle,
            background: copied ? "rgba(16,185,129,0.1)" : C.glass,
            border: `1px solid ${copied ? "rgba(16,185,129,0.45)" : C.glassBdr}`,
            color: copied ? C.emerald : "white",
          }}
        >
          <span>{copied ? "✓" : "📋"}</span>
          {copied ? "Copied to clipboard!" : "Copy caption + link"}
        </button>

        {shareError && (
          <div
            role="status"
            style={{
              padding: "11px 13px",
              borderRadius: 12,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#FCA5A5",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            {shareError}
          </div>
        )}
      </div>

      {/* Social proof */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { emoji: "⚡", label: "QUICK DECISIONS" },
          { emoji: "✨", label: "AI POWERED" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              ...cardStyle,
              flex: 1,
              minWidth: 0,
              padding: "11px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 12 }}>{item.emoji}</span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.035em",
                color: C.sub,
                textAlign: "center",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Try again */}
      <button
        onClick={() => go(0)}
        style={{
          ...buttonStyle,
          background: "transparent",
          border: `1px solid ${C.glassBdr}`,
          color: C.sub,
          marginTop: 0,
        }}
      >
        🔄 Decide again
      </button>

      <div
        style={{
          textAlign: "center",
          color: C.muted,
          fontSize: 11,
          lineHeight: 1.6,
          padding: "0 12px",
        }}
      >
        Got your verdict? Send it to the group chat 👀
      </div>
    </div>
  );
}
