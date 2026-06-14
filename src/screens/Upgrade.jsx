import { useState } from 'react';
import { C, gr, grGold } from '../tokens';
import { PRO_FEATURES, PRICING } from '../data/pricing';

export default function Upgrade({ user, go }) {
  const [plan, setPlan] = useState('yearly');

  function handleUpgrade() {
    // Payment processing requires a Stripe account (18+ to open).
    // This is a placeholder until that's set up.
    alert("Payments are coming soon! We're setting this up. Check back shortly 💛");
  }

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 20, minHeight: '100%',
      background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(245,158,11,0.2) 0%, ${C.bg} 60%)`,
    }}>

      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>👑</div>
        <div style={{
          fontSize: 28, fontWeight: 900, lineHeight: 1.1,
          background: grGold(), WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Convince Me Pro
        </div>
        <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>
          Unlock everything, support development
        </div>
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PRO_FEATURES.map(f => (
          <div key={f.id} style={{
            background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 16, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>{f.emoji}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{f.label}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan picker */}
      <div style={{ display: 'flex', gap: 10 }}>
        {Object.entries(PRICING).map(([key, p]) => (
          <button key={key} onClick={() => setPlan(key)} style={{
            flex: 1, background: plan === key ? gr() : C.glass,
            border: plan === key ? 'none' : `1px solid ${C.glassBdr}`,
            borderRadius: 16, padding: '16px', cursor: 'pointer',
            fontFamily: 'inherit', textAlign: 'center', position: 'relative',
          }}>
            {p.badge && (
              <div style={{
                position: 'absolute', top: -8, right: -6,
                background: C.emerald, borderRadius: 99,
                padding: '2px 8px', fontSize: 9, fontWeight: 800, color: 'white',
              }}>{p.badge}</div>
            )}
            <div style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>{p.price}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{p.period}</div>
          </button>
        ))}
      </div>

      <button onClick={handleUpgrade} style={{
        background: grGold(), border: 'none', borderRadius: 14,
        padding: '17px', color: '#1A1208', fontSize: 15,
        fontWeight: 800, cursor: 'pointer', width: '100%', fontFamily: 'inherit',
      }}>
        Upgrade to Pro ✨
      </button>

      <button onClick={() => go(8)} style={{
        background: 'transparent', border: 'none', color: C.muted,
        fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
      }}>
        Maybe later
      </button>

    </div>
  );
}
