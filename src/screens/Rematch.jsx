import { useState, useRef } from 'react';
import { C, gr } from '../tokens';
import { generateVotes } from '../lib/algorithm';

export default function Rematch({ result, onDecided, go }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!result) {
    return (
      <div style={{
        padding: '60px 16px', textAlign: 'center', minHeight: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: 48 }}>🤔</div>
        <p style={{ color: C.muted, fontSize: 14 }}>No recent decision to rematch</p>
        <button onClick={() => go(0)} style={{
          background: gr(), border: 'none', borderRadius: 14,
          padding: '14px 28px', color: 'white', fontSize: 14,
          fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>Go Home</button>
      </div>
    );
  }

  const { optA, optB, winner: prevWinner, loser: prevLoser, category } = result;

  const rematch = useRef(generateVotes([1, 1, 1]));
  const { vA, vB } = rematch.current;

  const newWinner = vA >= vB ? optA : optB;
  const newLoser  = newWinner === optA ? optB : optA;
  const sameChampion = newWinner === prevWinner;
  const diff = Math.abs(vA - vB);

  function handleLockIn() {
    onDecided({ optA, optB, winner: newWinner, loser: newLoser, category });
    go(4); // Share
  }

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 24, minHeight: '100%', background: C.bg,
    }}>

      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{
            fontSize: 26, fontWeight: 900,
            color: sameChampion ? 'white' : 'rgba(255,255,255,0.3)',
            fontStyle: sameChampion ? 'normal' : 'italic',
          }}>
            {prevWinner.toUpperCase()}
          </span>
          {!sameChampion && (
            <div style={{
              position: 'absolute', top: '50%', left: -6, right: -6,
              height: 3, background: C.red, borderRadius: 2,
              boxShadow: `0 0 12px ${C.red}`, transform: 'rotate(-2deg)',
            }} />
          )}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
          color: sameChampion ? C.emerald : C.red, marginTop: 6,
        }}>
          {sameChampion ? 'TITLE DEFENDED 🛡️' : 'DETHRONED'}
        </div>
      </div>

      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: C.glass, border: `1px solid ${C.glassBdr}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, color: C.sub,
      }}>↓</div>

      <div style={{
        width: '100%', background: C.glass,
        border: `1px solid ${sameChampion ? C.gold : C.emerald}`,
        borderRadius: 24, padding: '24px 20px', textAlign: 'center',
        boxShadow: `0 0 28px ${sameChampion ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'}`,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
          color: sameChampion ? C.gold : C.emerald, marginBottom: 10,
        }}>
          {sameChampion ? 'STILL THE CHAMPION 👑' : 'NEW ULTIMATE CHAMPION'}
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 12 }}>
          {newWinner.toUpperCase()}
        </div>

        {showBreakdown && (
          <div style={{
            marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.glassBdr}`,
            display: 'flex', justifyContent: 'space-around', fontSize: 13,
          }}>
            <div>
              <div style={{ fontWeight: 700, color: 'white' }}>{optA}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{vA} votes</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white' }}>{optB}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{vB} votes</div>
            </div>
          </div>
        )}

        {!sameChampion && (
          <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>
            {diff <= 2 ? `Close call · ${diff} vote difference 🔥` : `Won by ${diff} votes`}
          </div>
        )}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={handleLockIn} style={{
          background: gr(), border: 'none', borderRadius: 14,
          padding: '16px', color: 'white', fontSize: 15,
          fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: 'inherit',
        }}>
          LOCK IT IN 🔒
        </button>
        <button onClick={() => setShowBreakdown(s => !s)} style={{
          background: C.glass, border: `1px solid ${C.glassBdr}`,
          borderRadius: 14, padding: '16px', color: 'white',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          width: '100%', fontFamily: 'inherit',
        }}>
          {showBreakdown ? 'Hide' : 'See'} Voting Breakdown
        </button>
      </div>

    </div>
  );
}

