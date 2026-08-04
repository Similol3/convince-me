import { useState, useRef } from 'react';
import { toBlob } from 'html-to-image';
import { C, gr } from '../tokens';

export default function Share({ optA, aiRecommendation, go }) {
  const winner = optA || 'Your choice';
  const [busy,   setBusy]   = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  const APP_URL = 'https://convince-me-tau.vercel.app';

  async function handleShareImage() {
    if (!cardRef.current) return;
    setBusy(true);

    try {
      const blob = await toBlob(cardRef.current, {
        quality:    0.95,
        pixelRatio: 2,
      });

      if (!blob) throw new Error('blob failed');

      const file = new File([blob], 'convince-me.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files:  [file],
          title:  'Convince Me',
          text:   `${winner.toUpperCase()} wins! Decided by Convince Me 🎲\n${APP_URL}`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = 'convince-me.png';
        a.click();
        URL.revokeObjectURL(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (e) {
      console.error('Share error:', e);
    }

    setBusy(false);
  }

  function handleCopyCaption() {
    const rec  = aiRecommendation ? `\n\n"${aiRecommendation}"` : '';
    const text = `${winner.toUpperCase()} wins! 🏆${rec}\n\nDecided by Convince Me 🎲\nTry it free → ${APP_URL}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 16, minHeight: '100%', background: C.bg,
    }}>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>
        Share Your Result
      </h2>

      {/* ── Shareable card — captured as image ── */}
      <div ref={cardRef} style={{
        borderRadius: 28, padding: '28px 24px',
        background: gr(145),
        boxShadow: '0 24px 60px rgba(139,92,246,0.4)',
      }}>

        {/* Card header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>
              Convince
            </div>
            <div style={{
              fontSize: 16, fontWeight: 900,
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 4, padding: '0 5px',
              display: 'inline-block', color: 'white',
            }}>
              Me
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>
              Decision
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>Made ✓</div>
          </div>
        </div>

        {/* Winner */}
        <div style={{ fontSize: 44, textAlign: 'center', marginBottom: 8 }}>🏆</div>
        <div style={{
          fontSize: 11, letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.65)', marginBottom: 8, textAlign: 'center',
        }}>
          THE VERDICT IS IN
        </div>
        <div style={{
          fontSize: 30, fontWeight: 900, color: 'white',
          marginBottom: 14, textAlign: 'center',
        }}>
          {winner.toUpperCase()}
        </div>

        {/* AI recommendation or fallback */}
        <div style={{
          background: aiRecommendation
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(255,255,255,0.1)',
          borderRadius: 14, padding: '14px 16px', marginBottom: 18,
        }}>
          {aiRecommendation ? (
            <>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.7)', marginBottom: 6,
              }}>
                ✨ AI SAYS
              </div>
              <div style={{
                fontSize: 13, color: 'white', lineHeight: 1.55,
                fontStyle: 'italic',
              }}>
                "{aiRecommendation}"
              </div>
            </>
          ) : (
            <div style={{
              fontSize: 13, color: 'rgba(255,255,255,0.8)',
              fontStyle: 'italic', lineHeight: 1.55, textAlign: 'center',
            }}>
              "The universe has spoken. No further questions."
            </div>
          )}
        </div>

        {/* Footer with app link */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: 14, textAlign: 'center',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.6)',
          }}>
            🎲 CONVINCE ME
          </div>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4,
          }}>
            Try it free → convince-me-tau.vercel.app
          </div>
        </div>

      </div>

      {/* ── Share as image (native share sheet) ── */}
      <button onClick={handleShareImage} disabled={busy} style={{
        background: gr(), border: 'none', borderRadius: 14,
        padding: '16px', color: 'white', fontSize: 15,
        fontWeight: 700, cursor: 'pointer', width: '100%',
        fontFamily: 'inherit', opacity: busy ? 0.6 : 1,
      }}>
        {busy ? 'Preparing image...' : '📸 Share as Image'}
      </button>

      {/* ── Copy caption with link ── */}
      <button onClick={handleCopyCaption} style={{
        background: C.glass, border: `1px solid ${C.glassBdr}`,
        borderRadius: 14, padding: '16px', color: 'white',
        fontSize: 15, fontWeight: 700, cursor: 'pointer',
        width: '100%', fontFamily: 'inherit',
      }}>
        {copied ? '✓ Copied!' : '📋 Copy Caption + Link'}
      </button>

      {/* ── Decide again ── */}
      <button onClick={() => go(0)} style={{
        background: 'transparent', border: `1px solid ${C.glassBdr}`,
        borderRadius: 14, padding: '16px', color: 'white',
        fontSize: 15, fontWeight: 700, cursor: 'pointer',
        width: '100%', fontFamily: 'inherit',
      }}>
        DECIDE AGAIN 🔄
      </button>

      {/* ── Social proof ── */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { e: '⚡', l: 'INSTANT DECISION' },
          { e: '🔥', l: 'AI POWERED'       },
        ].map(b => (
          <div key={b.l} style={{
            flex: 1, background: C.glass,
            border: `1px solid ${C.glassBdr}`,
            borderRadius: 99, padding: '7px 12px',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ fontSize: 12 }}>{b.e}</span>
            <span style={{ fontSize: 10, fontWeight: 700,
              color: C.sub, letterSpacing: '0.04em' }}>{b.l}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
