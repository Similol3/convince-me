import { useState } from 'react';
import { C, gr } from '../tokens';
import { generateMessage } from '../lib/ai';
import { addConnectHistory, getConnectHistory } from '../lib/storage';
import { AUDIENCES, TONES, PURPOSES } from '../data/connectOptions';
import { FREE_DAILY_CONNECT_LIMIT } from '../data/pricing';

const SITUATIONS = [
  { id: 'reply_story', emoji: '📸', title: 'Reply to their story',
    desc: 'Upload a screenshot — get the perfect reply' },
  { id: 'start_chat',  emoji: '💬', title: 'Start a conversation',
    desc: 'Break the ice with anyone' },
  { id: 'reply_text',  emoji: '💭', title: 'Reply to what they said',
    desc: 'Get the right words for their message' },
];

const backBtn = {
  background: 'transparent', border: 'none', color: C.muted,
  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
  padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
};

export default function Connect({ user, go }) {
  const [step,      setStep]      = useState('pick');
  const [situation, setSituation] = useState(null);
  const [audience,  setAudience]  = useState(null);
  const [tone,      setTone]      = useState(null);
  const [purpose,   setPurpose]   = useState(null);
  const [context,   setContext]   = useState('');
  const [image,     setImage]     = useState(null);
  const [picked,    setPicked]    = useState(null);
  const [copied,    setCopied]    = useState(false);
  const [loading,   setLoading]   = useState(false);

  const isPro = user?.is_pro || false;

  function getTodayCount() {
    const today  = new Date().toISOString().split('T')[0];
    const stored = JSON.parse(localStorage.getItem('cm_connect_count') || '{}');
    return stored.date === today ? stored.count : 0;
  }

  function incrementTodayCount() {
    const today   = new Date().toISOString().split('T')[0];
    const current = getTodayCount();
    localStorage.setItem('cm_connect_count', JSON.stringify({ date: today, count: current + 1 }));
  }

  const todayCount  = getTodayCount();
  const limitReached = !isPro && todayCount >= FREE_DAILY_CONNECT_LIMIT;

  function selectSituation(sit) { setSituation(sit); setStep('audience'); }
  function selectAudience(a)    { setAudience(a);    setStep('tone');     }
  function selectTone(t)        { setTone(t);        setStep('purpose');  }
  function selectPurpose(p)     { setPurpose(p);     setStep('input');    }

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

    const text = await generateMessage(
      situation.id, context, image,
      audience?.id, tone?.id, purpose?.id
    );

    setPicked(text);

    addConnectHistory({
      situationId:    situation.id,
      situationEmoji: situation.emoji,
      situationTitle: situation.title,
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
    setTimeout(() => setCopied(false), 1500);
  }

  function reset() {
    setStep('pick'); setSituation(null); setAudience(null);
    setTone(null); setPurpose(null); setContext('');
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

  // Step progress tracker
  const STEPS = ['pick','audience','tone','purpose','input','result'];
  const stepIndex = STEPS.indexOf(step);
  const showProgress = stepIndex > 0 && step !== 'result' && step !== 'history' && step !== 'limit';

  const GridOptions = ({ items, onSelect, columns = 2 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12 }}>
      {items.map((item, i) => (
        <button key={i} onClick={() => onSelect(item)} style={{
          background: C.glass, border: `1px solid ${C.glassBdr}`,
          borderRadius: 16, padding: '18px 12px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 8, fontFamily: 'inherit', textAlign: 'center',
        }}>
          <span style={{ fontSize: 26 }}>{item.emoji}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );

  const SelectedChips = () => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {situation && (
        <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`, borderRadius: 99, padding: '5px 10px', fontSize: 11, color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
          {situation.emoji} {situation.title}
        </div>
      )}
      {audience && (
        <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`, borderRadius: 99, padding: '5px 10px', fontSize: 11, color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
          {audience.emoji} {audience.label}
        </div>
      )}
      {tone && (
        <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`, borderRadius: 99, padding: '5px 10px', fontSize: 11, color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
          {tone.emoji} {tone.label}
        </div>
      )}
      {purpose && (
        <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`, borderRadius: 99, padding: '5px 10px', fontSize: 11, color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
          {purpose.emoji} {purpose.label}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 20, minHeight: '100%',
      background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(6,182,212,0.18) 0%, ${C.bg} 60%)`,
    }}>

      {/* Step progress bar */}
      {showProgress && (
        <div>
          <div style={{ height: 4, background: C.glass, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, background: gr(),
              width: `${((stepIndex) / 4) * 100}%`, transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 4, textAlign: 'right', fontWeight: 700, letterSpacing: '0.06em' }}>
            STEP {stepIndex} OF 4
          </div>
        </div>
      )}

      {/* ── PICK SITUATION ── */}
      {step === 'pick' && (
        <>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'white', margin: 0 }}>
              Need something to say?
            </h1>
            <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0', lineHeight: 1.5 }}>
              Answer a few quick questions and we'll craft the perfect message.
            </p>
          </div>

          {!isPro && (
            <div style={{
              background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 12, padding: '10px 14px', fontSize: 12, color: C.sub,
            }}>
              {FREE_DAILY_CONNECT_LIMIT - todayCount} free messages left today
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
              <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Recent messages</span>
            </div>
            <span style={{ color: C.muted, fontSize: 16 }}>›</span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SITUATIONS.map(sit => (
              <button key={sit.id} onClick={() => selectSituation(sit)} style={{
                background: C.glass, border: `1px solid ${C.glassBdr}`,
                borderRadius: 18, padding: '18px', display: 'flex',
                alignItems: 'center', gap: 14, cursor: 'pointer',
                fontFamily: 'inherit', textAlign: 'left',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(6,182,212,0.15)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                }}>{sit.emoji}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{sit.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sit.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── AUDIENCE ── */}
      {step === 'audience' && (
        <>
          <button onClick={() => setStep('pick')} style={backBtn}>← Back</button>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0 }}>
              Who's this for?
            </h2>
            <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0' }}>
              Helps us get the right energy
            </p>
          </div>
          <GridOptions items={AUDIENCES} onSelect={selectAudience} />
        </>
      )}

      {/* ── TONE ── */}
      {step === 'tone' && (
        <>
          <button onClick={() => setStep('audience')} style={backBtn}>← Back</button>
          <SelectedChips />
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0 }}>
              What's the vibe?
            </h2>
            <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0' }}>
              How do you want to come across?
            </p>
          </div>
          <GridOptions items={TONES} onSelect={selectTone} />
        </>
      )}

      {/* ── PURPOSE ── */}
      {step === 'purpose' && (
        <>
          <button onClick={() => setStep('tone')} style={backBtn}>← Back</button>
          <SelectedChips />
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0 }}>
              What's the goal?
            </h2>
            <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0' }}>
              What do you actually want to achieve?
            </p>
          </div>
          <GridOptions items={PURPOSES} onSelect={selectPurpose} />
        </>
      )}

      {/* ── INPUT ── */}
      {step === 'input' && situation && (
        <>
          <button onClick={() => setStep('purpose')} style={backBtn}>← Back</button>
          <SelectedChips />

          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{situation.emoji}</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0 }}>
              {situation.title}
            </h2>
            <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0' }}>
              {situation.id === 'reply_story'
                ? 'Upload a screenshot for a tailored reply, or just describe the post'
                : situation.id === 'reply_text'
                ? 'Paste or type exactly what they said'
                : 'Add any details that will help personalise the message'}
            </p>
          </div>

          {situation.id === 'reply_story' && (
            <div>
              {!image ? (
                <label style={{
                  background: C.glass, border: `1px dashed ${C.glassBdr}`,
                  borderRadius: 16, padding: '32px 16px', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 28 }}>📤</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.sub }}>
                    Tap to upload a screenshot (optional)
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img src={image} alt="Story" style={{
                    width: '100%', borderRadius: 16, maxHeight: 240,
                    objectFit: 'cover', border: `1px solid ${C.glassBdr}`,
                  }} />
                  <button onClick={() => setImage(null)} style={{
                    position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)',
                    border: 'none', borderRadius: '50%', width: 32, height: 32,
                    color: 'white', fontSize: 16, cursor: 'pointer',
                  }}>✕</button>
                </div>
              )}
            </div>
          )}

          <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`, borderRadius: 16, padding: '16px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, margin: '0 0 10px' }}>
              {situation.id === 'reply_text'
                ? "WHAT EXACTLY DID THEY SAY?"
                : situation.id === 'reply_story'
                ? "DESCRIBE THE STORY/POST (OPTIONAL)"
                : "ADD CONTEXT (OPTIONAL)"}
            </p>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder={
                situation.id === 'reply_story'
                  ? "e.g. She posted a photo at the beach looking happy..."
                  : situation.id === 'start_chat'
                  ? "e.g. We met at school last week, both into music..."
                  : "e.g. He said he failed his exam and feels stupid..."
              }
              rows={4}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                color: C.text, fontSize: 14, fontWeight: 500, outline: 'none',
                fontFamily: 'inherit', resize: 'none',
              }}
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
          <button onClick={() => setStep('input')} style={backBtn}>← Back</button>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: C.muted, margin: 0 }}>
            {loading ? 'CRAFTING YOUR MESSAGE...' : "HERE'S WHAT TO SEND"}
          </p>

          <div style={{
            background: gr(145), borderRadius: 24, padding: '24px 20px',
            boxShadow: '0 20px 50px rgba(6,182,212,0.25)',
            minHeight: 100, display: 'flex', alignItems: 'center',
          }}>
            {loading ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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
                <div style={{ fontSize: 28, marginBottom: 10 }}>{situation?.emoji}</div>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'white', lineHeight: 1.55, margin: 0 }}>
                  "{picked}"
                </p>
                {audience && tone && (
                  <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                    {audience.emoji} {audience.label} · {tone.emoji} {tone.label}
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
                🔄 Generate Another
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
          <button onClick={() => setStep('pick')} style={backBtn}>← Back</button>
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
                      <span style={{ fontSize: 14 }}>{item.situationEmoji}</span>
                      {item.audience && <span style={{ fontSize: 10, color: C.gold, fontWeight: 700 }}>{item.audience}</span>}
                      {item.tone && <span style={{ fontSize: 10, color: C.teal, fontWeight: 700 }}>· {item.tone}</span>}
                      {item.purpose && <span style={{ fontSize: 10, color: C.muted }}>· {item.purpose}</span>}
                    </div>
                    <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>{timeAgo(item.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'white', margin: 0, lineHeight: 1.5 }}>
                    "{item.message}"
                  </p>
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
            Come back tomorrow or upgrade for unlimited access.
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
