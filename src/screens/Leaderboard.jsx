import { useState, useEffect } from 'react';
import { C, gr, grGold } from '../tokens';
import { getLevelInfo } from '../data/levels';
import { supabase } from '../lib/supabase';

export default function Leaderboard({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('users')
      .select('id, username, avatar, xp, streak, is_pro')
      .order('xp', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setUsers(data || []);
        setLoading(false);
      });
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 16, minHeight: '100%',
      background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(245,158,11,0.18) 0%, ${C.bg} 60%)`,
    }}>

      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'white', margin: 0 }}>
          🏆 Leaderboard
        </h1>
        <p style={{ fontSize: 13, color: C.sub, margin: '4px 0 0' }}>
          Top decision makers by XP
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted, fontSize: 14 }}>
          Loading leaderboard...
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {users.map((u, i) => {
          const lvl = getLevelInfo(u.xp);
          const isMe = u.id === user?.id;
          return (
            <div key={u.id} style={{
              background: isMe ? 'rgba(139,92,246,0.15)' : C.glass,
              border: `1px solid ${isMe ? 'rgba(139,92,246,0.4)' : C.glassBdr}`,
              borderRadius: 16, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 32, textAlign: 'center', fontSize: i < 3 ? 22 : 14,
                fontWeight: 800, color: i < 3 ? 'inherit' : C.muted,
              }}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>

              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: gr(), display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, flexShrink: 0,
              }}>{u.avatar || '🎲'}</div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                    @{u.username}
                  </span>
                  {u.is_pro && <span style={{ fontSize: 12 }}>👑</span>}
                  {isMe && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: C.grape,
                      background: 'rgba(139,92,246,0.2)', borderRadius: 6,
                      padding: '1px 6px',
                    }}>YOU</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                  {lvl.emoji} {lvl.title} · Level {lvl.level}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.gold }}>
                  {u.xp}
                </div>
                <div style={{ fontSize: 10, color: C.muted }}>XP</div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
