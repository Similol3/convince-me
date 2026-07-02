import { useState } from "react";
import { C, gr } from "../tokens";
import { generateMessage } from "../lib/ai";
import { addConnectHistory, getConnectHistory } from "../lib/storage";
import { FREE_DAILY_CONNECT_LIMIT } from "../data/pricing";

// ─────────────────────────────────────────────────────────
// SITUATION 1 — REPLY TO POST/STORY
// Unique: upload image, describe post, pick reaction vibe
// ─────────────────────────────────────────────────────────
const POST_VIBES = [
  { id: "hyped",     emoji: "🔥", label: "Hype them up",     desc: "Big energy, show love"    },
  { id: "curious",   emoji: "👀", label: "Ask about it",     desc: "Show genuine curiosity"   },
  { id: "flirty",    emoji: "😏", label: "Flirt a little",   desc: "Playful and confident"    },
  { id: "funny",     emoji: "😂", label: "Make them laugh",  desc: "Light and witty"          },
  { id: "sweet",     emoji: "🥺", label: "Be sweet",         desc: "Warm and genuine"         },
  { id: "impressed", emoji: "😮", label: "Show you noticed", desc: "React to the detail"      },
];

const POST_RELATIONSHIP = [
  { id: "crush",    emoji: "😍", label: "Crush"         },
  { id: "friend",   emoji: "👫", label: "Close Friend"  },
  { id: "partner",  emoji: "💑", label: "Partner"       },
  { id: "stranger", emoji: "👋", label: "Someone New"   },
  { id: "ex",       emoji: "💔", label: "Ex"            },
  { id: "group",    emoji: "👯", label: "Group / Anyone"},
];

// ─────────────────────────────────────────────────────────
// SITUATION 2 — START A CONVERSATION
// Unique: what kind of opener, energy level, what to reference
// ─────────────────────────────────────────────────────────
const OPENER_TYPE = [
  { id: "smooth",     emoji: "😎", label: "Smooth opener",    desc: "Confident, natural"       },
  { id: "compliment", emoji: "✨", label: "Lead with a compliment", desc: "Specific, genuine"  },
  { id: "funny",      emoji: "😂", label: "Funny / witty",    desc: "Make them smile first"    },
  { id: "check_in",   emoji: "👋", label: "Casual check-in",  desc: "Low pressure, easy"       },
  { id: "invite",     emoji: "🎉", label: "Invite them out",  desc: "Bold, direct invite"      },
  { id: "reconnect",  emoji: "🔁", label: "Reconnect",        desc: "You haven't talked in a while"},
];

const CHAT_RELATIONSHIP = [
  { id: "crush",     emoji: "😍", label: "Crush"          },
  { id: "friend",    emoji: "👫", label: "Friend"         },
  { id: "colleague", emoji: "💼", label: "Colleague"      },
  { id: "stranger",  emoji: "👋", label: "Don't know them"},
  { id: "ex",        emoji: "💔", label: "Ex"             },
  { id: "online",    emoji: "📱", label: "Met online"     },
];

const CHAT_ENERGY = [
  { id: "uk_slang",  emoji: "🇬🇧", label: "UK / Street"   },
  { id: "casual",    emoji: "😊", label: "Chill & casual" },
  { id: "romantic",  emoji: "🥰", label: "Romantic"       },
  { id: "formal",    emoji: "🎩", label: "Professional"   },
  { id: "hype",      emoji: "🔥", label: "High energy"    },
  { id: "short",     emoji: "⚡", label: "Short & direct" },
];

// ─────────────────────────────────────────────────────────
// SITUATION 3 — REPLY TO THEIR MESSAGE
// Unique: paste message, what's the situation, how to handle it
// ─────────────────────────────────────────────────────────
const MESSAGE_SITUATION = [
  { id: "bad_day",    emoji: "😔", label: "They're going through something", desc: "Sad, stressed, venting"   },
  { id: "good_news",  emoji: "🎉", label: "They shared good news",           desc: "Excited, celebrating"     },
  { id: "miss_you",   emoji: "💭", label: "They said they miss you",         desc: "Emotional, reconnecting"  },
  { id: "conflict",   emoji: "😤", label: "There's tension between you",    desc: "Argument, awkward silence" },
  { id: "flirting",   emoji: "😏", label: "They're flirting",               desc: "Playful, testing the waters"},
  { id: "casual",     emoji: "💬", label: "Normal conversation",            desc: "Just chatting, relaxed"    },
  { id: "asking",     emoji: "❓", label: "They asked you something",       desc: "A question or request"     },
  { id: "apologised", emoji: "🙏", label: "They apologised",                desc: "Saying sorry for something"},
];

