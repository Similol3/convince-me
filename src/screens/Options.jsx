
import { useState } from "react";
import { C, gr } from "../tokens";
import { CATEGORIES } from "../data/questions";
import { createCrewDecision } from "../lib/crewDecisions";

export default function Options({ go, category, user }) {
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [wantRec, setWantRec] = useState(false);

  const [sharingCrew, setSharingCrew] = useState(false);
  const [crewLink, setCrewLink] = useState(null);

  const cat = CATEGORIES[category] || CATEGORIES.general;

  // ── Existing decision logic ─────────────────────────────

  async function handleContinue() {
    setError("");
    setRecommendation(null);

    if (!optA.trim()) {
      setError("Please fill in Option A");
      return;
    }

    if (!optB.trim()) {
      setError("Please fill in Option B");
      return;
    }

    if (optA.trim().toLowerCase() === optB.trim().toLowerCase()) {
      setError("Both options are the same — enter two different things!");
      return;
    }

    if (category === "general") {
      if (wantRec) {
        setLoading(true);

        try {
          const r = await fetch("/api/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              optionA: optA.trim(),
              optionB: optB.trim(),
              category: "general",
              wantRecommendation: true,
            }),
          });

          const data = await r.json();

          if (data.recommendation) {
            setRecommendation(data.recommendation);
            setLoading(false);
            return;
          }
        } catch {
          /* fall through */
        }

        setLoading(false);
      }

      go(2, optA.trim(), optB.trim(), undefined, undefined, null);
      return;
    }

    setLoading(true);

    try {
      const r = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionA: optA.trim(),
          optionB: optB.trim(),
          category,
          wantRecommendation: wantRec,
        }),
      });

      const data = await r.json();

      if (!data.valid) {
        const examples = {
          food: `"${cat.placeholderA}" vs "${cat.placeholderB}"`,
          watch: `"${cat.placeholderA}" vs "${cat.placeholderB}"`,
        };

        setError(
          `These don't look like ${cat.label} options. Try something like ${
            examples[category] || "valid options"
          }.`
        );

        setLoading(false);
        return;
      }

      if (wantRec && data.recommendation) {
        setRecommendation(data.recommendation);
        setLoading(false);
        return;
      }

      setLoading(false);

      // Pass recommendation (null if none) so Reveal can use it
      go(2, optA.trim(), optB.trim(), undefined, undefined, null);
    } catch {
      setLoading(false);
      go(2, optA.trim(), optB.trim(), undefined, undefined, null);
    }
  }

  function proceedWithRec() {
    // Pass the recommendation into the decision flow
    go(2, optA.trim(), optB.trim(), undefined, undefined, recommendation);
  }

  function proceedWithoutRec() {
    setRecommendation(null);
    setOptA("");
    setOptB("");
    setError("");
  }

  async function handleAskCrew() {
    if (!optA.trim() || !optB.trim()) {
      setError("Fill in both options first");
      return;
    }

    if (!user?.id || user?.is_guest) {
      setError("Sign up to ask your crew");
      return;
    }

    setSharingCrew(true);

    const result = await createCrewDecision(
      user.id,
      optA.trim(),
      optB.trim(),
      category
    );

    setSharingCrew(false);

    if (result) {
      setCrewLink(result.shareUrl);
    } else {
      setError("Could not create — try again");
    }
  }

  const recLabel = {
    food: "Give me a food recommendation first",
    watch: "Recommend which I should watch based on my vibe",
    general: "Get an AI recommendation before we decide",
  };

  const recDesc = {
    food: "AI will explain which food suits your mood better",
    watch: "AI will recommend based on mood and what you want to feel",
    general: "AI will suggest which option is better for your situation",
  };

  // ── Visual styles ────────────────────────────────────────

  const panel = {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.085)",
    borderRadius: 22,
  };

  const smallLabel = {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.15em",
    color: C.muted,
  };

  const optionCard = (accent) => ({
    position: "relative",
    overflow: "hidden",
    borderRadius: 22,
    padding: "20px 18px",
    background: `linear-gradient(125deg, ${accent} 0%, rgba(255,255,255,0.025) 75%)`,
    border: `1px solid ${
      accent === "rgba(139,92,246,0.13)"
        ? "rgba(167,139,250,0.27)"
        : "rgba(23,198,217,0.27)"
    }`,
    minWidth: 0,
  });

  const inputStyle = {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    border: "none",
    outline: "none",
    background: "transparent",
    color: C.text,
    fontSize: 18,
    fontWeight: 750,
    letterSpacing: "-0.025em",
    lineHeight: 1.5,
    padding: "10px 0 4px",
    fontFamily: "inherit",
  };

  const secondaryButton = {
    width: "100%",
    minHeight: 54,
    borderRadius: 15,
    padding: "14px 16px",
    background: "rgba(23,198,217,0.075)",
    border: "1px solid rgba(23,198,217,0.32)",
    color: "#C7F8FC",
    fontSize: 13,
    fontWeight: 800,
    fontFamily: "inherit",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        minHeight: "100%",
        padding: "26px 18px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
        overflow: "hidden",
        color: C.text,
        background: C.bg,
        fontFamily: "inherit",
      }}
    >
      {/* Subtle background atmosphere */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -140,
          right: -150,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "rgba(139,92,246,0.12)",
          filter: "blur(85px)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 11px",
            borderRadius: 100,
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.09)",
            marginBottom: 22,
          }}
        >
          <span style={{ fontSize: 14 }}>{cat.emoji}</span>
          <span
            style={{
              ...smallLabel,
              color: "#DDD6FE",
              fontSize: 10,
            }}
          >
            {cat.label.toUpperCase()}
          </span>
          <span style={{ color: C.muted, fontSize: 10 }}>·</span>
          <span style={{ ...smallLabel, letterSpacing: "0.05em" }}>
            DECIDE IN 30s
          </span>
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.16em",
            color: C.grape || "#A78BFA",
            marginBottom: 9,
          }}
        >
          YOUR NEXT DECISION
        </div>

        <h1
          style={{
            fontSize: "clamp(27px, 7vw, 35px)",
            lineHeight: 1.12,
            letterSpacing: "-0.055em",
            fontWeight: 900,
            margin: "0 0 12px",
            color: "#FFFFFF",
          }}
        >
          Two options.
          <span
            style={{
              display: "block",
              background: "linear-gradient(100deg, #C4B5FD, #67E8F9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            One decision.
          </span>
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: 320,
            fontSize: 13,
            lineHeight: 1.65,
            color: C.sub,
          }}
        >
          {cat.inputHint}
        </p>
      </div>

      {/* Decision cards */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Option A */}
        <div style={optionCard("rgba(139,92,246,0.13)")}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span
              style={{
                ...smallLabel,
                color: "#C4B5FD",
              }}
            >
              01 / OPTION A
            </span>

            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#C4B5FD",
                background: "rgba(139,92,246,0.14)",
                borderRadius: 8,
                padding: "6px 9px",
              }}
            >
              FIRST CHOICE
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              marginTop: 15,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 47,
                height: 47,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                background: "rgba(139,92,246,0.16)",
                border: "1px solid rgba(167,139,250,0.18)",
                fontSize: 23,
              }}
            >
              {cat.emoji}
            </div>

            <input
              aria-label="Option A"
              value={optA}
              onChange={(e) => {
                setOptA(e.target.value);
                setError("");
                setRecommendation(null);
              }}
              placeholder={cat.placeholderA}
              style={inputStyle}
            />
          </div>

          <div
            style={{
              height: 2,
              marginTop: 15,
              borderRadius: 2,
              background:
                "linear-gradient(90deg, rgba(167,139,250,0.75), transparent)",
            }}
          />
        </div>

        {/* VS divider */}
        <div
          style={{
            height: 45,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 13,
            position: "relative",
            zIndex: 2,
            margin: "0 12px",
          }}
        >
          <div
            style={{
              height: 1,
              flex: 1,
              background: "rgba(255,255,255,0.11)",
            }}
          />

          <div
            style={{
              width: 37,
              height: 37,
              flexShrink: 0,
              borderRadius: 12,
              transform: "rotate(-8deg)",
              background: "#201A35",
              border: "1px solid rgba(196,181,253,0.3)",
              boxShadow: "0 5px 20px rgba(0,0,0,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
            }}
          >
            VS
          </div>

          <div
            style={{
              height: 1,
              flex: 1,
              background: "rgba(255,255,255,0.11)",
            }}
          />
        </div>

        {/* Option B */}
        <div style={optionCard("rgba(23,198,217,0.09)")}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span
              style={{
                ...smallLabel,
                color: "#67E8F9",
              }}
            >
              02 / OPTION B
            </span>

            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#67E8F9",
                background: "rgba(23,198,217,0.1)",
                borderRadius: 8,
                padding: "6px 9px",
              }}
            >
              SECOND CHOICE
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              marginTop: 15,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 47,
                height: 47,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                background: "rgba(23,198,217,0.12)",
                border: "1px solid rgba(103,232,249,0.18)",
                fontSize: 23,
              }}
            >
              {cat.emoji}
            </div>

            <input
              aria-label="Option B"
              value={optB}
              onChange={(e) => {
                setOptB(e.target.value);
                setError("");
                setRecommendation(null);
              }}
              placeholder={cat.placeholderB}
              style={inputStyle}
            />
          </div>

          <div
            style={{
              height: 2,
              marginTop: 15,
              borderRadius: 2,
              background:
                "linear-gradient(90deg, rgba(23,198,217,0.8), transparent)",
            }}
          />
        </div>
      </div>

      {/* AI recommendation switch */}
      <button
        type="button"
        onClick={() => setWantRec((w) => !w)}
        aria-pressed={wantRec}
        style={{
          ...panel,
          position: "relative",
          zIndex: 1,
          width: "100%",
          boxSizing: "border-box",
          padding: "17px 15px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          textAlign: "left",
          cursor: "pointer",
          fontFamily: "inherit",
          background: wantRec
            ? "rgba(139,92,246,0.105)"
            : panel.background,
          border: wantRec
            ? "1px solid rgba(167,139,250,0.36)"
            : panel.border,
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        <div
          style={{
            width: 39,
            height: 39,
            flexShrink: 0,
            borderRadius: 12,
            background: "rgba(139,92,246,0.13)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 19,
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
            {recLabel[category] || recLabel.general}
          </div>

          <div
            style={{
              fontSize: 11,
              color: C.muted,
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            {recDesc[category] || recDesc.general}
          </div>
        </div>

        {/* Visual toggle */}
        <div
          style={{
            width: 39,
            height: 23,
            flexShrink: 0,
            padding: 3,
            boxSizing: "border-box",
            borderRadius: 100,
            background: wantRec ? "#8B5CF6" : "rgba(255,255,255,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: wantRec ? "flex-end" : "flex-start",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: 17,
              height: 17,
              borderRadius: "50%",
              background: "#FFFFFF",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </button>

      {/* Error */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            borderRadius: 15,
            padding: "14px 15px",
            background: "rgba(239,68,68,0.09)",
            border: "1px solid rgba(248,113,113,0.25)",
          }}
        >
          <span style={{ fontSize: 16 }}>⚠️</span>

          <span
            style={{
              fontSize: 12,
              lineHeight: 1.6,
              color: "#FCA5A5",
              fontWeight: 650,
            }}
          >
            {error}
          </span>
        </div>
      )}

      {/* AI recommendation result */}
      {recommendation && (
        <div
          style={{
            ...panel,
            padding: 19,
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.035))",
            border: "1px solid rgba(167,139,250,0.28)",
            animation: "slideUp 0.35s ease",
          }}
        >
          <div
            style={{
              ...smallLabel,
              color: "#C4B5FD",
              marginBottom: 13,
            }}
          >
            ✨ YOUR AI RECOMMENDATION
          </div>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: "#F5F3FF",
              margin: "0 0 19px",
            }}
          >
            {recommendation}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={proceedWithRec}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: 13,
                background: gr(),
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Still let the app decide 🎲
            </button>

            <button
              type="button"
              onClick={proceedWithoutRec}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 13,
                background: "rgba(255,255,255,0.045)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Change options
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          marginTop: 3,
          display: "flex",
          flexDirection: "column",
          gap: 13,
        }}
      >
        {/* Main action */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          style={{
            width: "100%",
            minHeight: 58,
            padding: "16px 18px",
            border: "none",
            borderRadius: 16,
            background: gr(),
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: "0.025em",
            fontFamily: "inherit",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.65 : 1,
            boxShadow: "0 9px 26px rgba(139,92,246,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
          }}
        >
          {loading ? (
            <>
              <span>
                {wantRec ? "Getting recommendation..." : "Checking..."}
              </span>

              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.8)",
                    animation: `popIn 0.5s ${
                      i * 0.1
                    }s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </>
          ) : (
            <>
              LET'S DECIDE
              <span style={{ fontSize: 19, lineHeight: 1 }}>→</span>
            </>
          )}
        </button>

        {/* Secondary action divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "5px 2px",
          }}
        >
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.085)",
              flex: 1,
            }}
          />
          <span
            style={{
              ...smallLabel,
              fontSize: 10,
              letterSpacing: "0.09em",
            }}
          >
            OR GET A SECOND OPINION
          </span>
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.085)",
              flex: 1,
            }}
          />
        </div>

        {/* Ask Your Crew */}
        {!crewLink ? (
          <button
            type="button"
            onClick={handleAskCrew}
            disabled={sharingCrew}
            style={{
              ...secondaryButton,
              opacity: sharingCrew ? 0.6 : 1,
              cursor: sharingCrew ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>👥</span>
            {sharingCrew ? "Creating..." : "Ask Your Crew Instead"}
            {!sharingCrew && (
              <span
                style={{
                  fontSize: 17,
                  marginLeft: "auto",
                  lineHeight: 1,
                }}
              >
                ↗
              </span>
            )}
          </button>
        ) : (
          <div
            style={{
              borderRadius: 17,
              padding: 17,
              background: "rgba(23,198,217,0.075)",
              border: "1px solid rgba(23,198,217,0.3)",
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 16 }}>✅</span>

              <span
                style={{
                  ...smallLabel,
                  color: "#67E8F9",
                  letterSpacing: "0.09em",
                }}
              >
                LINK READY — SEND TO FRIENDS
              </span>
            </div>

            <div
              style={{
                padding: "12px",
                background: "rgba(0,0,0,0.15)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                color: "#FFFFFF",
                fontSize: 12,
                lineHeight: 1.6,
                wordBreak: "break-all",
                marginBottom: 12,
              }}
            >
              {crewLink}
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(crewLink);
              }}
              style={secondaryButton}
            >
              📋 Copy Link
            </button>
          </div>
        )}

        <p
          style={{
            margin: "1px 0 0",
            textAlign: "center",
            fontSize: 11,
            lineHeight: 1.5,
            color: C.muted,
          }}
        >
          Your decision. Your call.
        </p>
      </div>
    </div>
  );
}
