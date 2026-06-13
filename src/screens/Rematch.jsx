import { C, gr } from '../tokens';

export default function Rematch({ go }) {
  return (
    <div style={{
      padding:       '24px 16px',
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           24,
      minHeight:     '100%',
      background:    C.bg,
    }}>

      {/* Dethroned loser */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{
            fontSize:   26,
            fontWeight: 900,
            color:      'rgba(255,255,255,0.3)',
            fontStyle:  'italic',
          }}>
            PIZZA NIGHT
          </span>
          {/* Strikethrough line */}
          <div style={{
            position:     'absolute',
            top:          '50%',
            left:         -6,
            right:        -6,
            height:       3,
            background:   C.red,
            borderRadius: 2,
            boxShadow:    `0 0 12px ${C.red}`,
            transform:    'rotate(-2deg)',
          }} />
        </div>
        <div style={{
          fontSize:      10,
          fontWeight:    700,
          letterSpacing: '0.14em',
          color:         C.red,
          marginTop:     6,
        }}>
          DETHRONED
        </div>
      </div>

      {/* Down arrow */}
      <div style={{
        width:          36,
        height:         36,
        borderRadius:   '50%',
        background:     C.glass,
        border:         `1px solid ${C.glassBdr}`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       14,
        color:          C.sub,
      }}>↓</div>

      {/* New champion card */}
      <div style={{
        width:        '100%',
        background:   C.glass,
        border:       `1px solid ${C.emerald}`,
        borderRadius: 24,
        padding:      '24px 20px',
        textAlign:    'center',
        boxShadow:    '0 0 28px rgba(16,185,129,0.15)',
      }}>
        <div style={{
          fontSize:      10,
          fontWeight:    700,
          letterSpacing: '0.14em',
          color:         C.emerald,
          marginBottom:  10,
        }}>
          NEW ULTIMATE CHAMPION
        </div>
        <div style={{
          fontSize:   32,
          fontWeight: 900,
          color:      'white',
          marginBottom: 12,
        }}>
          SUSHI BAR
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex',
          justifyContent: 'center', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width:        i === 0 ? 24 : 8,
              height:       3,
              borderRadius: 2,
              background:   i === 0 ? C.emerald : C.glass,
            }} />
          ))}
        </div>

        <div style={{
          marginTop:  10,
          fontSize:   11,
          color:      C.muted,
        }}>
          Close call · 1 vote difference 🔥
        </div>
      </div>

      {/* Buttons */}
      <div style={{ width: '100%',
        display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => go(3)} style={{
          background: gr(), border: 'none', borderRadius: 14,
          padding: '16px', color: 'white', fontSize: 15,
          fontWeight: 700, cursor: 'pointer', width: '100%',
          fontFamily: 'inherit',
        }}>
          LOCK IT IN 🔒
        </button>
        <button style={{
          background: C.glass, border: `1px solid ${C.glassBdr}`,
          borderRadius: 14, padding: '16px', color: 'white',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          width: '100%', fontFamily: 'inherit',
        }}>
          SEE VOTING BREAKDOWN
        </button>
      </div>

    </div>
  );
}