const REPLY_STYLE = [
  { id: "supportive",  emoji: "🤗", label: "Supportive",        desc: "Warm, caring, present"    },
  { id: "flirty",      emoji: "😏", label: "Flirty",            desc: "Playful, keep them hooked"},
  { id: "uk_slang",    emoji: "🇬🇧", label: "UK / Street",       desc: "Fam, innit, peng energy"  },
  { id: "funny",       emoji: "😂", label: "Funny",             desc: "Lighten the mood"         },
  { id: "real_talk",   emoji: "💯", label: "Real talk",         desc: "Direct and honest"        },
  { id: "soft",        emoji: "🥺", label: "Soft & sweet",      desc: "Gentle, genuine"          },
  { id: "apologetic",  emoji: "🙏", label: "Apologetic",        desc: "Own it, make it right"    },
  { id: "hype",        emoji: "🔥", label: "Hype them up",      desc: "Big energy response"      },
];

const REPLY_RELATIONSHIP = [
  { id: "crush",   emoji: "😍", label: "Crush"          },
  { id: "partner", emoji: "💑", label: "Partner / Bae"  },
  { id: "friend",  emoji: "👫", label: "Close Friend"   },
  { id: "family",  emoji: "👨‍👩‍👧", label: "Family"        },
  { id: "ex",      emoji: "💔", label: "Ex"             },
  { id: "other",   emoji: "👤", label: "Someone else"   },
];

// ─────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────
const backBtn = {
  background: "transparent", border: "none",
  color: C.muted, fontSize: 13, cursor: "pointer",
  fontFamily: "inherit", padding: 0,
  display: "flex", alignItems: "center", gap: 6,
};

const textArea = {
  width: "100%", background: "transparent", border: "none",
  color: "#fff", fontSize: 14, fontWeight: 500,
  outline: "none", fontFamily: "inherit", resize: "none",
};

const inputBox = {
  width: "100%", background: "rgba(255,255,255,0.08)",
  border: `1px solid ${C.glassBdr}`, borderRadius: 12,
  padding: "12px 14px", color: "#fff", fontSize: 14,
  fontWeight: 600, outline: "none", fontFamily: "inherit",
  boxSizing: "border-box",
};

