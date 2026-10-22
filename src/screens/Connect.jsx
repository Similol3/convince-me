import { useState } from "react";
import { C, gr } from "../tokens";
import { generateMessage } from "../lib/ai";
import { addConnectHistory, getConnectHistory } from "../lib/storage";
import { FREE_DAILY_CONNECT_LIMIT } from "../data/pricing";

const POST_VIBES = [
  {
    id: "hyped",
    emoji: "🔥",
    label: "Hype them up",
    desc: "Big energy, show love",
  },
  {
    id: "curious",
    emoji: "👀",
    label: "Ask about it",
    desc: "Show genuine curiosity",
  },
  {
    id: "flirty",
    emoji: "😏",
    label: "Flirt a little",
    desc: "Playful and confident",
  },
  {
    id: "funny",
    emoji: "😂",
    label: "Make them laugh",
    desc: "Light and witty",
  },
  { id: "sweet", emoji: "🥺", label: "Be sweet", desc: "Warm and genuine" },
  {
    id: "impressed",
    emoji: "😮",
    label: "Show you noticed",
    desc: "React to the detail",
  },
];
const POST_RELATIONSHIP = [
  { id: "crush", emoji: "😍", label: "Crush" },
  { id: "friend", emoji: "👫", label: "Close Friend" },
  { id: "partner", emoji: "💑", label: "Partner" },
  { id: "stranger", emoji: "👋", label: "Someone New" },
  { id: "ex", emoji: "💔", label: "Ex" },
  { id: "group", emoji: "👯", label: "Group / Anyone" },
];
const OPENER_TYPE = [
  {
    id: "smooth",
    emoji: "😎",
    label: "Smooth opener",
    desc: "Confident, natural",
  },
  {
    id: "compliment",
    emoji: "✨",
    label: "Lead with a compliment",
    desc: "Specific, genuine",
  },
  {
    id: "funny",
    emoji: "😂",
    label: "Funny / witty",
    desc: "Make them smile first",
  },
  {
    id: "check_in",
    emoji: "👋",
    label: "Casual check-in",
    desc: "Low pressure, easy",
  },
  {
    id: "invite",
    emoji: "🎉",
    label: "Invite them out",
    desc: "Bold, direct invite",
  },
  {
    id: "reconnect",
    emoji: "🔁",
    label: "Reconnect",
    desc: "You haven't talked in a while",
  },
];
const CHAT_RELATIONSHIP = [
  { id: "crush", emoji: "😍", label: "Crush" },
  { id: "friend", emoji: "👫", label: "Friend" },
  { id: "colleague", emoji: "💼", label: "Colleague" },
  { id: "stranger", emoji: "👋", label: "Don't know them" },
  { id: "ex", emoji: "💔", label: "Ex" },
  { id: "online", emoji: "📱", label: "Met online" },
];
const CHAT_ENERGY = [
  { id: "uk_slang", emoji: "🇬🇧", label: "UK / Street" },
  { id: "casual", emoji: "😊", label: "Chill & casual" },
  { id: "romantic", emoji: "🥰", label: "Romantic" },
  { id: "formal", emoji: "🎩", label: "Professional" },
  { id: "hype", emoji: "🔥", label: "High energy" },
  { id: "short", emoji: "⚡", label: "Short & direct" },
];
const MESSAGE_SITUATION = [
  {
    id: "bad_day",
    emoji: "😔",
    label: "They're going through something",
    desc: "Sad, stressed, venting",
  },
  {
    id: "good_news",
    emoji: "🎉",
    label: "They shared good news",
    desc: "Excited, celebrating",
  },
  {
    id: "miss_you",
    emoji: "💭",
    label: "They said they miss you",
    desc: "Emotional, reconnecting",
  },
  {
    id: "conflict",
    emoji: "😤",
    label: "There's tension between you",
    desc: "Argument, awkward silence",
  },
  {
    id: "flirting",
    emoji: "😏",
    label: "They're flirting",
    desc: "Playful, testing the waters",
  },
  {
    id: "casual",
    emoji: "💬",
    label: "Normal conversation",
    desc: "Just chatting, relaxed",
  },
  {
    id: "asking",
    emoji: "❓",
    label: "They asked you something",
    desc: "A question or request",
  },
  {
    id: "apologised",
    emoji: "🙏",
    label: "They apologised",
    desc: "Saying sorry for something",
  },
];
const REPLY_STYLE = [
  {
    id: "supportive",
    emoji: "🤗",
    label: "Supportive",
    desc: "Warm, caring, present",
  },
  {
    id: "flirty",
    emoji: "😏",
    label: "Flirty",
    desc: "Playful, keep them hooked",
  },
  {
    id: "uk_slang",
    emoji: "🇬🇧",
    label: "UK / Street",
    desc: "Fam, innit, peng energy",
  },
  { id: "funny", emoji: "😂", label: "Funny", desc: "Lighten the mood" },
  {
    id: "real_talk",
    emoji: "💯",
    label: "Real talk",
    desc: "Direct and honest",
  },
  { id: "soft", emoji: "🥺", label: "Soft & sweet", desc: "Gentle, genuine" },
  {
    id: "apologetic",
    emoji: "🙏",
    label: "Apologetic",
    desc: "Own it, make it right",
  },
  {
    id: "hype",
    emoji: "🔥",
    label: "Hype them up",
    desc: "Big energy response",
  },
];
const REPLY_RELATIONSHIP = [
  { id: "crush", emoji: "😍", label: "Crush" },
  { id: "partner", emoji: "💑", label: "Partner / Bae" },
  { id: "friend", emoji: "👫", label: "Close Friend" },
  { id: "family", emoji: "👨‍👩‍👧", label: "Family" },
  { id: "ex", emoji: "💔", label: "Ex" },
  { id: "other", emoji: "👤", label: "Someone else" },
];

