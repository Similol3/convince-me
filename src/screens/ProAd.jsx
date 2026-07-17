import { useState, useEffect } from 'react';
import { C, gr, grGold } from '../tokens';

const FEATURES = [
  { emoji: '⚡', text: 'Unlimited decisions every day'    },
  { emoji: '💬', text: 'Unlimited AI Connect messages'    },
  { emoji: '✨', text: 'Exclusive Pro avatars'            },
  { emoji: '👑', text: 'Pro badge on your profile'       },
  { emoji: '🚫', text: 'No daily limits, ever'           },
];

export default function ProAd({ onUpgrade, onDismiss, decisionsUsed }) {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);

    // Live countdown to midnight
    function updateCountdown() {
      const now      = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setCountdown(
        `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
      );
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 430,
        background: C.bg,
        borderRadius: '28px 28px 0 0',
        padding: '28px 20px 40px',
        border: `1px solid ${C.glassBdr}`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(60px)',
        transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: C.glassBdr, margin: '0 auto 20px',
        }} />

        {/* Top section — urgency */}
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 14, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
        }}>
          <span style={{ fontSize: 22 }}>⏰</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>
              Limits reset in {countdown}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>
              You've used {decisionsUsed}/3 free decisions today
            </div>
          </div>
        </div>

        {/* Crown + title */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            fontSize: 56, marginBottom: 8,
            filter: 'drop-shadow(0 0 20px rgba(245,158,11,0.5))',
            animation: 'float 2s ease-in-out infinite',
          }}>👑</div>
          <div style={{
            fontSize: 22, fontWeight: 900,
            background: grGold(),
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 4,
          }}>
            Unlock Convince Me Pro
          </div>
          <div style={{ fontSize: 13, color: C.sub }}>
            Make unlimited decisions. No restrictions.
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: C.glass, border: `1px solid ${C.glassBdr}`,
              borderRadius: 12, padding: '11px 14px',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{f.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{f.text}</span>
              <span style={{ marginLeft: 'auto', color: C.emerald, fontSize: 14 }}>✓</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 16,
        }}>
          <div style={{
            flex: 1, background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 14, padding: '14px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>$2.50</div>
            <div style={{ fontSize: 11, color: C.muted }}>per month</div>
          </div>
          <div style={{
            flex: 1, background: gr(), borderRadius: 14,
            padding: '14px', textAlign: 'center', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -8, right: -4,
              background: C.emerald, borderRadius: 99,
              padding: '2px 8px', fontSize: 9, fontWeight: 800, color: 'white',
            }}>SAVE 58%</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>$14.99</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>per year</div>
          </div>
        </div>

        {/* CTA button */}
        <button onClick={onUpgrade} style={{
          background: grGold(), border: 'none', borderRadius: 14,
          padding: '17px', color: '#1A1208', fontSize: 16,
          fontWeight: 800, cursor: 'pointer', width: '100%',
          fontFamily: 'inherit', marginBottom: 10,
        }}>
          Upgrade to Pro ✨
        </button>

        <button onClick={onDismiss} style={{
          background: 'transparent', border: 'none', color: C.muted,
          fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          width: '100%', padding: '8px', textAlign: 'center',
        }}>
          Continue with limited access
        </button>

      </div>
    </div>
  );
}
