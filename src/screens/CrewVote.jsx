import { useState, useEffect } from 'react';
import { C, gr } from '../tokens';

export default function CrewVote({ shareToken }) {
  const [data,    setData]    = useState(null);
  const [voted,   setVoted]   = useState(false);
  const [voting,  setVoting]  = useState(false);
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/get-crew-decision?token=${shareToken}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [shareToken]);

  async function castVote(choice) {
    if (!name.trim()) return;
    setVoting(true);

    await fetch('/api/vote-crew-decision', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shareToken,
        choice,
        voterName: name.trim(),
      }),
    });

    setVoted(true);
    setVoting(false);

    // Refresh counts
    const fresh = await fetch(`/api/get-crew-decision?token=${shareToken}`).then(r => r.json());
    setData(fresh);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 32 }}>🎲</div>
      </div>
    );
  }

  if (!data?.decision) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🤷</div>
        <div style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>
          This dilemma doesn't exist or has expired
        </div>
      </div>
    );
  }

  const { decision, votesA, votesB } = data;
  const total = votesA + votesB;

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 430, padding: '40px 20px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>
            🎲 CONVINCE ME
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'white', lineHeight: 1.4 }}>
            @{decision.users?.username || 'Someone'} needs help deciding
          </div>
        </div>

        {!voted ? (
          <>
            {/* Name input first */}
            {!name && (
              <div style={{
                background: C.glass, border: `1px solid ${C.glassBdr}`,
                borderRadius: 16, padding: 16,
              }}>
                <p style={{ fontSize: 12, color: C.muted, margin: '0 0 10px' }}>
                  What's your name?
                </p>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.08)',
                    border: `1px solid ${C.glassBdr}`, borderRadius: 10,
                    padding: '12px 14px', color: 'white', fontSize: 14,
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {name && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <button
                  disabled={voting}
                  onClick={() => castVote('A')}
                  style={{
                    background: gr(), border: 'none', borderRadius: 18,
                    padding: '28px 20px', color: 'white',
                    fontSize: 20, fontWeight: 900, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {decision.option_a}
                </button>

                <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, fontWeight: 700 }}>
                  OR
                </div>

                <button
                  disabled={voting}
                  onClick={() => castVote('B')}
                  style={{
                    background: 'linear-gradient(135deg, #EC4899, #F59E0B)',
                    border: 'none', borderRadius: 18,
                    padding: '28px 20px', color: 'white',
                    fontSize: 20, fontWeight: 900, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {decision.option_b}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{
            background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 20, padding: 24, textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 16 }}>
              Vote counted!
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{decision.option_a}</span>
                  <span style={{ color: C.muted, fontSize: 12 }}>{votesA} votes</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                  <div style={{
                    height: '100%', borderRadius: 4, background: gr(),
                    width: `${total ? (votesA / total) * 100 : 0}%`,
                  }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{decision.option_b}</span>
                  <span style={{ color: C.muted, fontSize: 12 }}>{votesB} votes</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    background: 'linear-gradient(90deg, #EC4899, #F59E0B)',
                    width: `${total ? (votesB / total) * 100 : 0}%`,
                  }} />
                </div>
              </div>
            </div>

            <a href="https://convince-me-tau.vercel.app" style={{
              display: 'block', marginTop: 20, background: gr(),
              borderRadius: 12, padding: '14px', color: 'white',
              fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}>
              Try Convince Me →
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
