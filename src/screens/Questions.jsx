import { useState } from 'react';
import { C, gr } from '../tokens';
import { CATEGORIES } from '../data/questions';

export default function Questions({ go, category }) {
  const QUESTIONS = (CATEGORIES[category] || CATEGORIES.general).questions;

  const [step,       setStep]       = useState(0);
  const [sel,        setSel]        = useState(null);
  const [animKey,    setAnimKey]    = useState(0);
  const [allAnswers, setAllAnswers] = useState([]);

  const q   = QUESTIONS[step];
  const pct = ((step / 3) * 100) + 33;

  function pick(i) {
    setSel(i);
    const newAnswers = [...allAnswers, i];
    setAllAnswers(newAnswers);

    setTimeout(() => {
      if (step < 2) {
        setStep(s => s + 1);
        setSel(null);
        setAnimKey(k => k + 1);
      } else {
        go(3, undefined, undefined, newAnswers);
      }
    }, 350);
  }

  return (
    <div style={{
      padding: '16px 16px', display: 'flex', flexDirection: 'column',
      gap: 22, minHeight: '100%',
      background: `radial-gradient(ellipse 100% 50% at 50% 110%, rgba(236,72,153,0.15) 0%, ${C.bg} 55%)`,
    }}>

      {/* Progress bar */}
      <div>
        <div style={{ height: 6, background: C.glass, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            height: '100%', width: `${pct}%`, background: gr(),
            borderRadius: 3, transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: C.muted }}>
            STEP {step + 1} OF 3
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.grape }}>
            {Math.round(pct)}% COMPLETE
          </span>
        </div>
      </div>

      {/* Question */}
      <div key={animKey} style={{ animation: 'slideUp 0.3s ease' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: '0 0 22px', lineHeight: 1.2 }}>
          {q.q}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {q.opts.map((opt, i) => (
            <button key={i} onClick={() => pick(i)} style={{
              background: sel === i ? gr() : C.glass,
              border: sel === i ? 'none' : `1px solid ${C.glassBdr}`,
              borderRadius: 16, padding: '22px 14px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              transform: sel === i ? 'scale(1.03)' : 'scale(1)',
              transition: 'all 0.15s ease', fontFamily: 'inherit',
            }}>
              <span style={{ fontSize: 28 }}>{opt.e}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{opt.l}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'auto' }}>
        <span style={{ fontSize: 11, color: C.muted, letterSpacing: '0.06em' }}>
          🔒 SECURE SESSION ACTIVE
        </span>
      </div>

    </div>
  );
}