// ─────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────
export default function Connect({ user, go }) {
  const [step, setStep] = useState("pick");
  const [situation, setSituation] = useState(null);

  // ── Situation 1: Reply to post ──
  const [postRelationship, setPostRelationship] = useState(null);
  const [postVibe,         setPostVibe]         = useState(null);
  const [postImage,        setPostImage]        = useState(null);
  const [postImage2,       setPostImage2]       = useState(null);
  const [postContext,      setPostContext]       = useState("");
  const [personName1,      setPersonName1]      = useState("");

  // ── Situation 2: Start conversation ──
  const [chatRelationship, setChatRelationship] = useState(null);
  const [openerType,       setOpenerType]       = useState(null);
  const [chatEnergy,       setChatEnergy]       = useState(null);
  const [chatContext,      setChatContext]       = useState("");
  const [personName2,      setPersonName2]      = useState("");
  const [personHandle,     setPersonHandle]     = useState("");

  // ── Situation 3: Reply to message ──
  const [replyRelationship, setReplyRelationship] = useState(null);
  const [whatTheySaid,      setWhatTheySaid]      = useState("");
  const [messageSituation,  setMessageSituation]  = useState(null);
  const [replyStyle,        setReplyStyle]        = useState(null);
  const [pastImage,         setPastImage]         = useState(null);
  const [pastMessages,      setPastMessages]      = useState("");
  const [personName3,       setPersonName3]       = useState("");

  // ── Result state ──
  const [picked,  setPicked]  = useState(null);
  const [copied,  setCopied]  = useState(false);
  const [loading, setLoading] = useState(false);

  const isPro = user?.is_pro || false;

  function getTodayCount() {
    const today  = new Date().toISOString().split("T")[0];
    const stored = JSON.parse(localStorage.getItem("cm_connect_count") || "{}");
    return stored.date === today ? stored.count : 0;
  }

  function incrementTodayCount() {
    const today   = new Date().toISOString().split("T")[0];
    const current = getTodayCount();
    localStorage.setItem("cm_connect_count", JSON.stringify({ date: today, count: current + 1 }));
  }

  const todayCount   = getTodayCount();
  const limitReached = !isPro && todayCount >= FREE_DAILY_CONNECT_LIMIT;

  // ── Generate based on situation ──
  async function generate() {
    if (limitReached) { setStep("limit"); return; }
    setLoading(true);
    setStep("result");

    let payload = {};

    if (situation === "reply_story") {
      payload = {
        situationId:  "reply_story",
        context:      postContext,
        image:        postImage,
        audience:     postRelationship?.id,
        tone:         postVibe?.id,
        purpose:      "react",
        personName:   personName1.trim(),
        pastMessages: "",
        pastImage:    null,
      };
    } else if (situation === "start_chat") {
      payload = {
        situationId:  "start_chat",
        context:      chatContext,
        image:        null,
        audience:     chatRelationship?.id,
        tone:         chatEnergy?.id,
        purpose:      openerType?.id,
        personName:   personName2.trim(),
        personHandle: personHandle.trim(),
        pastMessages: "",
        pastImage:    null,
      };
    } else {
      payload = {
        situationId:  "reply_text",
        context:      whatTheySaid,
        image:        null,
        audience:     replyRelationship?.id,
        tone:         replyStyle?.id,
        purpose:      messageSituation?.id,
        personName:   personName3.trim(),
        pastMessages: pastMessages.trim(),
        pastImage,
      };
    }

    const text = await generateMessage(payload);
    setPicked(text);

    addConnectHistory({
      situationId:    payload.situationId,
      situationEmoji: situation === "reply_story" ? "📸" : situation === "start_chat" ? "💬" : "💭",
      situationTitle: situation === "reply_story" ? "Reply to post" : situation === "start_chat" ? "Start conversation" : "Reply to message",
      personName:     payload.personName,
      audience:       payload.audience,
      tone:           payload.tone,
      context:        payload.context,
      message:        text,
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
    setStep("pick"); setSituation(null);
    setPostRelationship(null); setPostVibe(null);
    setPostImage(null); setPostImage2(null);
    setPostContext(""); setPersonName1("");
    setChatRelationship(null); setOpenerType(null);
    setChatEnergy(null); setChatContext(""); setPersonName2(""); setPersonHandle("");
    setReplyRelationship(null); setWhatTheySaid(""); setMessageSituation(null);
    setReplyStyle(null); setPastImage(null); setPastMessages(""); setPersonName3("");
    setPicked(null); setCopied(false);
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs  > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "just now";
  }

  // ── Reusable grid ──
  function Grid({ items, selected, onSelect, columns = 2, showDesc = false }) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 10 }}>
        {items.map((item) => {
          const on = selected?.id === item.id;
          return (
            <button key={item.id} onClick={() => onSelect(item)} style={{
              background: on ? gr() : C.glass,
              border: `1px solid ${on ? "transparent" : C.glassBdr}`,
              borderRadius: 14, padding: showDesc ? "14px 12px" : "14px 10px",
              cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6, fontFamily: "inherit", textAlign: "center",
              transform: on ? "scale(1.03)" : "scale(1)",
              transition: "all 0.15s ease",
            }}>
              <span style={{ fontSize: 24 }}>{item.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "white", lineHeight: 1.3 }}>
                {item.label}
              </span>
              {showDesc && item.desc && (
                <span style={{ fontSize: 10, color: on ? "rgba(255,255,255,0.8)" : C.muted, lineHeight: 1.3 }}>
                  {item.desc}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Image upload box ──
  function ImageUpload({ image, onUpload, onRemove, label, sublabel }) {
    return !image ? (
      <label style={{
        background: C.glass, border: `1px dashed ${C.glassBdr}`,
        borderRadius: 14, padding: "18px 16px",
        display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
      }}>
        <span style={{ fontSize: 26 }}>📷</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{label}</div>
          <div style={{ fontSize: 11, color: C.muted }}>{sublabel}</div>
        </div>
        <input type="file" accept="image/*"
          onChange={e => {
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
        <img src={image} alt="" style={{
          width: "100%", borderRadius: 14, maxHeight: 200,
          objectFit: "cover", border: `1px solid ${C.glassBdr}`,
        }} />
        <button onClick={onRemove} style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(0,0,0,0.75)", border: "none",
          borderRadius: "50%", width: 30, height: 30,
          color: "white", fontSize: 14, cursor: "pointer",
        }}>✕</button>
      </div>
    );
  }

  // ── Section header ──
  function SectionHeader({ emoji, title, subtitle, color = C.grape }) {
    return (
      <div style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        borderRadius: 14, padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 28 }}>{emoji}</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
    );
  }

  const wrapper = {
    padding: "20px 16px", display: "flex", flexDirection: "column",
    gap: 18, minHeight: "100%",
    background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(6,182,212,0.18) 0%, ${C.bg} 60%)`,
  };

  return (
    <div style={wrapper}>

      {/* ══════════════════════════════════════════
          PICK SITUATION
      ══════════════════════════════════════════ */}
      {step === "pick" && (
        <>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "white", margin: 0 }}>
              What do you need?
            </h1>
            <p style={{ fontSize: 13, color: C.sub, margin: "6px 0 0" }}>
              Each one is built differently — pick yours.
            </p>
          </div>

          {!isPro && (
            <div style={{
              background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: 12, padding: "10px 14px",
            }}>
              <span style={{ fontSize: 12, color: C.sub }}>
                {FREE_DAILY_CONNECT_LIMIT - todayCount} free messages left today
              </span>
            </div>
          )}

          <button onClick={() => setStep("history")} style={{
            background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 14, padding: "12px 16px", cursor: "pointer",
            width: "100%", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🕓</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Recent messages</span>
            </div>
            <span style={{ color: C.muted }}>›</span>
          </button>

          {[
            {
              id:    "reply_story",
              emoji: "📸",
              title: "Reply to their post",
              desc:  "Upload their story or describe it — get the perfect reply based on what they posted",
              tag:   "POSTS & STORIES",
              col:   "rgba(236,72,153,0.15)",
              border:"rgba(236,72,153,0.3)",
            },
            {
              id:    "start_chat",
              emoji: "💬",
              title: "Start a conversation",
              desc:  "Pick your opener style and energy — we'll write the first message for you",
              tag:   "FIRST MESSAGES",
              col:   "rgba(6,182,212,0.15)",
              border:"rgba(6,182,212,0.3)",
            },
            {
              id:    "reply_text",
              emoji: "💭",
              title: "Reply to their message",
              desc:  "Paste what they said — we'll craft a reply that fits the exact vibe and situation",
              tag:   "TEXT REPLIES",
              col:   "rgba(139,92,246,0.15)",
              border:"rgba(139,92,246,0.3)",
            },
          ].map(s => (
            <button key={s.id}
              onClick={() => { setSituation(s.id); setStep(s.id === "reply_story" ? "post_who" : s.id === "start_chat" ? "chat_who" : "reply_who"); }}
              style={{
                background: s.col, border: `1px solid ${s.border}`,
                borderRadius: 20, padding: "20px 18px",
                display: "flex", alignItems: "flex-start", gap: 14,
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: s.col,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, flexShrink: 0, border: `1px solid ${s.border}`,
              }}>{s.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                  color: C.muted, marginBottom: 4 }}>{s.tag}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 4 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </button>
          ))}
        </>
      )}

      {/* ══════════════════════════════════════════
          SITUATION 1 — REPLY TO POST
          Step 1: Who posted it?
      ══════════════════════════════════════════ */}
      {step === "post_who" && (
        <>
          <button onClick={() => setStep("pick")} style={backBtn}>← Back</button>
          <SectionHeader emoji="📸" title="Reply to their post"
            subtitle="Step 1 of 3 — Who posted it?" color="rgba(236,72,153,1)" />

          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: "0 0 4px" }}>
              Who are you replying to?
            </p>
            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
              This changes how we write the reply
            </p>
          </div>

          <Grid items={POST_RELATIONSHIP} selected={postRelationship}
            onSelect={setPostRelationship} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={personName1} onChange={e => setPersonName1(e.target.value)}
              placeholder="Their name (optional)" style={inputBox} />
          </div>

          <button onClick={() => setStep("post_details")} disabled={!postRelationship} style={{
            background: postRelationship ? "linear-gradient(90deg, #EC4899, #F43F5E)" : C.glass,
            border: "none", borderRadius: 14, padding: "16px", color: "white",
            fontSize: 15, fontWeight: 700, cursor: postRelationship ? "pointer" : "not-allowed",
            width: "100%", fontFamily: "inherit", opacity: postRelationship ? 1 : 0.5,
          }}>
            Next — Tell us about the post →
          </button>
        </>
      )}

      {/* SITUATION 1 — Step 2: The post itself */}
      {step === "post_details" && (
        <>
          <button onClick={() => setStep("post_who")} style={backBtn}>← Back</button>
          <SectionHeader emoji="📸" title="What did they post?"
            subtitle="Step 2 of 3 — Show us or describe it" color="rgba(236,72,153,1)" />

          {/* Main post screenshot */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(236,72,153,0.9)",
              letterSpacing: "0.08em", margin: "0 0 8px" }}>
              📷 SCREENSHOT OF THEIR POST
            </p>
            <ImageUpload
              image={postImage}
              onUpload={setPostImage}
              onRemove={() => setPostImage(null)}
              label="Upload their post or story screenshot"
              sublabel="Tap to upload from your gallery"
            />
          </div>

          {/* Second screenshot — extra context */}
          {postImage && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.muted,
                letterSpacing: "0.08em", margin: "0 0 8px" }}>
                📷 ADD ANOTHER SCREENSHOT (OPTIONAL)
              </p>
              <ImageUpload
                image={postImage2}
                onUpload={setPostImage2}
                onRemove={() => setPostImage2(null)}
                label="Upload more context — another post, caption, etc"
                sublabel="Optional — tap to add"
              />
            </div>
          )}

          {/* Quick chips */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted,
              letterSpacing: "0.08em", margin: "0 0 10px" }}>
              OR TAP WHAT FITS:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
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
              ].map(chip => (
                <button key={chip} onClick={() => setPostContext(p => p ? `${p}, ${chip}` : chip)}
                  style={{
                    background: postContext.includes(chip) ? "rgba(236,72,153,0.25)" : C.glass,
                    border: `1px solid ${postContext.includes(chip) ? "rgba(236,72,153,0.5)" : C.glassBdr}`,
                    borderRadius: 99, padding: "7px 12px", cursor: "pointer",
                    fontSize: 12, fontWeight: 600, color: "white", fontFamily: "inherit",
                  }}
                >{chip}</button>
              ))}
            </div>
          </div>

          {/* Description box */}
          <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 14, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              color: C.muted, margin: "0 0 8px" }}>
              DESCRIBE THE POST / CAPTION (OPTIONAL)
            </p>
            <textarea value={postContext} onChange={e => setPostContext(e.target.value)}
              placeholder="e.g. She posted a beach photo, caption said 'life lately ☀️'..."
              rows={3} style={textArea} />
          </div>

          <button onClick={() => setStep("post_vibe")}
            disabled={!postContext && !postImage}
            style={{
              background: (postContext || postImage)
                ? "linear-gradient(90deg, #EC4899, #F43F5E)" : C.glass,
              border: "none", borderRadius: 14, padding: "16px", color: "white",
              fontSize: 15, fontWeight: 700,
              cursor: (postContext || postImage) ? "pointer" : "not-allowed",
              width: "100%", fontFamily: "inherit",
              opacity: (postContext || postImage) ? 1 : 0.5,
            }}
          >
            Next — Pick your vibe →
          </button>
        </>
      )}

      {/* SITUATION 1 — Step 3: Your vibe/reaction */}
      {step === "post_vibe" && (
        <>
          <button onClick={() => setStep("post_details")} style={backBtn}>← Back</button>
          <SectionHeader emoji="😎" title="How do you want to come across?"
            subtitle="Step 3 of 3 — Pick your energy" color="rgba(236,72,153,1)" />

          <Grid items={POST_VIBES} selected={postVibe} onSelect={setPostVibe}
            showDesc={true} />

          <button onClick={generate} disabled={!postVibe} style={{
            background: postVibe ? "linear-gradient(90deg, #EC4899, #F43F5E)" : C.glass,
            border: "none", borderRadius: 14, padding: "17px", color: "white",
            fontSize: 15, fontWeight: 700,
            cursor: postVibe ? "pointer" : "not-allowed",
            width: "100%", fontFamily: "inherit",
            opacity: postVibe ? 1 : 0.5,
          }}>
            Generate Reply ✨
          </button>
        </>
      )}

      {/* ══════════════════════════════════════════
          SITUATION 2 — START CONVERSATION
          Step 1: Who are they?
      ══════════════════════════════════════════ */}
      {step === "chat_who" && (
        <>
          <button onClick={() => setStep("pick")} style={backBtn}>← Back</button>
          <SectionHeader emoji="💬" title="Start a conversation"
            subtitle="Step 1 of 3 — Who are they?" color="rgba(6,182,212,1)" />

          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: "0 0 4px" }}>
              What's your relationship to them?
            </p>
            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
              Changes the opening energy completely
            </p>
          </div>

          <Grid items={CHAT_RELATIONSHIP} selected={chatRelationship}
            onSelect={setChatRelationship} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={personName2} onChange={e => setPersonName2(e.target.value)}
              placeholder="Their name (optional) e.g. Jordan" style={inputBox} />
            <input value={personHandle} onChange={e => setPersonHandle(e.target.value)}
              placeholder="Their @ handle (optional)" style={inputBox} />
          </div>

          <button onClick={() => setStep("chat_opener")} disabled={!chatRelationship} style={{
            background: chatRelationship
              ? "linear-gradient(90deg, #06B6D4, #0EA5E9)" : C.glass,
            border: "none", borderRadius: 14, padding: "16px", color: "white",
            fontSize: 15, fontWeight: 700,
            cursor: chatRelationship ? "pointer" : "not-allowed",
            width: "100%", fontFamily: "inherit", opacity: chatRelationship ? 1 : 0.5,
          }}>
            Next — Pick your opener style →
          </button>
        </>
      )}

      {/* SITUATION 2 — Step 2: Opener type + energy */}
      {step === "chat_opener" && (
        <>
          <button onClick={() => setStep("chat_who")} style={backBtn}>← Back</button>
          <SectionHeader emoji="⚡" title="What kind of opener?"
            subtitle="Step 2 of 3 — Style of your first message" color="rgba(6,182,212,1)" />

          <Grid items={OPENER_TYPE} selected={openerType}
            onSelect={setOpenerType} showDesc={true} />

          {openerType && (
            <>
              <div style={{ height: 1, background: C.border }} />

              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: "0 0 10px" }}>
                  What energy / tone?
                </p>
                <Grid items={CHAT_ENERGY} selected={chatEnergy}
                  onSelect={setChatEnergy} />
              </div>

              {chatEnergy && (
                <button onClick={() => setStep("chat_context")} style={{
                  background: "linear-gradient(90deg, #06B6D4, #0EA5E9)",
                  border: "none", borderRadius: 14, padding: "16px", color: "white",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  width: "100%", fontFamily: "inherit",
                }}>
                  Next — Add context →
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* SITUATION 2 — Step 3: Context */}
      {step === "chat_context" && (
        <>
          <button onClick={() => setStep("chat_opener")} style={backBtn}>← Back</button>
          <SectionHeader emoji="💡" title="Give it something to work with"
            subtitle="Step 3 of 3 — Optional but makes it way better" color="rgba(6,182,212,1)" />

          <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 14, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              color: C.muted, margin: "0 0 8px" }}>
              WHAT SHOULD WE REFERENCE OR MENTION?
            </p>
            <textarea value={chatContext} onChange={e => setChatContext(e.target.value)}
              placeholder="e.g. We met at a mutual friend's party, she likes music, I want to invite her to a gig..."
              rows={4} style={textArea} />
          </div>

          {/* Quick context chips */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted,
              letterSpacing: "0.08em", margin: "0 0 8px" }}>
              QUICK FILL:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                "We met recently",
                "We matched on an app",
                "Friend of a friend",
                "We like the same music",
                "I want to invite them out",
                "We went to the same school",
                "We haven't spoken in ages",
                "I like their posts online",
              ].map(chip => (
                <button key={chip}
                  onClick={() => setChatContext(p => p ? `${p}. ${chip}` : chip)}
                  style={{
                    background: chatContext.includes(chip) ? "rgba(6,182,212,0.2)" : C.glass,
                    border: `1px solid ${chatContext.includes(chip) ? "rgba(6,182,212,0.5)" : C.glassBdr}`,
                    borderRadius: 99, padding: "7px 12px", cursor: "pointer",
                    fontSize: 12, fontWeight: 600, color: "white", fontFamily: "inherit",
                  }}
                >{chip}</button>
              ))}
            </div>
          </div>

          <button onClick={generate} style={{
            background: "linear-gradient(90deg, #06B6D4, #0EA5E9)",
            border: "none", borderRadius: 14, padding: "17px", color: "white",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            width: "100%", fontFamily: "inherit",
          }}>
            Generate Opener ✨
          </button>
        </>
      )}

      {/* ══════════════════════════════════════════
          SITUATION 3 — REPLY TO MESSAGE
          Step 1: Who sent it?
      ══════════════════════════════════════════ */}
      {step === "reply_who" && (
        <>
          <button onClick={() => setStep("pick")} style={backBtn}>← Back</button>
          <SectionHeader emoji="💭" title="Reply to their message"
            subtitle="Step 1 of 3 — Who sent it?" color="rgba(139,92,246,1)" />

          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: "0 0 4px" }}>
              Who are you replying to?
            </p>
            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
              Matters a lot for how the reply should land
            </p>
          </div>

          <Grid items={REPLY_RELATIONSHIP} selected={replyRelationship}
            onSelect={setReplyRelationship} />

          <input value={personName3} onChange={e => setPersonName3(e.target.value)}
            placeholder="Their name (optional)" style={inputBox} />

          <button onClick={() => setStep("reply_message")} disabled={!replyRelationship} style={{
            background: replyRelationship
              ? "linear-gradient(90deg, #8B5CF6, #A78BFA)" : C.glass,
            border: "none", borderRadius: 14, padding: "16px", color: "white",
            fontSize: 15, fontWeight: 700,
            cursor: replyRelationship ? "pointer" : "not-allowed",
            width: "100%", fontFamily: "inherit", opacity: replyRelationship ? 1 : 0.5,
          }}>
            Next — Paste their message →
          </button>
        </>
      )}

      {/* SITUATION 3 — Step 2: Their exact message + situation */}
      {step === "reply_message" && (
        <>
          <button onClick={() => setStep("reply_who")} style={backBtn}>← Back</button>
          <SectionHeader emoji="💬" title="What did they say?"
            subtitle="Step 2 of 3 — Paste their exact message" color="rgba(139,92,246,1)" />

          {/* Their message — most important field */}
          <div style={{
            background: "rgba(139,92,246,0.08)",
            border: "2px solid rgba(139,92,246,0.4)",
            borderRadius: 16, padding: "16px 18px",
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              color: C.grape, margin: "0 0 10px" }}>
              💬 PASTE THEIR EXACT MESSAGE HERE
            </p>
            <textarea value={whatTheySaid} onChange={e => setWhatTheySaid(e.target.value)}
              placeholder="Type or paste exactly what they said to you..."
              rows={5} style={{ ...textArea, fontSize: 15 }} autoFocus />
          </div>

          {whatTheySaid.trim() && (
            <>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: "0 0 10px" }}>
                  What's the situation?
                </p>
                <Grid items={MESSAGE_SITUATION} selected={messageSituation}
                  onSelect={setMessageSituation} showDesc={true} />
              </div>

              {messageSituation && (
                <button onClick={() => setStep("reply_style")} style={{
                  background: "linear-gradient(90deg, #8B5CF6, #A78BFA)",
                  border: "none", borderRadius: 14, padding: "16px", color: "white",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  width: "100%", fontFamily: "inherit",
                }}>
                  Next — Pick your reply style →
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* SITUATION 3 — Step 3: Reply style + past convo */}
      {step === "reply_style" && (
        <>
          <button onClick={() => setStep("reply_message")} style={backBtn}>← Back</button>
          <SectionHeader emoji="✍️" title="How do you want to reply?"
            subtitle="Step 3 of 3 — Pick your style" color="rgba(139,92,246,1)" />

          <Grid items={REPLY_STYLE} selected={replyStyle}
            onSelect={setReplyStyle} showDesc={true} />

          {/* Past conversation — collapsed by default */}
          <details style={{ cursor: "pointer" }}>
            <summary style={{
              fontSize: 13, fontWeight: 700, color: C.sub,
              listStyle: "none", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>🗂️</span> Add conversation history
              <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>
                optional — tap to expand
              </span>
            </summary>

            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                Adding your chat history makes the reply feel way more natural and personal.
              </p>

              <ImageUpload
                image={pastImage}
                onUpload={setPastImage}
                onRemove={() => setPastImage(null)}
                label="Upload a screenshot of your chat"
                sublabel="Tap to upload from gallery"
              />

              <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`,
                borderRadius: 14, padding: "14px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                  letterSpacing: "0.08em", margin: "0 0 8px" }}>
                  OR PASTE PREVIOUS MESSAGES
                </p>
                <textarea value={pastMessages} onChange={e => setPastMessages(e.target.value)}
                  placeholder={"Them: Hey how's everything?\nMe: All good just tired\nThem: Same honestly been a lot lately"}
                  rows={4} style={{ ...textArea, fontSize: 13 }} />
              </div>
            </div>
          </details>

          <button onClick={generate} disabled={!replyStyle} style={{
            background: replyStyle ? "linear-gradient(90deg, #8B5CF6, #A78BFA)" : C.glass,
            border: "none", borderRadius: 14, padding: "17px", color: "white",
            fontSize: 15, fontWeight: 700,
            cursor: replyStyle ? "pointer" : "not-allowed",
            width: "100%", fontFamily: "inherit",
            opacity: replyStyle ? 1 : 0.5,
          }}>
            Generate Reply ✨
          </button>
        </>
      )}

      {/* ══════════════════════════════════════════
          RESULT
      ══════════════════════════════════════════ */}
      {step === "result" && (
        <>
          <button onClick={() => {
            if (situation === "reply_story") setStep("post_vibe");
            if (situation === "start_chat")  setStep("chat_context");
            if (situation === "reply_text")  setStep("reply_style");
          }} style={backBtn}>← Back</button>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            color: C.muted, margin: 0 }}>
            {loading ? "WRITING YOUR MESSAGE..." : "HERE'S WHAT TO SEND"}
          </p>

          <div style={{
            background: situation === "reply_story"
              ? "linear-gradient(145deg, #EC4899, #F43F5E)"
              : situation === "start_chat"
              ? "linear-gradient(145deg, #06B6D4, #0EA5E9)"
              : "linear-gradient(145deg, #8B5CF6, #A78BFA)",
            borderRadius: 24, padding: "24px 20px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            minHeight: 120, display: "flex", alignItems: "flex-start",
          }}>
            {loading ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "auto" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 9, height: 9, borderRadius: "50%",
                    background: "rgba(255,255,255,0.7)",
                    animation: `popIn 0.6s ${i * 0.15}s ease-in-out infinite alternate`,
                  }} />
                ))}
              </div>
            ) : (
              <div style={{ width: "100%" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>
                  {situation === "reply_story" ? "📸" : situation === "start_chat" ? "💬" : "💭"}
                </div>
                <p style={{ fontSize: 17, fontWeight: 600, color: "white",
                  lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>
                  {picked}
                </p>
              </div>
            )}
          </div>

          {!loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={copyText} style={{
                background: copied ? C.emerald : C.glass,
                border: `1px solid ${copied ? C.emerald : C.glassBdr}`,
                borderRadius: 14, padding: "16px", color: "white",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                width: "100%", fontFamily: "inherit", transition: "all 0.2s",
              }}>
                {copied ? "✓ Copied to clipboard!" : "📋 Copy Message"}
              </button>

              <button onClick={generate} style={{
                background: C.glass, border: `1px solid ${C.glassBdr}`,
                borderRadius: 14, padding: "16px", color: "white",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                width: "100%", fontFamily: "inherit",
              }}>
                🔄 Try Another Version
              </button>

              <button onClick={reset} style={{
                background: "transparent", border: "none", color: C.muted,
                fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                padding: "8px", textAlign: "center",
              }}>
                Start Over
              </button>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════
          HISTORY
      ══════════════════════════════════════════ */}
      {step === "history" && (
        <>
          <button onClick={() => setStep("pick")} style={backBtn}>← Back</button>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "white", margin: 0 }}>
            Recent Messages
          </h2>

          {getConnectHistory().length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 14, color: C.muted }}>No messages yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {getConnectHistory().map(item => (
                <div key={item.id} style={{
                  background: C.glass, border: `1px solid ${C.glassBdr}`,
                  borderRadius: 16, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center",
                    justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{item.situationEmoji}</span>
                      {item.personName && (
                        <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>
                          {item.personName}
                        </span>
                      )}
                      {item.audience && (
                        <span style={{ fontSize: 10, color: C.sub }}>· {item.audience}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: C.muted }}>{timeAgo(item.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "white", margin: 0,
                    lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                    {item.message}
                  </p>
                  <button onClick={() => navigator.clipboard.writeText(item.message)} style={{
                    background: "transparent", border: "none", color: C.muted,
                    fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                    padding: "6px 0 0", display: "block",
                  }}>
                    📋 Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════
          LIMIT
      ══════════════════════════════════════════ */}
      {step === "limit" && (
        <div style={{ textAlign: "center", padding: "40px 16px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "white", margin: "0 0 8px" }}>
            Daily limit reached
          </h2>
          <p style={{ fontSize: 13, color: C.sub, marginBottom: 20, lineHeight: 1.6 }}>
            You've used your {FREE_DAILY_CONNECT_LIMIT} free messages today.
            Come back tomorrow or upgrade for unlimited.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => go(13)} style={{
              background: gr(), border: "none", borderRadius: 14,
              padding: "16px", color: "white", fontSize: 15,
              fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "inherit",
            }}>
              Upgrade to Pro 👑
            </button>
            <button onClick={reset} style={{
              background: C.glass, border: `1px solid ${C.glassBdr}`,
              borderRadius: 14, padding: "16px", color: "white",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              width: "100%", fontFamily: "inherit",
            }}>
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
