import { useState } from 'react';
import { C, gr } from '../tokens';
import { getLevelInfo } from '../data/levels';
import { getSetting, setSetting, KEYS, clearConnectHistory } from '../lib/storage';
import { supabase } from '../lib/supabase';

function Toggle({ on, toggle }) {
  return (
    <button onClick={toggle} style={{
      width: 48, height: 26, borderRadius: 13,
      background: on ? gr() : C.glass,
      border: on ? 'none' : `1px solid ${C.glassBdr}`,
      cursor: 'pointer', position: 'relative',
      transition: 'background 0.2s', padding: 0, flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 4, width: 18, height: 18,
        borderRadius: '50%', background: 'white',
        left: on ? 26 : 4, transition: 'left 0.2s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

function Row({ icon, iconBg, title, sub, toggle, on, onClick, danger }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: danger ? C.red : 'white' }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{sub}</div>
      </div>
      {toggle
        ? <Toggle on={on} toggle={toggle} />
        : <span style={{ color: C.muted, fontSize: 16 }}>›</span>
      }
    </div>
  );
}

export default function Settings({ user }) {
  const [sound,  setSound]  = useState(() => getSetting(KEYS.SOUND, true));
  const [haptic, setHaptic] = useState(() => getSetting(KEYS.HAPTIC, true));
  const [showConfirm, setShowConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  const totalXP = user?.xp || 0;
  const lvl = getLevelInfo(totalXP);

  function toggleSound() {
    const newVal = !sound;
    setSound(newVal);
    setSetting(KEYS.SOUND, newVal);
  }

  function toggleHaptic() {
    const newVal = !haptic;
    setHaptic(newVal);
    setSetting(KEYS.HAPTIC, newVal);
    if (newVal && navigator.vibrate) navigator.vibrate(10);
  }

  async function handleClearHistory() {
    if (!user) return;

    // Clear decisions from Supabase
    await supabase.from('decisions').delete().eq('user_id', user.id);

    // Clear local Connect history
    clearConnectHistory();

    // Reset user stats
    await supabase.from('users').update({
      total_decisions: 0,
      streak: 0,
    }).eq('id', user.id);

    setShowConfirm(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  }

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 24, minHeight: '100%', background: C.bg,
    }}>

      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          color: C.muted, margin: '4px 0 0' }}>SYSTEM PREFERENCES</p>
      </div>

      {/* XP card */}
      <div style={{
        background: C.glass, border: `1px solid ${C.glassBdr}`,
        borderRadius: 20, padding: '18px 18px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>
              {lvl.emoji} {lvl.title}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Level {lvl.level}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{totalXP} XP</div>
            {lvl.nextXP && (
              <div style={{ fontSize: 11, color: C.muted }}>Next: {lvl.nextXP} XP</div>
            )}
          </div>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)',
          borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${lvl.progress}%`,
            background: `linear-gradient(90deg, ${C.gold}, #FCD34D)`,
            borderRadius: 3, transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* Preferences */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          color: C.muted, margin: '0 0 10px' }}>PREFERENCES</p>
        <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`,
          borderRadius: 20, overflow: 'hidden' }}>
          <Row
            icon="🔊" iconBg="rgba(139,92,246,0.25)"
            title="Sound Effects" sub="UI clicks and win chimes"
            toggle={toggleSound} on={sound}
          />
          <div style={{ height: 1, background: C.border, margin: '0 16px' }} />
          <Row
            icon="📳" iconBg="rgba(6,182,212,0.2)"
            title="Haptic Feedback" sub="Tactile voting response"
            toggle={toggleHaptic} on={haptic}
          />
        </div>
      </div>

      {/* Data */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          color: C.muted, margin: '0 0 10px' }}>DATA MANAGEMENT</p>
        <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`,
          borderRadius: 20, overflow: 'hidden' }}>
          <Row
            icon="🗑️" iconBg="rgba(239,68,68,0.2)"
            title="Clear History"
            sub="Wipe all decisions and Connect history"
            onClick={() => setShowConfirm(true)} danger
          />
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 24,
        }}>
          <div style={{
            background: C.card2, border: `1px solid ${C.glassBdr}`,
            borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 340,
          }}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white',
              textAlign: 'center', margin: '0 0 8px' }}>
              Clear all history?
            </h3>
            <p style={{ fontSize: 13, color: C.sub, textAlign: 'center',
              margin: '0 0 20px', lineHeight: 1.5 }}>
              This will permanently delete all your decisions, battles, and Connect history. This can't be undone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={handleClearHistory} style={{
                background: C.red, border: 'none', borderRadius: 12,
                padding: '14px', color: 'white', fontSize: 14,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>Yes, clear everything</button>
              <button onClick={() => setShowConfirm(false)} style={{
                background: C.glass, border: `1px solid ${C.glassBdr}`,
                borderRadius: 12, padding: '14px', color: 'white',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Cleared confirmation toast */}
      {cleared && (
        <div style={{
          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 14, padding: '12px 16px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.emerald }}>
            ✓ History cleared successfully
          </span>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 12 }}>
        <div style={{ fontSize: 13, color: C.muted }}>Version 1.0.0</div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.18)', marginTop: 4 }}>
          MADE FOR THE CHRONICALLY INDECISIVE.
        </div>
      </div>

    </div>
  );
}