const panel = {
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 19,
};
const eyebrow = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.13em",
  color: C.muted,
};
const backBtn = {
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 11,
  color: "#DDD6FE",
  fontSize: 12,
  fontWeight: 750,
  cursor: "pointer",
  fontFamily: "inherit",
  padding: "10px 13px",
  alignSelf: "flex-start",
};
const textArea = {
  width: "100%",
  boxSizing: "border-box",
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 14,
  lineHeight: 1.65,
  fontWeight: 500,
  outline: "none",
  fontFamily: "inherit",
  resize: "vertical",
};
const inputBox = {
  width: "100%",
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  padding: "15px",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
const gradients = {
  reply_story: "linear-gradient(105deg,#EC4899,#F43F5E)",
  start_chat: "linear-gradient(105deg,#06B6D4,#0EA5E9)",
  reply_text: "linear-gradient(105deg,#8B5CF6,#A78BFA)",
};
const accents = {
  reply_story: "#F9A8D4",
  start_chat: "#67E8F9",
  reply_text: "#C4B5FD",
};

function Grid({
  items,
  selected,
  onSelect,
  columns = 2,
  showDesc = false,
  accent = "#A78BFA",
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`,
        gap: 10,
      }}
    >
      {items.map((item) => {
        const on = selected?.id === item.id;
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onSelect(item)}
            style={{
              ...panel,
              minWidth: 0,
              padding: showDesc ? "17px 12px" : "16px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 7,
              background: on ? `${accent}19` : panel.background,
              border: on ? `1px solid ${accent}99` : panel.border,
              transition: "background .15s,border-color .15s",
            }}
          >
            <span style={{ fontSize: 25 }}>{item.emoji}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: on ? accent : "white",
                lineHeight: 1.4,
              }}
            >
              {item.label}
            </span>
            {showDesc && item.desc && (
              <span style={{ fontSize: 10, color: C.muted, lineHeight: 1.5 }}>
                {item.desc}
              </span>
            )}
            {on && (
              <span style={{ color: accent, fontSize: 11, fontWeight: 900 }}>
                ✓ SELECTED
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
function ImageUpload({ image, onUpload, onRemove, label, sublabel }) {
  return !image ? (
    <label
      style={{
        ...panel,
        border: "1px dashed rgba(196,181,253,0.35)",
        padding: "20px 16px",
        display: "flex",
        alignItems: "center",
        gap: 13,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: 43,
          height: 43,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          borderRadius: 12,
          background: "rgba(139,92,246,0.13)",
          fontSize: 23,
        }}
      >
        📷
      </span>
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.4,
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: "block",
            fontSize: 11,
            color: C.muted,
            marginTop: 5,
          }}
        >
          {sublabel}
        </span>
      </span>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onUpload(reader.result);
          reader.readAsDataURL(file);
        }}
        style={{ display: "none" }}
      />
    </label>
  ) : (
    <div style={{ position: "relative" }}>
      <img
        src={image}
        alt="Uploaded context"
        style={{
          width: "100%",
          display: "block",
          boxSizing: "border-box",
          borderRadius: 17,
          maxHeight: 220,
          objectFit: "cover",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        style={{
          position: "absolute",
          top: 9,
          right: 9,
          background: "rgba(0,0,0,0.8)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50%",
          width: 32,
          height: 32,
          color: "white",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        ✕
      </button>
    </div>
  );
}
function SectionHeader({ emoji, title, subtitle, accent = "#C4B5FD" }) {
  return (
    <div style={{ padding: "8px 0 4px" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "7px 10px",
          background: `${accent}15`,
          border: `1px solid ${accent}44`,
          borderRadius: 99,
          color: accent,
          ...eyebrow,
          marginBottom: 15,
        }}
      >
        <span>{emoji}</span>
        {subtitle}
      </div>
      <h1
        style={{
          color: "white",
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          lineHeight: 1.15,
          margin: 0,
        }}
      >
        {title}
      </h1>
    </div>
  );
}
function Field({ label, children, accent = "#C4B5FD" }) {
  return (
    <div style={{ ...panel, padding: "16px" }}>
      <div style={{ ...eyebrow, color: accent, marginBottom: 11 }}>{label}</div>
      {children}
    </div>
  );
}
function Primary({ children, onClick, disabled, gradient = gr() }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        boxSizing: "border-box",
        background: disabled ? "rgba(255,255,255,0.09)" : gradient,
        border: "none",
        borderRadius: 16,
        padding: "17px 16px",
        minHeight: 56,
        color: "white",
        fontSize: 14,
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        opacity: disabled ? 0.5 : 1,
        boxShadow: disabled ? "none" : "0 10px 24px rgba(0,0,0,0.14)",
      }}
    >
      {children}
    </button>
  );
}
function Chips({ items, value, setValue, accent }) {
  return (
    <div>
      <div style={{ ...eyebrow, marginBottom: 11 }}>QUICK FILL</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((chip) => (
          <button
            type="button"
            key={chip}
            onClick={() => setValue((p) => (p ? `${p}, ${chip}` : chip))}
            style={{
              borderRadius: 99,
              padding: "9px 12px",
              background: value.includes(chip)
                ? `${accent}22`
                : "rgba(255,255,255,0.045)",
              border: `1px solid ${
                value.includes(chip) ? `${accent}77` : "rgba(255,255,255,0.11)"
              }`,
              color: "white",
              fontSize: 11,
              fontWeight: 650,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Connect({ user, go }) {
  const [step, setStep] = useState("pick");
  const [situation, setSituation] = useState(null);
  const [postRelationship, setPostRelationship] = useState(null);
  const [postVibe, setPostVibe] = useState(null);
  const [postImage, setPostImage] = useState(null);
  const [postImage2, setPostImage2] = useState(null);
  const [postContext, setPostContext] = useState("");
  const [personName1, setPersonName1] = useState("");
  const [chatRelationship, setChatRelationship] = useState(null);
  const [openerType, setOpenerType] = useState(null);
  const [chatEnergy, setChatEnergy] = useState(null);
  const [chatContext, setChatContext] = useState("");
  const [personName2, setPersonName2] = useState("");
  const [personHandle, setPersonHandle] = useState("");
  const [replyRelationship, setReplyRelationship] = useState(null);
  const [whatTheySaid, setWhatTheySaid] = useState("");
  const [messageSituation, setMessageSituation] = useState(null);
  const [replyStyle, setReplyStyle] = useState(null);
  const [pastImage, setPastImage] = useState(null);
  const [pastMessages, setPastMessages] = useState("");
  const [personName3, setPersonName3] = useState("");
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

  async function generate() {
    if (limitReached) {
      setStep("limit");
      return;
    }
    setLoading(true);
    setStep("result");
    let payload = {};
    if (situation === "reply_story") {
      payload = {
        situationId: "reply_story",
        context: postContext,
        image: postImage,
        audience: postRelationship?.id,
        tone: postVibe?.id,
        purpose: "react",
        personName: personName1.trim(),
        pastMessages: "",
        pastImage: null,
      };
    } else if (situation === "start_chat") {
      payload = {
        situationId: "start_chat",
        context: chatContext,
        image: null,
        audience: chatRelationship?.id,
        tone: chatEnergy?.id,
        purpose: openerType?.id,
        personName: personName2.trim(),
        personHandle: personHandle.trim(),
        pastMessages: "",
        pastImage: null,
      };
    } else {
      payload = {
        situationId: "reply_text",
        context: whatTheySaid,
        image: null,
        audience: replyRelationship?.id,
        tone: replyStyle?.id,
        purpose: messageSituation?.id,
        personName: personName3.trim(),
        pastMessages: pastMessages.trim(),
        pastImage,
      };
    }
    const text = await generateMessage(payload);
    setPicked(text);
    addConnectHistory({
      situationId: payload.situationId,
      situationEmoji:
        situation === "reply_story"
          ? "📸"
          : situation === "start_chat"
          ? "💬"
          : "💭",
      situationTitle:
        situation === "reply_story"
          ? "Reply to post"
          : situation === "start_chat"
          ? "Start conversation"
          : "Reply to message",
      personName: payload.personName,
      audience: payload.audience,
      tone: payload.tone,
      context: payload.context,
      message: text,
    });
    if (!isPro) incrementTodayCount();
    setLoading(false);
  }
  function copyText() {
    navigator.clipboard.writeText(picked);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  function reset() {
    setStep("pick");
    setSituation(null);
    setPostRelationship(null);
    setPostVibe(null);
    setPostImage(null);
    setPostImage2(null);
    setPostContext("");
    setPersonName1("");
    setChatRelationship(null);
    setOpenerType(null);
    setChatEnergy(null);
    setChatContext("");
    setPersonName2("");
    setPersonHandle("");
    setReplyRelationship(null);
    setWhatTheySaid("");
    setMessageSituation(null);
    setReplyStyle(null);
    setPastImage(null);
    setPastMessages("");
    setPersonName3("");
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
  const accent = accents[situation] || "#C4B5FD";
  const gradient = gradients[situation] || gr();
  const wrapper = {
    position: "relative",
    padding: "26px 18px 36px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    minHeight: "100%",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
    background: C.bg,
    color: "white",
    fontFamily: "inherit",
  };
  return (
    <div style={wrapper}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -150,
          right: -130,
          width: 340,
          height: 340,
          borderRadius: "50%",
          background:
            situation === "reply_story"
              ? "rgba(236,72,153,0.13)"
              : situation === "start_chat"
              ? "rgba(6,182,212,0.13)"
              : "rgba(139,92,246,0.15)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      {step === "pick" && (
        <>
          <div style={{ position: "relative" }}>
            <span style={{ ...eyebrow, color: "#67E8F9" }}>
              YOUR SOCIAL CO-PILOT
            </span>
            <h1
              style={{
                fontSize: "clamp(29px,8vw,36px)",
                lineHeight: 1.12,
                letterSpacing: "-0.055em",
                fontWeight: 900,
                margin: "12px 0",
              }}
            >
              Find the right{" "}
              <span
                style={{
                  display: "block",
                  background: "linear-gradient(100deg,#C4B5FD,#67E8F9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                words to say.
              </span>
            </h1>
            <p
              style={{ fontSize: 13, color: C.sub, lineHeight: 1.7, margin: 0 }}
            >
              A little help for the messages you don't want to overthink.
            </p>
          </div>
          {!isPro && (
            <div style={{ ...panel, padding: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 11,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 800 }}>
                  ⚡ Daily messages
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 900, color: "#67E8F9" }}
                >
                  {FREE_DAILY_CONNECT_LIMIT - todayCount}/
                  {FREE_DAILY_CONNECT_LIMIT} left
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.max(
                      0,
                      ((FREE_DAILY_CONNECT_LIMIT - todayCount) /
                        FREE_DAILY_CONNECT_LIMIT) *
                        100
                    )}%`,
                    background: "linear-gradient(90deg,#8B5CF6,#06B6D4)",
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setStep("history")}
            style={{
              ...panel,
              padding: "15px 16px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              fontFamily: "inherit",
              color: "white",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 800 }}>
              🕓 &nbsp; Recent messages
            </span>
            <span style={{ color: C.muted, fontSize: 20 }}>›</span>
          </button>
          <div style={eyebrow}>WHAT ARE WE WORKING ON?</div>
          {[
            {
              id: "reply_story",
              emoji: "📸",
              title: "Reply to their post",
              desc: "Upload their story or describe it — get the perfect reply based on what they posted",
              tag: "POSTS & STORIES",
              col: "#F9A8D4",
            },
            {
              id: "start_chat",
              emoji: "💬",
              title: "Start a conversation",
              desc: "Pick your opener style and energy — we'll write the first message for you",
              tag: "FIRST MESSAGES",
              col: "#67E8F9",
            },
            {
              id: "reply_text",
              emoji: "💭",
              title: "Reply to their message",
              desc: "Paste what they said — we'll craft a reply that fits the exact vibe and situation",
              tag: "TEXT REPLIES",
              col: "#C4B5FD",
            },
          ].map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => {
                setSituation(s.id);
                setStep(
                  s.id === "reply_story"
                    ? "post_who"
                    : s.id === "start_chat"
                    ? "chat_who"
                    : "reply_who"
                );
              }}
              style={{
                ...panel,
                background: `linear-gradient(115deg,${s.col}16,rgba(255,255,255,0.025))`,
                border: `1px solid ${s.col}44`,
                padding: "19px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  background: `${s.col}18`,
                  fontSize: 23,
                }}
              >
                {s.emoji}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    ...eyebrow,
                    color: s.col,
                    display: "block",
                    marginBottom: 7,
                  }}
                >
                  {s.tag}
                </span>
                <span
                  style={{
                    display: "block",
                    color: "white",
                    fontSize: 15,
                    fontWeight: 850,
                    marginBottom: 6,
                  }}
                >
                  {s.title}
                </span>
                <span
                  style={{
                    display: "block",
                    color: C.sub,
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  {s.desc}
                </span>
              </span>
              <span style={{ color: s.col, fontSize: 19 }}>↗</span>
            </button>
          ))}
        </>
      )}
      {step === "post_who" && (
        <>
          <button onClick={() => setStep("pick")} style={backBtn}>
            ← Back
          </button>
          <SectionHeader
            emoji="📸"
            title="Who posted it?"
            subtitle="STEP 1 OF 3 · POSTS & STORIES"
            accent="#F9A8D4"
          />
          <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>
            Who are you replying to? This changes how we write the reply.
          </p>
          <Grid
            items={POST_RELATIONSHIP}
            selected={postRelationship}
            onSelect={setPostRelationship}
            accent="#F9A8D4"
          />
          <input
            value={personName1}
            onChange={(e) => setPersonName1(e.target.value)}
            placeholder="Their name (optional)"
            style={inputBox}
          />
          <Primary
            onClick={() => setStep("post_details")}
            disabled={!postRelationship}
            gradient={gradients.reply_story}
          >
            Next — Tell us about the post →
          </Primary>
        </>
      )}
      {step === "post_details" && (
        <>
          <button onClick={() => setStep("post_who")} style={backBtn}>
            ← Back
          </button>
          <SectionHeader
            emoji="📸"
            title="What did they post?"
            subtitle="STEP 2 OF 3 · SHOW OR DESCRIBE"
            accent="#F9A8D4"
          />
          <div style={eyebrow}>📷 SCREENSHOT OF THEIR POST</div>
          <ImageUpload
            image={postImage}
            onUpload={setPostImage}
            onRemove={() => setPostImage(null)}
            label="Upload their post or story screenshot"
            sublabel="Tap to upload from your gallery"
          />
          {postImage && (
            <>
              <div style={eyebrow}>📷 ADD ANOTHER SCREENSHOT (OPTIONAL)</div>
              <ImageUpload
                image={postImage2}
                onUpload={setPostImage2}
                onRemove={() => setPostImage2(null)}
                label="Upload more context — another post, caption, etc"
                sublabel="Optional — tap to add"
              />
            </>
          )}
          <Chips
            items={[
              "They posted a selfie 🤳",
              "They're out with friends 👯",
              "Travel photo ✈️",
              "Food post 🍕",
              "Achievement post 🏆",
              "Something funny 😂",
              "At an event 🎉",
              "Throwback photo 📸",
              "Workout / gym 💪",
              "New fit / outfit 👗",
            ]}
            value={postContext}
            setValue={setPostContext}
            accent="#F9A8D4"
          />
          <Field
            label="DESCRIBE THE POST / CAPTION (OPTIONAL)"
            accent="#F9A8D4"
          >
            <textarea
              value={postContext}
              onChange={(e) => setPostContext(e.target.value)}
              placeholder="e.g. She posted a beach photo, caption said 'life lately ☀️'..."
              rows={3}
              style={textArea}
            />
          </Field>
          <Primary
            onClick={() => setStep("post_vibe")}
            disabled={!postContext && !postImage}
            gradient={gradients.reply_story}
          >
            Next — Pick your vibe →
          </Primary>
        </>
      )}
      {step === "post_vibe" && (
        <>
          <button onClick={() => setStep("post_details")} style={backBtn}>
            ← Back
          </button>
          <SectionHeader
            emoji="😎"
            title="What's your vibe?"
            subtitle="STEP 3 OF 3 · PICK YOUR ENERGY"
            accent="#F9A8D4"
          />
          <Grid
            items={POST_VIBES}
            selected={postVibe}
            onSelect={setPostVibe}
            showDesc
            accent="#F9A8D4"
          />
          <Primary
            onClick={generate}
            disabled={!postVibe}
            gradient={gradients.reply_story}
          >
            Generate Reply ✨
          </Primary>
        </>
      )}
      {step === "chat_who" && (
        <>
          <button onClick={() => setStep("pick")} style={backBtn}>
            ← Back
          </button>
          <SectionHeader
            emoji="💬"
            title="Who are they?"
            subtitle="STEP 1 OF 3 · FIRST MESSAGES"
            accent="#67E8F9"
          />
          <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>
            What's your relationship to them? This changes the opening energy.
          </p>
          <Grid
            items={CHAT_RELATIONSHIP}
            selected={chatRelationship}
            onSelect={setChatRelationship}
            accent="#67E8F9"
          />
          <input
            value={personName2}
            onChange={(e) => setPersonName2(e.target.value)}
            placeholder="Their name (optional) e.g. Jordan"
            style={inputBox}
          />
          <input
            value={personHandle}
            onChange={(e) => setPersonHandle(e.target.value)}
            placeholder="Their @ handle (optional)"
            style={inputBox}
          />
          <Primary
            onClick={() => setStep("chat_opener")}
            disabled={!chatRelationship}
            gradient={gradients.start_chat}
          >
            Next — Pick your opener style →
          </Primary>
        </>
      )}
      {step === "chat_opener" && (
        <>
          <button onClick={() => setStep("chat_who")} style={backBtn}>
            ← Back
          </button>
          <SectionHeader
            emoji="⚡"
            title="Pick your opener."
            subtitle="STEP 2 OF 3 · FIRST MESSAGE STYLE"
            accent="#67E8F9"
          />
          <Grid
            items={OPENER_TYPE}
            selected={openerType}
            onSelect={setOpenerType}
            showDesc
            accent="#67E8F9"
          />
          {openerType && (
            <>
              <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
              <div style={{ fontSize: 14, fontWeight: 850 }}>
                What energy / tone?
              </div>
              <Grid
                items={CHAT_ENERGY}
                selected={chatEnergy}
                onSelect={setChatEnergy}
                accent="#67E8F9"
              />
              {chatEnergy && (
                <Primary
                  onClick={() => setStep("chat_context")}
                  gradient={gradients.start_chat}
                >
                  Next — Add context →
                </Primary>
              )}
            </>
          )}
        </>
      )}
      {step === "chat_context" && (
        <>
          <button onClick={() => setStep("chat_opener")} style={backBtn}>
            ← Back
          </button>
          <SectionHeader
            emoji="💡"
            title="Make it personal."
            subtitle="STEP 3 OF 3 · OPTIONAL CONTEXT"
            accent="#67E8F9"
          />
          <p style={{ color: C.sub, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            A little detail can make the message sound much more natural.
          </p>
          <Field label="WHAT SHOULD WE REFERENCE OR MENTION?" accent="#67E8F9">
            <textarea
              value={chatContext}
              onChange={(e) => setChatContext(e.target.value)}
              placeholder="e.g. We met at a mutual friend's party, she likes music, I want to invite her to a gig..."
              rows={4}
              style={textArea}
            />
          </Field>
          <Chips
            items={[
              "We met recently",
              "We matched on an app",
              "Friend of a friend",
              "We like the same music",
              "I want to invite them out",
              "We went to the same school",
              "We haven't spoken in ages",
              "I like their posts online",
            ]}
            value={chatContext}
            setValue={setChatContext}
            accent="#67E8F9"
          />
          <Primary onClick={generate} gradient={gradients.start_chat}>
            Generate Opener ✨
          </Primary>
        </>
      )}
      {step === "reply_who" && (
        <>
          <button onClick={() => setStep("pick")} style={backBtn}>
            ← Back
          </button>
          <SectionHeader
            emoji="💭"
            title="Who sent it?"
            subtitle="STEP 1 OF 3 · TEXT REPLIES"
            accent="#C4B5FD"
          />
          <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>
            Who are you replying to? It matters for how the reply should land.
          </p>
          <Grid
            items={REPLY_RELATIONSHIP}
            selected={replyRelationship}
            onSelect={setReplyRelationship}
            accent="#C4B5FD"
          />
          <input
            value={personName3}
            onChange={(e) => setPersonName3(e.target.value)}
            placeholder="Their name (optional)"
            style={inputBox}
          />
          <Primary
            onClick={() => setStep("reply_message")}
            disabled={!replyRelationship}
            gradient={gradients.reply_text}
          >
            Next — Paste their message →
          </Primary>
        </>
      )}
      {step === "reply_message" && (
        <>
          <button onClick={() => setStep("reply_who")} style={backBtn}>
            ← Back
          </button>
          <SectionHeader
            emoji="💬"
            title="What did they say?"
            subtitle="STEP 2 OF 3 · THEIR EXACT MESSAGE"
            accent="#C4B5FD"
          />
          <div
            style={{
              ...panel,
              padding: 17,
              background: "rgba(139,92,246,0.075)",
              border: "1px solid rgba(167,139,250,0.38)",
            }}
          >
            <div style={{ ...eyebrow, color: "#C4B5FD", marginBottom: 12 }}>
              💬 PASTE THEIR EXACT MESSAGE HERE
            </div>
            <textarea
              value={whatTheySaid}
              onChange={(e) => setWhatTheySaid(e.target.value)}
              placeholder="Type or paste exactly what they said to you..."
              rows={5}
              style={{ ...textArea, fontSize: 15 }}
              autoFocus
            />
          </div>
          {whatTheySaid.trim() && (
            <>
              <div style={{ fontSize: 14, fontWeight: 850 }}>
                What's the situation?
              </div>
              <Grid
                items={MESSAGE_SITUATION}
                selected={messageSituation}
                onSelect={setMessageSituation}
                showDesc
                accent="#C4B5FD"
              />
              {messageSituation && (
                <Primary
                  onClick={() => setStep("reply_style")}
                  gradient={gradients.reply_text}
                >
                  Next — Pick your reply style →
                </Primary>
              )}
            </>
          )}
        </>
      )}
      {step === "reply_style" && (
        <>
          <button onClick={() => setStep("reply_message")} style={backBtn}>
            ← Back
          </button>
          <SectionHeader
            emoji="✍️"
            title="Make it sound like you."
            subtitle="STEP 3 OF 3 · REPLY STYLE"
            accent="#C4B5FD"
          />
          <Grid
            items={REPLY_STYLE}
            selected={replyStyle}
            onSelect={setReplyStyle}
            showDesc
            accent="#C4B5FD"
          />
          <details style={{ ...panel, padding: "16px", cursor: "pointer" }}>
            <summary
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "white",
                lineHeight: 1.5,
              }}
            >
              🗂️ Add conversation history{" "}
              <span style={{ color: C.muted, fontSize: 11, fontWeight: 500 }}>
                (optional)
              </span>
            </summary>
            <div
              style={{
                marginTop: 15,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: C.muted,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Adding your chat history makes the reply feel way more natural
                and personal.
              </p>
              <ImageUpload
                image={pastImage}
                onUpload={setPastImage}
                onRemove={() => setPastImage(null)}
                label="Upload a screenshot of your chat"
                sublabel="Tap to upload from gallery"
              />
              <Field label="OR PASTE PREVIOUS MESSAGES">
                <textarea
                  value={pastMessages}
                  onChange={(e) => setPastMessages(e.target.value)}
                  placeholder={
                    "Them: Hey how's everything?\nMe: All good just tired\nThem: Same honestly been a lot lately"
                  }
                  rows={4}
                  style={{ ...textArea, fontSize: 13 }}
                />
              </Field>
            </div>
          </details>
          <Primary
            onClick={generate}
            disabled={!replyStyle}
            gradient={gradients.reply_text}
          >
            Generate Reply ✨
          </Primary>
        </>
      )}
      {step === "result" && (
        <>
          <button
            onClick={() => {
              if (situation === "reply_story") setStep("post_vibe");
              if (situation === "start_chat") setStep("chat_context");
              if (situation === "reply_text") setStep("reply_style");
            }}
            style={backBtn}
          >
            ← Back
          </button>
          <SectionHeader
            emoji="✨"
            title={loading ? "Working on it..." : "Here's what to send."}
            subtitle={
              loading ? "WRITING YOUR MESSAGE" : "YOUR MESSAGE IS READY"
            }
            accent={accent}
          />
          <div
            style={{
              ...panel,
              minHeight: 150,
              boxSizing: "border-box",
              padding: "23px 20px",
              background: `linear-gradient(145deg,${accent}20,rgba(255,255,255,0.025))`,
              border: `1px solid ${accent}66`,
              display: "flex",
              alignItems: "center",
            }}
          >
            {loading ? (
              <div style={{ display: "flex", gap: 8, margin: "auto" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: accent,
                      animation: `popIn 0.6s ${
                        i * 0.15
                      }s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ width: "100%" }}>
                <div style={{ fontSize: 25, marginBottom: 14 }}>
                  {situation === "reply_story"
                    ? "📸"
                    : situation === "start_chat"
                    ? "💬"
                    : "💭"}
                </div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "white",
                    lineHeight: 1.75,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  {picked}
                </p>
              </div>
            )}
          </div>
          {!loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <Primary
                onClick={copyText}
                gradient={copied ? C.emerald : gradient}
              >
                {copied ? "✓ Copied to clipboard!" : "📋 Copy Message"}
              </Primary>
              <button
                onClick={generate}
                style={{
                  ...panel,
                  padding: 16,
                  color: "white",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                🔄 Try Another Version
              </button>
              <button
                onClick={reset}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 10,
                  color: C.muted,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              >
                Start Over
              </button>
            </div>
          )}
        </>
      )}
      {step === "history" && (
        <>
          <button onClick={() => setStep("pick")} style={backBtn}>
            ← Back
          </button>
          <SectionHeader
            emoji="🕓"
            title="Recent messages"
            subtitle="YOUR MESSAGE HISTORY"
            accent="#67E8F9"
          />
          {getConnectHistory().length === 0 ? (
            <div
              style={{ ...panel, textAlign: "center", padding: "48px 20px" }}
            >
              <div style={{ fontSize: 43, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 13, color: C.muted }}>
                No messages yet
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {getConnectHistory().map((item) => (
                <div key={item.id} style={{ ...panel, padding: "17px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 11,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>{item.situationEmoji}</span>
                      {item.personName && (
                        <span
                          style={{
                            color: C.gold,
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          {item.personName}
                        </span>
                      )}
                      {item.audience && (
                        <span style={{ color: C.sub, fontSize: 10 }}>
                          · {item.audience}
                        </span>
                      )}
                    </div>
                    <span
                      style={{ color: C.muted, fontSize: 10, flexShrink: 0 }}
                    >
                      {timeAgo(item.timestamp)}
                    </span>
                  </div>
                  <p
                    style={{
                      color: "white",
                      fontSize: 13,
                      lineHeight: 1.65,
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.message}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(item.message)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#67E8F9",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      padding: "13px 0 0",
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {step === "limit" && (
        <div style={{ ...panel, textAlign: "center", padding: "35px 20px" }}>
          <div style={{ fontSize: 43, marginBottom: 13 }}>✨</div>
          <h2
            style={{
              fontSize: 23,
              fontWeight: 900,
              color: "white",
              margin: "0 0 10px",
              letterSpacing: "-0.04em",
            }}
          >
            Daily limit reached
          </h2>
          <p
            style={{
              fontSize: 13,
              color: C.sub,
              margin: "0 0 24px",
              lineHeight: 1.7,
            }}
          >
            You've used your {FREE_DAILY_CONNECT_LIMIT} free messages today.
            Come back tomorrow or upgrade for unlimited.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <Primary onClick={() => go(13)}>Upgrade to Pro 👑</Primary>
            <button
              onClick={reset}
              style={{
                ...panel,
                padding: 16,
                color: "white",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
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
