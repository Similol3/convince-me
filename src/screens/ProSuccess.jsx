import { useEffect, useState } from 'react';
import { C, gr, grGold } from '../tokens';
import { PRO_FEATURES } from '../data/pricing';

function Confetti() {
  const COLORS = [C.grape, C.pink, C.gold, C.emerald, '#F87171', '#A78BFA'];
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i, color: COLORS[i % 6],
    left: `${(i / 30) * 105}%`,
    size: `${6 + (i % 5) * 2}px`,
    delay: `${(i * 0.05) % 1.2}s`,
    circle: i % 3 === 0,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 2 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: 0, left: p.left,
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.circle ? '50%' : '3px',
          animation: `confettiFall 2s ${p.delay} ease-in infinite`,
        }} />
      ))}
    </div>
  );
}

export default function ProSuccess({ go }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: C.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', overflowY: 'auto',
    }}>
      <Confetti />

      <div style={{
        zIndex: 3, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 20, width: '100%', maxWidth: 380,
        opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.9)',
        transition: 'all 0.5s ease',
      }}>

        {/* Crown */}
        <div style={{
          fontSize: 72,
          animation: 'float 2s ease-in-out infinite',
          filter: 'drop-shadow(0 0 30px rgba(245,158,11,0.5))',
        }}>👑</div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 32, fontWeight: 900,
            background: grGold(),
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            You're Pro!
          </div>
          <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.5 }}>
            All Pro features are now unlocked.{'\n'}
            Thank you for supporting Convince Me 🙏
          </div>
        </div>

        {/* Unlocked features */}
        <div style={{
          width: '100%', background: C.glass,
          border: `1px solid rgba(245,158,11,0.3)`,
          borderRadius: 20, padding: '20px',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            color: C.gold, marginBottom: 14,
          }}>
            ✨ NOW UNLOCKED
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PRO_FEATURES.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(245,158,11,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>{f.emoji}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{f.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: C.emerald, fontSize: 16 }}>✓</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => go(0)} style={{
          background: grGold(), border: 'none', borderRadius: 14,
          padding: '17px 24px', color: '#1A1208', fontSize: 16,
          fontWeight: 800, cursor: 'pointer', width: '100%',
          fontFamily: 'inherit',
        }}>
          Let's Go 🚀
        </button>

      </div>
    </div>
  );
}
