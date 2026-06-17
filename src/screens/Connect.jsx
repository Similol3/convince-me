import { useState } from 'react';
import { C, gr } from '../tokens';
import { generateMessage } from '../lib/ai';
import { addConnectHistory, getConnectHistory } from '../lib/storage';
import { AUDIENCES, TONES, PURPOSES } from '../data/connectOptions';
import { FREE_DAILY_CONNECT_LIMIT } from '../data/pricing';

const SITUATIONS = [
  {
    id:   'reply_story',
    emoji: '📸',
    title: 'Reply to their story',
    desc:  'Get the perfect reply to their post',
  },
  {
    id:   'start_chat',
    emoji: '💬',
    title: 'Start a conversation',
    desc:  'Break the ice — first message sorted',
  },
  {
    id:   'reply_text',
    emoji: '💭',
    title: 'Reply to their message',
    desc:  'Get the right words for exactly what they said',
  },
];

const back = {
  background: 'transparent', border: 'none',
  color: C.muted, fontSize: 13, cursor: 'pointer',
  fontFamily: 'inherit', padding: 0,
  display: 'flex', alignItems: 'center', gap: 6,
};

const pill = (color = C.glass) => ({
  background: color,
  border: `1px solid ${C.glassBdr}`,
  borderRadius: 99, padding: '5px 10px',
  fontSize: 11, color: 'white',
  display: 'flex', alignItems: 'center', gap: 4,
});

const textArea = {
  width: '100%', background: 'transparent', border: 'none',
  color: '#fff', fontSize: 14, fontWeight: 500,
  outline: 'none', fontFamily: 'inherit', resize: 'none',
};

