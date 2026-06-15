import { useState } from "react";
import { C, gr } from "../tokens";
import { generateMessage } from "../lib/ai";
import { addConnectHistory, getConnectHistory } from "../lib/storage";
import { AUDIENCES, TONES } from "../data/ConnectOptions";
import { FREE_DAILY_CONNECT_LIMIT } from "../data/pricing";

const SITUATIONS = [
  {
    id: "reply_story",
    emoji: "📸",
    title: "Reply to their story",
    desc: "Upload a screenshot — get something to say about it",
  },
  {
    id: "start_chat",
    emoji: "💬",
    title: "Start a conversation",
    desc: "Break the ice with someone new",
  },
  {
    id: "reply_text",
    emoji: "💭",
    title: "Reply to what they said",
    desc: "They told you something — craft a good reply",
  },
];

const backBtn = {
  background: "transparent",
  border: "none",
  color: C.muted,
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "inherit",
  padding: 0,
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const pageTitle = { fontSize: 22, fontWeight: 900, color: "white", margin: 0 };
const pageSub = { fontSize: 13, color: C.sub, margin: "6px 0 0" };

const optionCard = {
  background: C.glass,
  border: `1px solid ${C.glassBdr}`,
  borderRadius: 16,
  padding: "20px 14px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  fontFamily: "inherit",
};

export default function Connect({ user, go }) {
  const [step, setStep] = useState("pick"); // pick | audience | tone | input | result | history | limit
  const [situation, setSituation] = useState(null);
  const [audience, setAudience] = useState(null);
  const [tone, setTone] = useState(null);
  const [context, setContext] = useState("");
  const [image, setImage] = useState(null);
  const [picked, setPicked] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPro = user?.is_pro || false;

  function getTodayCount() {
    const today = new Date().toISOString().split("T")[0];
    const stored = JSON.parse(localStorage.getItem("cm_connect_count") || "{}");
    return stored.date === today ? stored.count : 0;
  }
  function incrementTodayCount() {
    const today = new Date().toISOString().split("T")[0];
    const current = getTodayCount();
    localStorage.setItem(
      "cm_connect_count",
      JSON.stringify({ date: today, count: current + 1 })
    );
  }

  const todayCount = getTodayCount();
  const limitReached = !isPro && todayCount >= FREE_DAILY_CONNECT_LIMIT;

  function selectSituation(sit) {
    setSituation(sit);
    setStep("audience");
  }
  function selectAudience(a) {
    setAudience(a);
    setStep("tone");
  }
  function selectTone(t) {
    setTone(t);
    setStep("input");
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (limitReached) {
      setStep("limit");
      return;
    }

    setLoading(true);
    setStep("result");

    const text = await generateMessage(
      situation.id,
      context,
      image,
      audience?.id,
      tone?.id
    );
    setPicked(text);

    addConnectHistory({
      situationId: situation.id,
      situationEmoji: situation.emoji,
      situationTitle: situation.title,
      audience: audience?.label,
      tone: tone?.label,
      context,
      message: text,
    });

    if (!isPro) incrementTodayCount();
    setLoading(false);
  }

  function copyText() {
    navigator.clipboard.writeText(picked);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function reset() {
    setStep("pick");
    setSituation(null);
    setAudience(null);
    setTone(null);
    setContext("");
    setImage(null);
    setPicked(null);
    setCopied(false);
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "just now";
  }

  return (
    <div
      style={{
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        minHeight: "100%",
        background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(6,182,212,0.18) 0%, ${C.bg} 60%)`,
      }}
    >
      {/* ── PICK SITUATION ── */}
      {step === "pick" && (
        <>
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: "white",
                margin: 0,
              }}
            >
              Need something to say?
            </h1>
            <p style={pageSub}>
              Pick a situation and we'll craft the right words.
            </p>
          </div>

          {!isPro && (
            <div style={{ fontSize: 12, color: C.muted }}>
              {FREE_DAILY_CONNECT_LIMIT - todayCount} free messages left today
            </div>
          )}

          <button
            onClick={() => setStep("history")}
            style={{
              background: C.glass,
              border: `1px solid ${C.glassBdr}`,
              borderRadius: 14,
              padding: "12px 16px",
              cursor: "pointer",
              width: "100%",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🕓</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                Recent messages
              </span>
            </div>
            <span style={{ color: C.muted, fontSize: 16 }}>›</span>
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SITUATIONS.map((sit) => (
              <button
                key={sit.id}
                onClick={() => selectSituation(sit)}
                style={{
                  background: C.glass,
                  border: `1px solid ${C.glassBdr}`,
                  borderRadius: 18,
                  padding: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "rgba(6,182,212,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {sit.emoji}
                </div>
                <div>
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: "white" }}
                  >
                    {sit.title}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    {sit.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── AUDIENCE ── */}
      {step === "audience" && situation && (
        <>
          <button onClick={() => setStep("pick")} style={backBtn}>
            ← Back
          </button>
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>
              {situation.emoji}
            </div>
            <h2 style={pageTitle}>Who's this for?</h2>
            <p style={pageSub}>This helps us nail the right tone</p>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {AUDIENCES.map((a) => (
              <button
                key={a.id}
                onClick={() => selectAudience(a)}
                style={optionCard}
              >
                <span style={{ fontSize: 28 }}>{a.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── TONE ── */}
      {step === "tone" && situation && (
        <>
          <button onClick={() => setStep("audience")} style={backBtn}>
            ← Back
          </button>
          <div>
            <h2 style={pageTitle}>What's the vibe?</h2>
            <p style={pageSub}>Pick the tone for your message</p>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTone(t)}
                style={optionCard}
              >
                <span style={{ fontSize: 28 }}>{t.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── INPUT ── */}
      {step === "input" && situation && (
        <>
          <button onClick={() => setStep("tone")} style={backBtn}>
            ← Back
          </button>

          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>
              {situation.emoji}
            </div>
            <h2 style={pageTitle}>{situation.title}</h2>
            <p style={pageSub}>
              {situation.id === "reply_story"
                ? "Upload a screenshot for a tailored reply"
                : "Add a quick detail for a more personal message"}
            </p>
          </div>

          {/* Selected audience/tone chips */}
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                background: C.glass,
                border: `1px solid ${C.glassBdr}`,
                borderRadius: 99,
                padding: "6px 12px",
                fontSize: 12,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{audience?.emoji}</span> {audience?.label}
            </div>
            <div
              style={{
                background: C.glass,
                border: `1px solid ${C.glassBdr}`,
                borderRadius: 99,
                padding: "6px 12px",
                fontSize: 12,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{tone?.emoji}</span> {tone?.label}
            </div>
          </div>

          {situation.id === "reply_story" && (
            <div>
              {!image ? (
                <label
                  style={{
                    background: C.glass,
                    border: `1px dashed ${C.glassBdr}`,
                    borderRadius: 16,
                    padding: "32px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 28 }}>📤</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.sub }}>
                    Tap to upload a screenshot
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
              ) : (
                <div style={{ position: "relative" }}>
                  <img
                    src={image}
                    alt="Story"
                    style={{
                      width: "100%",
                      borderRadius: 16,
                      maxHeight: 280,
                      objectFit: "cover",
                      border: `1px solid ${C.glassBdr}`,
                    }}
                  />
                  <button
                    onClick={() => setImage(null)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "rgba(0,0,0,0.6)",
                      border: "none",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      color: "white",
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              background: C.glass,
              border: `1px solid ${C.glassBdr}`,
              borderRadius: 16,
              padding: "16px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: C.muted,
                margin: "0 0 10px",
              }}
            >
              {situation.id === "reply_text"
                ? "WHAT DID THEY SAY?"
                : "CONTEXT (OPTIONAL)"}
            </p>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={
                situation.id === "reply_story"
                  ? "e.g. It's a beach photo from their trip..."
                  : situation.id === "start_chat"
                  ? "e.g. We both like gaming, met at school..."
                  : "e.g. They told me they failed a test today..."
              }
              rows={3}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: C.text,
                fontSize: 14,
                fontWeight: 500,
                outline: "none",
                fontFamily: "inherit",
                resize: "none",
              }}
            />
          </div>

          <button
            onClick={generate}
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
            Generate Message ✨
          </button>
        </>
      )}

      {/* ── RESULT ── */}
      {step === "result" && (
        <>
          <button onClick={() => setStep("input")} style={backBtn}>
            ← Back
          </button>

          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: C.muted,
              margin: 0,
            }}
          >
            {loading ? "GENERATING..." : "HERE'S WHAT TO SEND"}
          </p>

          <div
            style={{
              background: gr(145),
              borderRadius: 24,
              padding: "24px 20px",
              boxShadow: "0 20px 50px rgba(6,182,212,0.25)",
              minHeight: 100,
              display: "flex",
              alignItems: "center",
            }}
          >
            {loading ? (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.6)",
                      animation: `popIn 0.6s ${
                        i * 0.15
                      }s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 30, marginBottom: 12 }}>
                  {situation.emoji}
                </div>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "white",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  "{picked}"
                </p>
              </div>
            )}
          </div>

          {!loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={copyText}
                style={{
                  background: copied ? C.emerald : C.glass,
                  border: `1px solid ${copied ? C.emerald : C.glassBdr}`,
                  borderRadius: 14,
                  padding: "16px",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {copied ? "✓ Copied!" : "📋 Copy Message"}
              </button>

              <button
                onClick={generate}
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
                🔄 Generate Another
              </button>

              <button
                onClick={reset}
                style={{
                  background: "transparent",
                  border: "none",
                  color: C.muted,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                Start Over
              </button>
            </div>
          )}
        </>
      )}

      {/* ── HISTORY ── */}
      {step === "history" && (
        <>
          <button onClick={() => setStep("pick")} style={backBtn}>
            ← Back
          </button>
          <h2 style={pageTitle}>Recent Messages</h2>

          {getConnectHistory().length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 14, color: C.muted }}>
                No messages generated yet
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {getConnectHistory().map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: C.glass,
                    border: `1px solid ${C.glassBdr}`,
                    borderRadius: 16,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: 16 }}>
                        {item.situationEmoji}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.muted,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {item.situationTitle.toUpperCase()}
                      </span>
                      {item.audience && (
                        <span style={{ fontSize: 10, color: C.gold }}>
                          · {item.audience}
                        </span>
                      )}
                      {item.tone && (
                        <span style={{ fontSize: 10, color: C.teal }}>
                          · {item.tone}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: C.muted }}>
                      {timeAgo(item.timestamp)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "white",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    "{item.message}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── LIMIT REACHED ── */}
      {step === "limit" && (
        <div style={{ textAlign: "center", padding: "40px 16px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "white",
              margin: "0 0 8px",
            }}
          >
            Daily limit reached
          </h2>
          <p
            style={{
              fontSize: 13,
              color: C.sub,
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            You've used your {FREE_DAILY_CONNECT_LIMIT} free messages today.
            Upgrade for unlimited access, or come back tomorrow!
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => go(13)}
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
              }}
            >
              Upgrade to Pro 👑
            </button>
            <button
              onClick={reset}
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
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
