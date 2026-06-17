import { useState } from 'react';
import { C, gr } from '../tokens';
import { CATEGORIES } from '../data/questions';

export default function Options({ go, category }) {
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState('');

  const cat = CATEGORIES[category] || CATEGORIES.general;

  const inputStyle = {
    width: '100%', background: 'transparent', border: 'none',
    color: C.text, fontSize: 16, fontWeight: 600, outline: 'none',
    fontFamily: 'inherit', padding: 0,
  };

  function validate(val, field) {
    if (!val.trim()) {
      setError(`Please enter ${field === 'a' ? 'Option A' : 'Option B'}`);
      setErrorField(field);
      return false;
    }

    if (category !== 'general' && !cat.validateInput(val)) {
      const categoryName = cat.label;
      const hint = cat.inputHint;
      setError(`This looks like it might not be a ${categoryName} option. ${hint}`);
      setErrorField(field);
      return false;
    }

    return true;
  }

  function handleContinue() {
    setError('');
    setErrorField('');

    if (!validate(optA, 'a')) return;
    if (!validate(optB, 'b')) return;

    if (optA.trim().toLowerCase() === optB.trim().toLowerCase()) {
      setError("Both options are the same — enter two different things!");
      setErrorField('both');
      return;
    }

    go(2, optA.trim(), optB.trim());
  }

  const getCardBorder = (field) => {
    if (errorField === field || errorField === 'both') {
      return '1px solid rgba(239,68,68,0.5)';
    }
    return `1px solid ${C.glassBdr}`;
  };

  const getCardBg = (field, val) => {
    if (errorField === field || errorField === 'both') {
      return 'rgba(239,68,68,0.06)';
    }
    return C.glass;
  };

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 20, minHeight: '100%',
      background: `linear-gradient(180deg, rgba(139,92,246,0.15) 0%, ${C.bg} 45%)`,
    }}>

      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          color: C.muted, margin: '0 0 6px',
        }}>
          {cat.emoji} {cat.label.toUpperCase()} · DECIDE IN 30s
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, lineHeight: 1.2 }}>
          What's the dilemma?
        </h1>
        <p style={{ fontSize: 13, color: C.sub, margin: '4px 0 0' }}>
          {cat.inputHint}
        </p>
      </div>

      {/* Option A */}
      <div style={{
        background: getCardBg('a', optA),
        border: getCardBorder('a'),
        borderRadius: 16, padding: '16px', transition: 'all 0.2s',
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          color: C.muted, margin: '0 0 10px',
        }}>OPTION A</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{cat.emoji}</span>
          <input
            value={optA}
            onChange={e => { setOptA(e.target.value); setError(''); setErrorField(''); }}
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
        background: getCardBg('b', optB),
        border: getCardBorder('b'),
        borderRadius: 16, padding: '16px', transition: 'all 0.2s',
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          color: C.muted, margin: '0 0 10px',
        }}>OPTION B</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{cat.emoji}</span>
          <input
            value={optB}
            onChange={e => { setOptB(e.target.value); setError(''); setErrorField(''); }}
            placeholder={cat.placeholderB}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '12px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <span style={{ fontSize: 13, color: '#FCA5A5', fontWeight: 600, lineHeight: 1.4 }}>
            {error}
          </span>
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <button onClick={handleContinue} style={{
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
