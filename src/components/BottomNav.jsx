import { C, gr } from '../tokens';

const NAV_ITEMS = [
  { icon: '⚡', label: 'Decide'  },
  { icon: '💬', label: 'Connect' },
  { icon: '📊', label: 'Battles' },
  { icon: '👤', label: 'Profile' },
];

export default function BottomNav({ active, setActive }) {
  return (
    <div style={{
      position:     'fixed',
      bottom:       12,
      left:         '50%',
      transform:    'translateX(-50%)',
      width:        'calc(100% - 24px)',
      maxWidth:     406, // 430 - 24 for side margins
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'space-around',
      padding:      '10px 16px 14px',
      borderRadius: 32,
      boxSizing:    'border-box',

      background:           'rgba(255,255,255,0.06)',
      backdropFilter:       'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      border:               '1px solid rgba(255,255,255,0.10)',
      boxShadow:            '0 8px 32px rgba(0,0,0,0.4)',

      zIndex: 50,
    }}>
      {NAV_ITEMS.map((item, i) => {
        const on = active === i;
        return (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              background:    on ? gr() : 'transparent',
              border:        'none',
              borderRadius:  on ? 50 : 0,
              width:         on ? 48 : 'auto',
              height:        on ? 48 : 'auto',
              padding:       on ? 0 : '6px 12px',
              cursor:        'pointer',
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              justifyContent:'center',
              gap:           3,
              fontFamily:    'inherit',
              transition:    'all 0.2s ease',
              boxShadow:     on
                ? '0 4px 16px rgba(139,92,246,0.45)'
                : 'none',
            }}
          >
            <span style={{ fontSize: on ? 20 : 17 }}>
              {item.icon}
            </span>
            {!on && (
              <span style={{
                fontSize:      9,
                color:         C.muted,
                fontWeight:    600,
                letterSpacing: '0.05em',
              }}>
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
