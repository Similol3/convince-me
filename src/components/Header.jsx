import { useState } from 'react';
import { C, gr } from '../tokens';
import { resizeImageToBase64 } from '../lib/image';
import { AVATARS, PRO_AVATARS } from '../data/avatars';

export default function Header({
  showBack, onBack, streak,
  avatar, avatarImage, onAvatarChange, onAvatarImageChange,
  isPro, onLeaderboard, onUpgrade,
}) {
  const [showPicker, setShowPicker] = useState(false);

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const resized = await resizeImageToBase64(file, 200);
    onAvatarImageChange(resized);
    setShowPicker(false);
  }

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
        <button onClick={onLeaderboard} style={{
          background: C.card2, border: `1px solid ${C.border}`,
          borderRadius: 10, width: 36, height: 36, cursor: 'pointer',
          color: C.gold, fontSize: 16, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>🏆</button>
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

        {!isPro && (
          <button onClick={onUpgrade} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 14,
          }}>👑</button>
        )}

        <button onClick={() => setShowPicker(true)} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: avatarImage ? 'transparent' : gr(),
          border: avatarImage ? `2px solid ${C.gold}` : 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 16, fontWeight: 700,
          color: 'white', overflow: 'hidden', padding: 0,
        }}>
          {avatarImage
            ? <img src={avatarImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (avatar || '🎲')}
        </button>
      </div>

      {showPicker && (
        <>
          <div onClick={() => setShowPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
          <div style={{
            position: 'absolute', top: 56, right: 16, zIndex: 91,
            background: C.card2, border: `1px solid ${C.glassBdr}`,
            borderRadius: 16, padding: 12, width: 220,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          }}>
            {isPro ? (
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: gr(), border: `1px solid ${C.glassBdr}`,
                borderRadius: 12, padding: '10px 12px', marginBottom: 10, cursor: 'pointer',
              }}>
                <span style={{ fontSize: 16 }}>🖼️</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Upload Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            ) : (
              <div style={{
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 12, padding: '10px 12px', marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>👑</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
                    Custom photos are a Pro feature
                  </span>
                </div>
                <button onClick={() => { setShowPicker(false); onUpgrade(); }} style={{
                  background: gr(), border: 'none', borderRadius: 8,
                  padding: '6px 12px', color: 'white', fontSize: 11,
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                }}>
                  Upgrade to Pro →
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {AVATARS.map(a => (
                <button key={a} onClick={() => { onAvatarChange(a); setShowPicker(false); }} style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: (a === avatar && !avatarImage) ? gr() : C.glass,
                  border: `1px solid ${C.glassBdr}`,
                  fontSize: 18, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{a}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
