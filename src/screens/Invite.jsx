import { useState, useEffect } from "react";
import { C, gr } from "../tokens";

const APP_URL = "https://convince-me-tau.vercel.app";

const card = {
  background: C.glass,
  border: `1px solid ${C.glassBdr}`,
  borderRadius: 18,
  padding: 18,
};

const sectionTitle = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.1em",
  color: C.muted,
  margin: "0 0 14px",
};

export default function Invite({ user }) {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copyMessage, setCopyMessage] = useState(-1);

  useEffect(() => {
    let active = true;

    if (!user?.id || user?.is_guest) {
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`/api/invite?action=code&userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setCode(data.code || "");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Invite code error:", error);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const inviteLink = `${APP_URL}?ref=${code}`;
  const inviteCount = user?.invite_count || 0;
  const bonusDecisions = user?.bonus_decisions || 0;

  async function copyLink() {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  async function shareLink() {
    if (!code) return;

    const text = `I've been using Convince Me to make decisions in 30 seconds — it's actually useful 😭

Join with my link and get 5 bonus decisions free:
${inviteLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Convince Me",
          text,
        });
      } catch {
        // User cancelled sharing.
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Share copy failed:", error);
      }
    }
  }

  async function copyTemplate(text, index) {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(index);
      setTimeout(() => setCopyMessage(-1), 1500);
    } catch (error) {
      console.error("Template copy failed:", error);
    }
  }

  if (user?.is_guest) {
    return (
      <div
        style={{
          minHeight: "100%",
          padding: "65px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 14,
          background: C.bg,
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            background: "rgba(139,92,246,0.12)",
            border: "1px solid rgba(139,92,246,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}
        >
          🔗
        </div>

        <h2
          style={{
            fontSize: 21,
            fontWeight: 900,
            color: "white",
            margin: 0,
          }}
        >
          Invite your friends
        </h2>

        <p
          style={{
            maxWidth: 290,
            fontSize: 13,
            color: C.sub,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Create a free account to get your personal invite link and earn bonus
          decisions.
        </p>
      </div>
    );
  }

  const steps = [
    {
      emoji: "🔗",
      title: "Share your link",
      desc: "Send it on WhatsApp, Instagram, or anywhere.",
    },
    {
      emoji: "✅",
      title: "They sign up",
      desc: "Your friend creates an account using your link.",
    },
    {
      emoji: "⚡",
      title: "You both win",
      desc: "You get +1 daily decision permanently. They get +5 bonus decisions on day one.",
    },
  ];

  const templates = [
    {
      platform: "💬 WhatsApp",
      text: `Bro you NEED this app 😭 It literally makes decisions for you in 30 seconds. Join with my link and get 5 free bonus decisions → ${inviteLink}`,
    },
    {
      platform: "📸 Instagram DM",
      text: `okay this app is actually useful lol it decides things for you + helps you figure out what to say to people. get 5 bonus decisions when you sign up with my link → ${inviteLink}`,
    },
    {
      platform: "🐦 Twitter/X",
      text: `stop overthinking decisions. this app does it for you in 30 seconds (no cap) → ${inviteLink}`,
    },
  ];

  return (
    <div
      style={{
        boxSizing: "border-box",
        padding: "26px 16px 38px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        minHeight: "100%",
        background: `radial-gradient(ellipse 90% 40% at 50% 0%, rgba(139,92,246,0.15) 0%, ${C.bg} 75%)`,
      }}
    >
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: 25,
            fontWeight: 900,
            color: "white",
            margin: 0,
            letterSpacing: "-0.6px",
          }}
        >
          Invite Friends 🔗
        </h1>

        <p
          style={{
            fontSize: 13,
            color: C.sub,
            margin: "7px 0 0",
            lineHeight: 1.6,
          }}
        >
          Good things are better shared. You both get rewarded.
        </p>
      </div>

      {/* How it works */}
      <div style={card}>
        <p style={sectionTitle}>HOW IT WORKS</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {steps.map((step, i) => (
            <div
              key={step.title}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "rgba(139,92,246,0.13)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {step.emoji}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  {step.title}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: C.muted,
                    marginTop: 4,
                    lineHeight: 1.55,
                  }}
                >
                  {step.desc}
                </div>
              </div>

              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: C.muted,
                }}
              >
                0{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {[
          {
            emoji: "👥",
            value: inviteCount,
            label: "Friends invited",
            color: C.grape,
          },
          {
            emoji: "⚡",
            value: `+${bonusDecisions}`,
            label: "Bonus decisions earned",
            color: C.emerald,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              ...card,
              padding: "17px 10px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 19, marginBottom: 7 }}>{item.emoji}</div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: item.color,
              }}
            >
              {item.value}
            </div>

            <div
              style={{
                fontSize: 11,
                color: C.muted,
                marginTop: 5,
                lineHeight: 1.4,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      {inviteCount < 7 ? (
        <div style={{ ...card, padding: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 11,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "white",
              }}
            >
              Invite progress
            </span>

            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: C.grape,
              }}
            >
              {inviteCount}/7
            </span>
          </div>

          <div
            style={{
              height: 8,
              background: "rgba(255,255,255,0.07)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(
                  100,
                  Math.max(0, (inviteCount / 7) * 100)
                )}%`,
                background: gr(),
                borderRadius: 999,
                transition: "width 0.4s ease",
              }}
            />
          </div>

          <div
            style={{
              fontSize: 11,
              color: C.muted,
              marginTop: 10,
              lineHeight: 1.5,
            }}
          >
            {7 - inviteCount} more invites to reach the maximum bonus (+7 daily
            decisions).
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 16,
            padding: 17,
            textAlign: "center",
            color: C.emerald,
            fontSize: 13,
            fontWeight: 800,
            lineHeight: 1.5,
          }}
        >
          🏆 Max bonus reached! You've earned +7 daily decisions permanently.
        </div>
      )}

      {/* Invite link */}
      <div
        style={{
          background: "rgba(139,92,246,0.07)",
          border: "1px solid rgba(139,92,246,0.28)",
          borderRadius: 18,
          padding: 17,
        }}
      >
        <p
          style={{
            ...sectionTitle,
            color: C.grape,
            marginBottom: 10,
          }}
        >
          YOUR PERSONAL LINK
        </p>

        {loading ? (
          <div
            style={{
              fontSize: 12,
              color: C.muted,
              padding: "12px 0",
            }}
          >
            Generating your link...
          </div>
        ) : code ? (
          <>
            <div
              style={{
                fontSize: 12,
                color: "white",
                fontWeight: 600,
                lineHeight: 1.6,
                wordBreak: "break-all",
                marginBottom: 14,
              }}
            >
              {inviteLink}
            </div>

            <button
              onClick={copyLink}
              style={{
                width: "100%",
                padding: 12,
                background: copied ? "rgba(16,185,129,0.18)" : C.glass,
                border: `1px solid ${copied ? C.emerald : C.glassBdr}`,
                borderRadius: 11,
                color: copied ? C.emerald : "white",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {copied ? "✓ Link Copied!" : "📋 Copy Invite Link"}
            </button>
          </>
        ) : (
          <div style={{ fontSize: 12, color: C.muted }}>
            Couldn't generate your invite link. Please try again later.
          </div>
        )}
      </div>

      {/* Main share button */}
      <button
        onClick={shareLink}
        disabled={loading || !code}
        style={{
          background: gr(),
          border: "none",
          borderRadius: 14,
          padding: 16,
          color: "white",
          fontSize: 14,
          fontWeight: 800,
          cursor: loading || !code ? "not-allowed" : "pointer",
          opacity: loading || !code ? 0.5 : 1,
          width: "100%",
          fontFamily: "inherit",
          boxShadow: "0 7px 22px rgba(139,92,246,0.16)",
        }}
      >
        🔗 Share with Friends
      </button>

      {/* Message templates */}
      <div>
        <p style={sectionTitle}>READY-TO-SEND MESSAGES</p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {templates.map((msg, i) => (
            <div
              key={msg.platform}
              style={{
                ...card,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: C.sub,
                  marginBottom: 9,
                }}
              >
                {msg.platform}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "white",
                  lineHeight: 1.65,
                  marginBottom: 13,
                }}
              >
                {msg.text}
              </div>

              <button
                onClick={() => copyTemplate(msg.text, i)}
                disabled={!code}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${C.glassBdr}`,
                  borderRadius: 9,
                  padding: "9px 12px",
                  color: copyMessage === i ? C.emerald : C.sub,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: code ? "pointer" : "not-allowed",
                  opacity: code ? 1 : 0.5,
                  fontFamily: "inherit",
                }}
              >
                {copyMessage === i ? "✓ Copied!" : "📋 Copy this message"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
