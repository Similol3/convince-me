import { useState } from 'react';
import { C, gr } from '../tokens';

export default function Share({ optA, go }) {
  const winner = optA || 'Pizza Night';
  const [shared, setShared] = useState(false);

  async function handleShare() {
    const text = `${winner.toUpperCase()} wins! "Because salad is just a cry for help, and we deserve a cheesy hug." — decided by Convince Me 🎲`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Convince Me', text, url: window.location.origin });
      } catch (e) {
        // user cancelled — do nothing
      }
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    }
  }

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 16, minHeight: '100%', background: C.bg,
    }}>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>
        Share Your Result
      </h2>

      {/* Shareable card */}
      <div style={{
        borderRadius: 28, padding: '28px 24px', textAlign: 'center',
        background: gr(145), boxShadow: '0 24px 60px rgba(139,92,246,0.4)',
        animation: 'slideUp 0.4s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>Convince</div>
            <div style={{
              fontSize: 16, fontWeight: 900, background: 'rgba(255,255,255,0.25)',
              borderRadius: 4, padding: '0 5px', display: 'inline-block', color: 'white',
            }}>Me</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>Decision</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>Made ✓</div>
          </div>
        </div>

        <div style={{ fontSize: 44, marginBottom: 8 }}>🏆</div>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>
          THE VERDICT IS IN
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: 'white', marginBottom: 12 }}>
          {winner.toUpperCase()}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 20 }}>
          "Because salad is just a cry for help, and we deserve a cheesy hug."
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)' }}>
            🎲 CONVINCE ME
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Join the vote → convinceme.app/vote-392
          </div>
        </div>
      </div>

      {/* Social icons */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 0' }}>
        {[
          { e: '📸', l: 'Instagram' },
          { e: '💬', l: 'WhatsApp'  },
          { e: '🔗', l: 'Copy Link' },
          { e: '···', l: 'More'     },
        ].map(s => (
          <div key={s.l} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: C.glass,
              border: `1px solid ${C.glassBdr}`, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 5,
            }}>{s.e}</div>
            <div style={{ fontSize: 9, color: C.muted }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Native share button */}
      <button onClick={handleShare} style={{
        background: gr(), border: 'none', borderRadius: 14,
        padding: '16px', color: 'white', fontSize: 15,
        fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: 'inherit',
      }}>
        {shared ? '✓ Copied to clipboard!' : 'SHARE NOW 🔗'}
      </button>

      <button onClick={() => go(0)} style={{
        background: C.glass, border: `1px solid ${C.glassBdr}`,
        borderRadius: 14, padding: '16px', color: 'white',
        fontSize: 15, fontWeight: 700, cursor: 'pointer',
        width: '100%', fontFamily: 'inherit',
      }}>
        DECIDE AGAIN 🔄
      </button>

      {/* Social proof */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { e: '⚡', l: 'INSTANT DECISION' },
          { e: '🔥', l: '98% SATISFACTION' },
        ].map(b => (
          <div key={b.l} style={{
            flex: 1, background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 99, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ fontSize: 12 }}>{b.e}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.sub, letterSpacing: '0.04em' }}>{b.l}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
