import { useState, useEffect } from 'react';
import { C, gr } from '../tokens';
import { getRecentDecisions } from '../lib/db';

const FILTERS = ['ALL', 'FOOD', 'WATCH', 'SOCIAL'];

export default function Battles({ user }) {
  const [filter,    setFilter]    = useState('ALL');
  const [battles,   setBattles]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  // Load real decisions from Supabase
  useEffect(() => {
    if (!user) return;
    getRecentDecisions(user.id).then(data => {
      setBattles(data);
      setLoading(false);
    });
  }, [user]);

  const filtered = battles.filter(b => {
    if (filter === 'ALL')    return true;
    if (filter === 'FOOD')   return b.category === 'food';
    if (filter === 'WATCH')  return b.category === 'watch';
    if (filter === 'SOCIAL') return b.category === 'social';
    return true;
  });

  // Format time ago
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(mins  / 60);
    const days = Math.floor(hrs   / 24);
    if (days > 0)  return `${days} DAY${days > 1 ? 'S' : ''} AGO`;
    if (hrs  > 0)  return `${hrs} HOUR${hrs > 1 ? 'S' : ''} AGO`;
    return `${mins} MIN AGO`;
  }

  return (
    <div style={{
      padding:       '24px 16px',
      display:       'flex',
      flexDirection: 'column',
      gap:           16,
      minHeight:     '100%',
      background:    C.bg,
    }}>

      <div>
        <h2 style={{
          fontSize:   22,
          fontWeight: 900,
          color:      'white',
          margin:     0,
        }}>Recent Battles</h2>
        <p style={{
          fontSize: 13,
          color:    C.sub,
          margin:   '4px 0 0',
        }}>Your decision legacy</p>
      </div>

      {/* Filter chips */}
      <div style={{
        display:       'flex',
        gap:           8,
        overflowX:     'auto',
        paddingBottom: 4,
      }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background:    filter === f ? gr() : C.glass,
            border:        filter === f
              ? 'none' : `1px solid ${C.glassBdr}`,
            borderRadius:  99,
            padding:       '7px 16px',
            color:         'white',
            fontSize:      12,
            fontWeight:    700,
            cursor:        'pointer',
            fontFamily:    'inherit',
            flexShrink:    0,
            letterSpacing: '0.04em',
          }}>{f}</button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding:   '40px 0',
          color:     C.muted,
          fontSize:  14,
        }}>
          Loading battles...
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding:   '60px 20px',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👻</div>
          <div style={{
            fontSize:   16,
            fontWeight: 700,
            color:      'white',
            marginBottom: 6,
          }}>No decisions yet</div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Make your first decision to start your legacy
          </div>
        </div>
      )}

      {/* Battle cards */}
      <div style={{
        display:       'flex',
        flexDirection: 'column',
        gap:           12,
      }}>
        {filtered.map((b, i) => (
          <div key={b.id || i} style={{
            background:   C.glass,
            border:       `1px solid ${C.glassBdr}`,
            borderRadius: 18,
            padding:      '16px',
            cursor:       'pointer',
          }}>

            {/* Top row */}
            <div style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              marginBottom:   10,
            }}>
              <div style={{
                display:    'flex',
                alignItems: 'center',
                gap:        8,
              }}>
                <span style={{
                  fontSize:      10,
                  fontWeight:    700,
                  letterSpacing: '0.1em',
                  color:         C.pink,
                }}>
                  {b.category?.toUpperCase()} MATCHUP
                </span>

                {/* Close call badge */}
                {b.was_close_call && (
                  <div style={{
                    background:   'rgba(239,68,68,0.12)',
                    border:       '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 99,
                    padding:      '2px 8px',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          3,
                  }}>
                    <span style={{ fontSize: 9 }}>🔥</span>
                    <span style={{
                      fontSize:      9,
                      fontWeight:    700,
                      color:         C.red,
                      letterSpacing: '0.08em',
                    }}>HOT</span>
                  </div>
                )}

                {/* Draw badge */}
                {b.was_draw && (
                  <div style={{
                    background:   'rgba(139,92,246,0.15)',
                    border:       '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 99,
                    padding:      '2px 8px',
                  }}>
                    <span style={{
                      fontSize:   9,
                      fontWeight: 700,
                      color:      C.grape,
                    }}>🪙 COIN FLIP</span>
                  </div>
                )}
              </div>

              <span style={{ fontSize: 10, color: C.muted }}>
                {timeAgo(b.created_at)}
              </span>
            </div>

            {/* Options */}
            <div style={{
              fontSize:     15,
              fontWeight:   700,
              color:        'white',
              marginBottom: 14,
            }}>
              {b.option_a} vs {b.option_b}
            </div>

            {/* Winner + votes */}
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
            }}>
              <div style={{
                display:    'flex',
                alignItems: 'center',
                gap:        10,
              }}>
                <div style={{
                  width:          34,
                  height:         34,
                  borderRadius:   10,
                  background:     gr(),
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       16,
                }}>🏆</div>
                <div>
                  <div style={{
                    fontSize:      10,
                    color:         C.muted,
                    letterSpacing: '0.08em',
                  }}>WINNER</div>
                  <div style={{
                    fontSize:   14,
                    fontWeight: 700,
                    color:      'white',
                  }}>{b.winner}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize:      10,
                  color:         C.muted,
                  letterSpacing: '0.08em',
                }}>VOTES</div>
                <div style={{
                  fontSize:   14,
                  fontWeight: 700,
                  color:      'white',
                }}>
                  {b.votes_a} – {b.votes_b}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
 