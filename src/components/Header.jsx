import { useState } from 'react';
import { C, gr } from '../tokens';
import { AVATARS } from '../data/avatars';

export default function Header({ showBack, onBack, streak, avatar, onAvatarChange }) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', background: C.bg,
      borderBottom: `1px solid ${C.border}`, position: 'relative',
    }}>
      {showBack ? (
        <button onClick={onBack} style={{
          background: C.card2, border: `1px solid ${C.border}`,
          borderRadius: 10, width: 36, height: 36, cursor: 'pointer',
          color: 'white', fontSize: 18, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>←</button>
      ) : (
        <button style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: C.sub, fontSize: 20, padding: 4,
        }}>☰</button>
      )}

      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 99, padding: '6px 18px',
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', color: 'white' }}>
          CONVINCE ME
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {streak && (
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 99, padding: '4px 10px',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 12 }}>🔥</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{streak}</span>
          </div>
        )}

        {/* Avatar — tap to change */}
        <button
          onClick={() => setShowPicker(true)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: gr(), border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: 'white',
          }}
        >{avatar || '🎲'}</button>
      </div>

      {/* Avatar picker dropdown */}
      {showPicker && (
        <>
          <div onClick={() => setShowPicker(false)} style={{
            position: 'fixed', inset: 0, zIndex: 90,
          }} />
          <div style={{
            position: 'absolute', top: 56, right: 16, zIndex: 91,
            background: C.card2, border: `1px solid ${C.glassBdr}`,
            borderRadius: 16, padding: 12, width: 200,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
          }}>
            {AVATARS.map(a => (
              <button key={a} onClick={() => { onAvatarChange(a); setShowPicker(false); }} style={{
                width: 38, height: 38, borderRadius: 10,
                background: a === avatar ? gr() : C.glass,
                border: `1px solid ${C.glassBdr}`,
                fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{a}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
