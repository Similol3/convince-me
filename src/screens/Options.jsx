import { useState } from 'react';
import { C, gr } from '../tokens';
import { CATEGORIES } from '../data/questions';

export default function Options({ go, category }) {
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [error, setError] = useState('');

  const cat = CATEGORIES[category] || CATEGORIES.general;

  const inputStyle = {
    width: '100%', background: 'transparent', border: 'none',
    color: C.text, fontSize: 16, fontWeight: 600, outline: 'none',
    fontFamily: 'inherit', padding: 0,
  };

  function handleContinue() {
    if (!optA.trim() || !optB.trim()) {
      setError('Please fill in both options to continue');
      return;
    }
    setError('');
    go(2, optA.trim(), optB.trim());
  }

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 20, minHeight: '100%',
      background: `linear-gradient(180deg, rgba(139,92,246,0.15) 0%, ${C.bg} 45%)`,
    }}>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: C.muted, margin: '0 0 6px' }}>
          {cat.emoji} {cat.label.toUpperCase()} · DECIDE IN 30s
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, lineHeight: 1.2 }}>
          What's the dilemma?
        </h1>
        <p style={{ fontSize: 14, color: C.sub, margin: '4px 0 0' }}>
          Enter two options below
        </p>
      </div>

      {/* Option A */}
      <div style={{
        background: error && !optA.trim() ? 'rgba(239,68,68,0.06)' : C.glass,
        border: `1px solid ${error && !optA.trim() ? 'rgba(239,68,68,0.4)' : C.glassBdr}`,
        borderRadius: 16, padding: '16px', transition: 'all 0.2s',
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, margin: '0 0 10px' }}>
          OPTION A
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{cat.emoji}</span>
          <input
            value={optA}
            onChange={e => { setOptA(e.target.value); setError(''); }}
            placeholder={cat.placeholderA}
            style={inputStyle}
          />
        </div>
      </div>

      {/* VS badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <div style={{
          width: 46, height: 46, borderRadius: '50%', background: gr(),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 900, color: 'white',
          boxShadow: '0 0 24px rgba(139,92,246,0.5)',
        }}>VS</div>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      {/* Option B */}
      <div style={{
        background: error && !optB.trim() ? 'rgba(239,68,68,0.06)' : C.glass,
        border: `1px solid ${error && !optB.trim() ? 'rgba(239,68,68,0.4)' : C.glassBdr}`,
        borderRadius: 16, padding: '16px', transition: 'all 0.2s',
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, margin: '0 0 10px' }}>
          OPTION B
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{cat.emoji}</span>
          <input
            value={optB}
            onChange={e => { setOptB(e.target.value); setError(''); }}
            placeholder={cat.placeholderB}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 600 }}>
            {error}
          </span>
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={handleContinue}
          style={{
            background: gr(), border: 'none', borderRadius: 14,
            padding: '17px', color: 'white', fontSize: 15,
            fontWeight: 700, cursor: 'pointer', width: '100%',
            letterSpacing: '0.03em', fontFamily: 'inherit',
          }}>
          CONTINUE →
        </button>
      </div>

    </div>
  );
}
