import { useState } from 'react';
import { C, gr } from '../tokens';
import { CATEGORIES } from '../data/questions';

export default function Options({ go, category }) {
  const [optA,           setOptA]           = useState('');
  const [optB,           setOptB]           = useState('');
  const [error,          setError]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [wantRec,        setWantRec]        = useState(false);

  const cat = CATEGORIES[category] || CATEGORIES.general;

  const inputStyle = {
    width: '100%', background: 'transparent', border: 'none',
    color: C.text, fontSize: 16, fontWeight: 600,
    outline: 'none', fontFamily: 'inherit', padding: 0,
  };

  async function handleContinue() {
    setError('');
    setRecommendation(null);

    if (!optA.trim()) { setError('Please fill in Option A'); return; }
    if (!optB.trim()) { setError('Please fill in Option B'); return; }
    if (optA.trim().toLowerCase() === optB.trim().toLowerCase()) {
      setError("Both options are the same — enter two different things!"); return;
    }

    if (category === 'general') {
      if (wantRec) {
        setLoading(true);
        try {
          const r = await fetch('/api/validate', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              optionA: optA.trim(),
              optionB: optB.trim(),
              category: 'general',
              wantRecommendation: true,
            }),
          });
          const data = await r.json();
          if (data.recommendation) {
            setRecommendation(data.recommendation);
            setLoading(false);
            return;
          }
        } catch { /* fall through */ }
        setLoading(false);
      }
      go(2, optA.trim(), optB.trim(), undefined, undefined, null);
      return;
    }

    setLoading(true);

    try {
      const r = await fetch('/api/validate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionA:            optA.trim(),
          optionB:            optB.trim(),
          category,
          wantRecommendation: wantRec,
        }),
      });
      const data = await r.json();

      if (!data.valid) {
        const examples = {
          food:  `"${cat.placeholderA}" vs "${cat.placeholderB}"`,
          watch: `"${cat.placeholderA}" vs "${cat.placeholderB}"`,
        };
        setError(
          `These don't look like ${cat.label} options. Try something like ${examples[category] || 'valid options'}.`
        );
        setLoading(false);
        return;
      }

      if (wantRec && data.recommendation) {
        setRecommendation(data.recommendation);
        setLoading(false);
        return;
      }

      setLoading(false);
      // Pass recommendation (null if none) so Reveal can use it
      go(2, optA.trim(), optB.trim(), undefined, undefined, null);

    } catch {
      setLoading(false);
      go(2, optA.trim(), optB.trim(), undefined, undefined, null);
    }
  }

  function proceedWithRec() {
    // Pass the recommendation into the decision flow
    go(2, optA.trim(), optB.trim(), undefined, undefined, recommendation);
  }

  function proceedWithoutRec() {
    setRecommendation(null);
    go(2, optA.trim(), optB.trim(), undefined, undefined, null);
  }

  const recLabel = {
    food:    '✨ Give me a food recommendation first',
    watch:   '✨ Recommend which I should watch based on my vibe',
    general: '✨ Get an AI recommendation before we decide',
  };

  const recDesc = {
    food:    'AI will explain which food suits your mood better',
    watch:   'AI will recommend based on mood and what you want to feel',
    general: 'AI will suggest which option is better for your situation',
  };

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 20, minHeight: '100%',
      background: `linear-gradient(180deg, rgba(139,92,246,0.15) 0%, ${C.bg} 45%)`,
    }}>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          color: C.muted, margin: '0 0 6px' }}>
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
      <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`,
        borderRadius: 16, padding: '16px' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          color: C.muted, margin: '0 0 10px' }}>OPTION A</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{cat.emoji}</span>
          <input value={optA}
            onChange={e => { setOptA(e.target.value); setError(''); setRecommendation(null); }}
            placeholder={cat.placeholderA} style={inputStyle} />
        </div>
      </div>

      {/* VS */}
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
      <div style={{ background: C.glass, border: `1px solid ${C.glassBdr}`,
        borderRadius: 16, padding: '16px' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          color: C.muted, margin: '0 0 10px' }}>OPTION B</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{cat.emoji}</span>
          <input value={optB}
            onChange={e => { setOptB(e.target.value); setError(''); setRecommendation(null); }}
            placeholder={cat.placeholderB} style={inputStyle} />
        </div>
      </div>

      {/* AI Recommendation checkbox */}
      <button onClick={() => setWantRec(w => !w)} style={{
        background: wantRec ? 'rgba(139,92,246,0.12)' : C.glass,
        border: `1px solid ${wantRec ? 'rgba(139,92,246,0.4)' : C.glassBdr}`,
        borderRadius: 14, padding: '13px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        transition: 'all 0.15s',
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          background: wantRec ? gr() : 'rgba(255,255,255,0.1)',
          border: `2px solid ${wantRec ? 'transparent' : C.glassBdr}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          {wantRec && <span style={{ fontSize: 12, color: 'white', fontWeight: 800 }}>✓</span>}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
            {recLabel[category] || recLabel.general}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            {recDesc[category] || recDesc.general}
          </div>
        </div>
      </button>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '12px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <span style={{ fontSize: 13, color: '#FCA5A5', fontWeight: 600, lineHeight: 1.4 }}>
            {error}
          </span>
        </div>
      )}

      {/* AI Recommendation result */}
      {recommendation && (
        <div style={{
          background: 'rgba(139,92,246,0.1)',
          border: '1px solid rgba(139,92,246,0.4)',
          borderRadius: 18, padding: '18px 20px',
          animation: 'slideUp 0.35s ease',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            color: C.grape, marginBottom: 10 }}>
            ✨ AI RECOMMENDATION
          </div>
          <p style={{ fontSize: 14, color: 'white', margin: '0 0 16px', lineHeight: 1.65 }}>
            {recommendation}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={proceedWithRec} style={{
              flex: 1, background: gr(), border: 'none', borderRadius: 12,
              padding: '12px', color: 'white', fontSize: 13,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Still let the app decide 🎲
            </button>
            <button onClick={proceedWithoutRec} style={{
              flex: 1, background: C.glass, border: `1px solid ${C.glassBdr}`,
              borderRadius: 12, padding: '12px', color: 'white', fontSize: 13,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Change options
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <button onClick={handleContinue} disabled={loading} style={{
          background: gr(), border: 'none', borderRadius: 14,
          padding: '17px', color: 'white', fontSize: 15,
          fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%', letterSpacing: '0.03em',
          fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {loading ? (
            <>
              <span style={{ fontSize: 13 }}>
                {wantRec ? 'Getting recommendation...' : 'Checking...'}
              </span>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.7)',
                  animation: `popIn 0.5s ${i * 0.1}s ease-in-out infinite alternate`,
                }} />
              ))}
            </>
          ) : 'CONTINUE →'}
        </button>
      </div>

    </div>
  );
}
