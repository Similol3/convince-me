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

      {/* Left — back arrow or leaderboard trophy */}
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

      {/* Center — app name */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 99, padding: '6px 18px',
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', color: 'white' }}>
          CONVINCE ME
        </span>
      </div>

      {/* Right — streak + upgrade crown + avatar */}
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

      {/* Avatar picker dropdown */}
      {showPicker && (
        <>
          <div onClick={() => setShowPicker(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 90 }} />

          <div style={{
            position: 'absolute', top: 56, right: 16, zIndex: 91,
            background: C.card2, border: `1px solid ${C.glassBdr}`,
            borderRadius: 16, padding: 12, width: 236,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            maxHeight: 400, overflowY: 'auto',
          }}>

            {/* Photo upload — Pro only */}
            {isPro ? (
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: gr(), border: `1px solid ${C.glassBdr}`,
                borderRadius: 12, padding: '10px 12px',
                marginBottom: 12, cursor: 'pointer',
              }}>
                <span style={{ fontSize: 16 }}>🖼️</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
                  Upload Photo
                </span>
                <input
                  type="file" accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 12, padding: '10px 12px', marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>👑</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
                    Custom photos are a Pro feature
                  </span>
                </div>
                <button onClick={() => { setShowPicker(false); onUpgrade(); }} style={{
                  background: gr(), border: 'none', borderRadius: 8,
                  padding: '6px 12px', color: 'white', fontSize: 11,
                  fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', width: '100%',
                }}>
                  Upgrade to Pro →
                </button>
              </div>
            )}

            {/* Free avatars */}
            <div style={{
              fontSize: 10, fontWeight: 700, color: C.muted,
              letterSpacing: '0.08em', marginBottom: 8,
            }}>
              FREE
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8, marginBottom: 14,
            }}>
              {AVATARS.map(a => (
                <button key={a}
                  onClick={() => { onAvatarChange(a); setShowPicker(false); }}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: (a === avatar && !avatarImage) ? gr() : C.glass,
                    border: `1px solid ${C.glassBdr}`,
                    fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >{a}</button>
              ))}
            </div>

            {/* Pro avatars */}
            <div style={{
              fontSize: 10, fontWeight: 700, color: C.gold,
              letterSpacing: '0.08em', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              👑 PRO ONLY
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
            }}>
              {PRO_AVATARS.map(a => (
                isPro ? (
                  <button key={a}
                    onClick={() => { onAvatarChange(a); setShowPicker(false); }}
                    style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: (a === avatar && !avatarImage) ? gr() : C.glass,
                      border: `1px solid rgba(245,158,11,0.4)`,
                      fontSize: 18, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >{a}</button>
                ) : (
                  <div key={a}
                    onClick={() => { setShowPicker(false); onUpgrade(); }}
                    style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${C.glassBdr}`,
                      fontSize: 18, cursor: 'pointer',
                      opacity: 0.45, position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {a}
                    <div style={{
                      position: 'absolute', bottom: 1, right: 2,
                      fontSize: 8, lineHeight: 1,
                    }}>🔒</div>
                  </div>
                )
              ))}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