const inputBox = {
  width: '100%', background: 'rgba(255,255,255,0.08)',
  border: `1px solid ${C.glassBdr}`, borderRadius: 12,
  padding: '12px 14px', color: '#fff', fontSize: 14,
  fontWeight: 600, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export default function Connect({ user, go }) {
  // Steps: pick → about → vibe → context → result | history | limit
  const [step,      setStep]      = useState('pick');
  const [situation, setSituation] = useState(null);
  const [audience,  setAudience]  = useState(null);
  const [tone,      setTone]      = useState(null);
  const [purpose,   setPurpose]   = useState(null);

  // About the person
  const [personName,   setPersonName]   = useState('');
  const [personHandle, setPersonHandle] = useState('');

  // Context fields
  const [context,      setContext]      = useState('');
  const [pastMessages, setPastMessages] = useState('');
  const [image,        setImage]        = useState(null);

  const [picked,  setPicked]  = useState(null);
  const [copied,  setCopied]  = useState(false);
  const [loading, setLoading] = useState(false);

  const isPro = user?.is_pro || false;

  function getTodayCount() {
    const today  = new Date().toISOString().split('T')[0];
    const stored = JSON.parse(localStorage.getItem('cm_connect_count') || '{}');
    return stored.date === today ? stored.count : 0;
  }

  function incrementTodayCount() {
    const today   = new Date().toISOString().split('T')[0];
    const current = getTodayCount();
    localStorage.setItem(
      'cm_connect_count',
      JSON.stringify({ date: today, count: current + 1 })
    );
  }

  const todayCount   = getTodayCount();
  const limitReached = !isPro && todayCount >= FREE_DAILY_CONNECT_LIMIT;

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (limitReached) { setStep('limit'); return; }

    setLoading(true);
    setStep('result');

    const text = await generateMessage({
      situationId:  situation.id,
      context,
      image,
      audience:     audience?.id,
      tone:         tone?.id,
      purpose:      purpose?.id,
      personName:   personName.trim(),
      personHandle: personHandle.trim(),
      pastMessages: pastMessages.trim(),
    });

    setPicked(text);

    addConnectHistory({
      situationId:    situation.id,
      situationEmoji: situation.emoji,
      situationTitle: situation.title,
      personName:     personName.trim(),
      audience:       audience?.label,
      tone:           tone?.label,
      purpose:        purpose?.label,
      context,
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
    setStep('pick');
    setSituation(null); setAudience(null);
    setTone(null); setPurpose(null);
    setPersonName(''); setPersonHandle('');
    setContext(''); setPastMessages('');
    setImage(null); setPicked(null); setCopied(false);
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs  > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'just now';
  }

  // Grid of selectable option cards
  function OptionGrid({ items, onSelect }) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {items.map((item, i) => (
          <button key={i} onClick={() => onSelect(item)} style={{
            background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 14, padding: '16px 10px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 8, fontFamily: 'inherit', textAlign: 'center',
            transition: 'all 0.15s ease',
          }}>
            <span style={{ fontSize: 24 }}>{item.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Show chips for what user has selected so far
  function Chips() {
    const chips = [
      situation && { emoji: situation.emoji, label: situation.title },
      audience  && { emoji: audience.emoji,  label: audience.label  },
      tone      && { emoji: tone.emoji,      label: tone.label      },
      purpose   && { emoji: purpose.emoji,   label: purpose.label   },
      personName.trim() && { emoji: '👤', label: personName.trim() },
    ].filter(Boolean);

    if (chips.length === 0) return null;

    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {chips.map((c, i) => (
          <div key={i} style={pill()}>
            <span>{c.emoji}</span> {c.label}
          </div>
        ))}
      </div>
    );
  }

  const wrapper = {
    padding: '24px 16px', display: 'flex', flexDirection: 'column',
    gap: 20, minHeight: '100%',
    background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(6,182,212,0.18) 0%, ${C.bg} 60%)`,
  };

  return (
    <div style={wrapper}>

      {/* ── PICK SITUATION ── */}
      {step === 'pick' && (
        <>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'white', margin: 0 }}>
              Need something to say?
            </h1>
            <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0', lineHeight: 1.5 }}>
              Answer a few quick questions — we'll write the perfect message.
            </p>
          </div>

          {!isPro && (
            <div style={{
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 12, padding: '10px 14px',
            }}>
              <span style={{ fontSize: 12, color: C.sub }}>
                {FREE_DAILY_CONNECT_LIMIT - todayCount} free messages left today
              </span>
            </div>
          )}

          <button onClick={() => setStep('history')} style={{
            background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 14, padding: '12px 16px', cursor: 'pointer',
            width: '100%', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🕓</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                Recent messages
              </span>
            </div>
            <span style={{ color: C.muted, fontSize: 16 }}>›</span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SITUATIONS.map(sit => (
              <button key={sit.id} onClick={() => { setSituation(sit); setStep('about'); }} style={{
                background: C.glass, border: `1px solid ${C.glassBdr}`,
                borderRadius: 18, padding: '18px', display: 'flex',
                alignItems: 'center', gap: 14, cursor: 'pointer',
                fontFamily: 'inherit', textAlign: 'left',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(6,182,212,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>{sit.emoji}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
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

      {/* ── ABOUT THE PERSON ── */}
      {step === 'about' && (
        <>
          <button onClick={() => setStep('pick')} style={back}>← Back</button>
          <Chips />

          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0 }}>
              Who are you messaging?
            </h2>
            <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0' }}>
              The more you tell us, the better the message
            </p>
          </div>

          {/* Audience grid */}
          <OptionGrid items={AUDIENCES} onSelect={a => setAudience(a)} />

          {/* Name and handle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              value={personName}
              onChange={e => setPersonName(e.target.value)}
              placeholder="Their name (optional) e.g. Jordan"
              style={inputBox}
            />
            <input
              value={personHandle}
              onChange={e => setPersonHandle(e.target.value)}
              placeholder="Their @ handle (optional) e.g. @jordan_x"
              style={inputBox}
            />
          </div>

          <button
            onClick={() => setStep('vibe')}
            disabled={!audience}
            style={{
              background: audience ? gr() : C.glass,
              border: 'none', borderRadius: 14, padding: '16px',
              color: 'white', fontSize: 15, fontWeight: 700,
              cursor: audience ? 'pointer' : 'not-allowed',
              width: '100%', fontFamily: 'inherit',
              opacity: audience ? 1 : 0.5,
            }}
          >
            Next →
          </button>
        </>
      )}

      {/* ── VIBE (tone + purpose combined) ── */}
      {step === 'vibe' && (
        <>
          <button onClick={() => setStep('about')} style={back}>← Back</button>
          <Chips />

          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0 }}>
              How do you want to come across?
            </h2>
            <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0' }}>
              Pick a tone
            </p>
          </div>

          <OptionGrid items={TONES} onSelect={t => setTone(t)} />

          {tone && (
            <>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: 0 }}>
                  What's the goal?
                </h2>
                <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0' }}>
                  What do you actually want to achieve?
                </p>
              </div>
              <OptionGrid items={PURPOSES} onSelect={p => { setPurpose(p); setStep('context'); }} />
            </>
          )}
        </>
      )}

      {/* ── CONTEXT ── */}
      {step === 'context' && situation && (
        <>
          <button onClick={() => setStep('vibe')} style={back}>← Back</button>
          <Chips />

          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{situation.emoji}</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0 }}>
              Give it the full picture
            </h2>
            <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0' }}>
              The more detail you add, the better the message will match exactly what you need
            </p>
          </div>

          {/* Story image upload */}
          {situation.id === 'reply_story' && (
            <div>
              {!image ? (
                <label style={{
                  background: C.glass, border: `1px dashed ${C.glassBdr}`,
                  borderRadius: 16, padding: '24px 16px', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 28 }}>📤</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.sub }}>
                    Upload screenshot of their story (optional)
                  </span>
                  <input
                    type="file" accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img src={image} alt="Story" style={{
                    width: '100%', borderRadius: 16, maxHeight: 220,
                    objectFit: 'cover', border: `1px solid ${C.glassBdr}`,
                  }} />
                  <button onClick={() => setImage(null)} style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.7)', border: 'none',
                    borderRadius: '50%', width: 32, height: 32,
                    color: 'white', fontSize: 14, cursor: 'pointer',
                  }}>✕</button>
                </div>
              )}
            </div>
          )}

          {/* Main context */}
          <div style={{
            background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 16, padding: '16px',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, margin: '0 0 10px' }}>
              {situation.id === 'reply_text'
                ? '💬 WHAT EXACTLY DID THEY SAY?'
                : situation.id === 'reply_story'
                ? '📸 DESCRIBE THE POST / CAPTION'
                : '💡 BACKGROUND OR CONTEXT'}
            </p>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder={
                situation.id === 'reply_text'
                  ? "Paste or type exactly what they said to you..."
                  : situation.id === 'reply_story'
                  ? "Describe the story or post — what's in it, their caption, the mood..."
                  : "Tell us anything helpful — how you know them, what you want to say, what topic to bring up..."
              }
              rows={4}
              style={textArea}
            />
          </div>

          {/* Past messages */}
          <div style={{
            background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 16, padding: '16px',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, margin: '0 0 6px' }}>
              🗂️ PASTE PREVIOUS MESSAGES (OPTIONAL BUT HELPS A LOT)
            </p>
            <p style={{ fontSize: 11, color: C.muted, margin: '0 0 10px', lineHeight: 1.5 }}>
              Copy and paste your conversation history so we can match the vibe and reference what's already been said
            </p>
            <textarea
              value={pastMessages}
              onChange={e => setPastMessages(e.target.value)}
              placeholder={
`Example format:
Them: Hey how was your day?
Me: Pretty good actually just tired
Them: Same honestly, been so stressed lately`
              }
              rows={5}
              style={{ ...textArea, fontSize: 13 }}
            />
          </div>

          <button onClick={generate} style={{
            background: gr(), border: 'none', borderRadius: 14,
            padding: '17px', color: 'white', fontSize: 15,
            fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: 'inherit',
          }}>
            Generate Message ✨
          </button>
        </>
      )}

      {/* ── RESULT ── */}
      {step === 'result' && (
        <>
          <button onClick={() => setStep('context')} style={back}>← Back</button>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: C.muted, margin: 0 }}>
            {loading ? 'CRAFTING YOUR MESSAGE...' : "HERE'S WHAT TO SEND"}
          </p>

          <div style={{
            background: gr(145), borderRadius: 24, padding: '24px 20px',
            boxShadow: '0 20px 50px rgba(6,182,212,0.25)',
            minHeight: 120, display: 'flex', alignItems: 'flex-start',
          }}>
            {loading ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', margin: 'auto' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.6)',
                    animation: `popIn 0.6s ${i * 0.15}s ease-in-out infinite alternate`,
                  }} />
                ))}
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>
                  {situation?.emoji}
                </div>
                <p style={{
                  fontSize: 16, fontWeight: 600, color: 'white',
                  lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap',
                }}>
                  {picked}
                </p>
                {(audience || tone) && (
                  <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {personName && <div style={pill()}>👤 {personName}</div>}
                    {audience && <div style={pill()}>{audience.emoji} {audience.label}</div>}
                    {tone     && <div style={pill()}>{tone.emoji} {tone.label}</div>}
                  </div>
                )}
              </div>
            )}
          </div>

          {!loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={copyText} style={{
                background: copied ? C.emerald : C.glass,
                border: `1px solid ${copied ? C.emerald : C.glassBdr}`,
                borderRadius: 14, padding: '16px', color: 'white',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                width: '100%', fontFamily: 'inherit', transition: 'all 0.2s',
              }}>
                {copied ? '✓ Copied!' : '📋 Copy Message'}
              </button>

              <button onClick={generate} style={{
                background: C.glass, border: `1px solid ${C.glassBdr}`,
                borderRadius: 14, padding: '16px', color: 'white',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                width: '100%', fontFamily: 'inherit',
              }}>
                🔄 Try Another Version
              </button>

              <button onClick={reset} style={{
                background: 'transparent', border: 'none', color: C.muted,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                padding: '8px', textAlign: 'center',
              }}>
                Start Over
              </button>
            </div>
          )}
        </>
      )}

      {/* ── HISTORY ── */}
      {step === 'history' && (
        <>
          <button onClick={() => setStep('pick')} style={back}>← Back</button>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0 }}>
            Recent Messages
          </h2>

          {getConnectHistory().length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 14, color: C.muted }}>No messages generated yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {getConnectHistory().map(item => (
                <div key={item.id} style={{
                  background: C.glass, border: `1px solid ${C.glassBdr}`,
                  borderRadius: 16, padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>{item.situationEmoji}</span>
                      {item.personName && (
                        <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>
                          {item.personName}
                        </span>
                      )}
                      {item.audience && (
                        <span style={{ fontSize: 10, color: C.sub }}>· {item.audience}</span>
                      )}
                      {item.tone && (
                        <span style={{ fontSize: 10, color: C.teal }}>· {item.tone}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>
                      {timeAgo(item.timestamp)}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'white', margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {item.message}
                  </p>
                  <button onClick={() => {
                    navigator.clipboard.writeText(item.message);
                  }} style={{
                    background: 'transparent', border: 'none',
                    color: C.muted, fontSize: 11, cursor: 'pointer',
                    fontFamily: 'inherit', padding: '6px 0 0', display: 'block',
                  }}>
                    📋 Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── LIMIT ── */}
      {step === 'limit' && (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 8px' }}>
            Daily limit reached
          </h2>
          <p style={{ fontSize: 13, color: C.sub, marginBottom: 20, lineHeight: 1.6 }}>
            You've used your {FREE_DAILY_CONNECT_LIMIT} free messages today.
            Come back tomorrow or upgrade for unlimited.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => go(13)} style={{
              background: gr(), border: 'none', borderRadius: 14,
              padding: '16px', color: 'white', fontSize: 15,
              fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: 'inherit',
            }}>
              Upgrade to Pro 👑
            </button>
            <button onClick={reset} style={{
              background: C.glass, border: `1px solid ${C.glassBdr}`,
              borderRadius: 14, padding: '16px', color: 'white',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              width: '100%', fontFamily: 'inherit',
            }}>
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
