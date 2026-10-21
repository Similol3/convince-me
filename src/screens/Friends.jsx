import { useState, useEffect } from 'react';
import { C, gr } from '../tokens';
import { getFriends } from '../lib/friends';

export default function Friends({ user, go }) {
  const [friends,  setFriends]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [code,     setCode]     = useState('');
  const [adding,   setAdding]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  useEffect(() => {
    if (!user?.id || user?.is_guest) { setLoading(false); return; }
    loadFriends();
  }, [user]);

  async function loadFriends() {
    const list = await getFriends(user.id);
    setFriends(list);
    setLoading(false);
  }

  async function handleAdd() {
    if (!code.trim()) return;
    setAdding(true);
    setError('');

    try {
      const res = await fetch('/api/add-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, inviteCode: code.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Could not add friend');
      } else {
        setCode('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        loadFriends();
      }
    } catch {
      setError('Connection error');
    }
    setAdding(false);
  }

  if (user?.is_guest) {
    return (
      <div style={{
        padding: '60px 20px', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        <div style={{ fontSize: 44 }}>👥</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>
          Sign up to add friends
        </h2>
        <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>
          Create a free account to connect with friends and start real voting.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 20, minHeight: '100%',
      background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(145,101,246,0.18) 0%, ${C.bg} 60%)`,
    }}>

      <div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: 0 }}>
          Your Crew 👥
        </h1>
        <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0' }}>
          Add friends to vote on real decisions together
        </p>
      </div>

      {/* Add friend */}
      <div style={{
        background: C.glass, border: `1px solid ${C.glassBdr}`,
        borderRadius: 16, padding: '16px',
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          color: C.muted, margin: '0 0 10px' }}>
          ADD A FRIEND BY INVITE CODE
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. ABC12345"
            style={{
              flex: 1, background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${C.glassBdr}`, borderRadius: 10,
              padding: '11px 14px', color: 'white', fontSize: 13,
              fontWeight: 700, outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button onClick={handleAdd} disabled={adding} style={{
            background: gr(), border: 'none', borderRadius: 10,
            padding: '11px 18px', color: 'white', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            opacity: adding ? 0.6 : 1,
          }}>
            {adding ? '...' : 'Add'}
          </button>
        </div>
        {error && (
          <div style={{ fontSize: 12, color: '#FCA5A5', marginTop: 8 }}>{error}</div>
        )}
        {success && (
          <div style={{ fontSize: 12, color: C.emerald, marginTop: 8 }}>✓ Friend added!</div>
        )}
      </div>

      {/* Go to invite screen */}
      <button onClick={() => go(16)} style={{
        background: 'transparent', border: `1px dashed ${C.glassBdr}`,
        borderRadius: 14, padding: '12px', color: C.sub,
        fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        Don't have a code? Get your own invite link →
      </button>

      {/* Friends list */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          color: C.muted, margin: '0 0 10px' }}>
          {friends.length} FRIEND{friends.length !== 1 ? 'S' : ''}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, padding: 20 }}>
            Loading...
          </div>
        ) : friends.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🫂</div>
            <div style={{ fontSize: 13, color: C.muted }}>
              No friends yet — add one above to start voting together
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {friends.map(f => (
              <div key={f.id} style={{
                background: C.glass, border: `1px solid ${C.glassBdr}`,
                borderRadius: 16, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: gr(), display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18, overflow: 'hidden', flexShrink: 0,
                }}>
                  {f.avatar_image
                    ? <img src={f.avatar_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (f.avatar || '🎲')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                      @{f.username}
                    </span>
                    {f.is_pro && <span style={{ fontSize: 12 }}>👑</span>}
                  </div>
                </div>
                {f.streak > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'rgba(247,183,55,0.12)',
                    border: '1px solid rgba(247,183,55,0.3)',
                    borderRadius: 99, padding: '4px 10px',
                  }}>
                    <span style={{ fontSize: 12 }}>🔥</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>
                      {f.streak}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
