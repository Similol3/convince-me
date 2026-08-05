import { useState, useEffect } from 'react';
import { C, gr } from '../tokens';

export default function Invite({ user }) {
  const [code,     setCode]     = useState('');
  const [copied,   setCopied]   = useState(false);
  const [loading,  setLoading]  = useState(true);

  const APP_URL = 'https://convince-me-tau.vercel.app';

  useEffect(() => {
    if (!user?.id || user?.is_guest) {
      setLoading(false);
      return;
    }

    fetch('/api/get-invite-code', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId: user.id }),
    })
      .then(r => r.json())
      .then(data => {
        setCode(data.code || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const inviteLink = `${APP_URL}?ref=${code}`;
  const inviteCount = user?.invite_count || 0;
  const bonusDecisions = user?.bonus_decisions || 0;

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareLink() {
    const text = `I've been using Convince Me to make decisions in 30 seconds — it's actually useful 😭\n\nJoin with my link and get 5 bonus decisions free:\n${inviteLink}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Convince Me', text });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (user?.is_guest) {
    return (
      <div style={{
        padding: '40px 16px', textAlign: 'center',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>🔗</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: 0 }}>
          Create an account to invite friends
        </h2>
        <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
          Sign up free to get your personal invite link and earn bonus decisions.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 20, minHeight: '100%',
      background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(139,92,246,0.2) 0%, ${C.bg} 60%)`,
    }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'white', margin: 0 }}>
          Invite Friends 🔗
        </h1>
        <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0', lineHeight: 1.5 }}>
          Both of you get rewarded — forever.
        </p>
      </div>

      {/* How it works */}
      <div style={{
        background: C.glass, border: `1px solid ${C.glassBdr}`,
        borderRadius: 20, padding: '20px',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          color: C.muted, margin: '0 0 14px' }}>
          HOW IT WORKS
        </p>
        {[
          { emoji: '🔗', title: 'Share your link', desc: 'Send it to anyone — WhatsApp, Instagram, anywhere' },
          { emoji: '✅', title: 'They sign up',     desc: 'Your friend creates a free account using your link' },
          { emoji: '⚡', title: 'You both win',     desc: 'You get +1 daily decision permanently. They get +5 bonus decisions on day one' },
        ].map((step, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            marginBottom: i < 2 ? 14 : 0,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: gr(),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>{step.emoji}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{step.title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{
          background: C.glass, border: `1px solid ${C.glassBdr}`,
          borderRadius: 16, padding: '16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.grape }}>
            {inviteCount}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            Friends invited
          </div>
        </div>
        <div style={{
          background: C.glass, border: `1px solid ${C.glassBdr}`,
          borderRadius: 16, padding: '16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.emerald }}>
            +{bonusDecisions}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            Bonus decisions earned
          </div>
        </div>
      </div>

      {/* Progress bar toward next reward */}
      {inviteCount < 7 && (
        <div style={{
          background: C.glass, border: `1px solid ${C.glassBdr}`,
          borderRadius: 14, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
              Invite progress
            </span>
            <span style={{ fontSize: 12, color: C.grape, fontWeight: 700 }}>
              {inviteCount}/7 invites
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(inviteCount / 7) * 100}%`,
              background: gr(), borderRadius: 3, transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
            {7 - inviteCount} more invites to reach max bonus (+7 daily decisions)
          </div>
        </div>
      )}

      {inviteCount >= 7 && (
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 14, padding: '14px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.emerald }}>
            🏆 Max bonus reached! You've earned +7 daily decisions permanently.
          </div>
        </div>
      )}

      {/* Invite link box */}
      {loading ? (
        <div style={{ textAlign: 'center', color: C.muted, fontSize: 13 }}>
          Generating your link...
        </div>
      ) : (
        <div style={{
          background: 'rgba(139,92,246,0.08)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 16, padding: '16px',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            color: C.grape, margin: '0 0 8px' }}>
            YOUR INVITE LINK
          </p>
          <div style={{
            fontSize: 13, color: 'white', fontWeight: 600,
            wordBreak: 'break-all', lineHeight: 1.5, marginBottom: 12,
          }}>
            {inviteLink}
          </div>
          <button onClick={copyLink} style={{
            background: copied ? C.emerald : C.glass,
            border: `1px solid ${copied ? C.emerald : C.glassBdr}`,
            borderRadius: 10, padding: '10px',
            color: 'white', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', width: '100%', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}>
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
        </div>
      )}

      {/* Share button */}
      <button onClick={shareLink} style={{
        background: gr(), border: 'none', borderRadius: 14,
        padding: '17px', color: 'white', fontSize: 15,
        fontWeight: 700, cursor: 'pointer', width: '100%',
        fontFamily: 'inherit',
      }}>
        🔗 Share with Friends
      </button>

      {/* Message templates */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          color: C.muted, margin: '0 0 10px' }}>
          READY-TO-SEND MESSAGES
        </p>
        {[
          {
            platform: '💬 WhatsApp',
            text: `Bro you NEED this app 😭 It literally makes decisions for you in 30 seconds. Join with my link and get 5 free bonus decisions → ${inviteLink}`,
          },
          {
            platform: '📸 Instagram DM',
            text: `okay this app is actually useful lol it decides things for you + helps you figure out what to say to people. get 5 bonus decisions when you sign up with my link → ${inviteLink}`,
          },
          {
            platform: '🐦 Twitter/X',
            text: `stop overthinking decisions. this app does it for you in 30 seconds (no cap) → ${inviteLink}`,
          },
        ].map((msg, i) => (
          <div key={i} style={{
            background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 14, padding: '14px 16px', marginBottom: 10,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6 }}>
              {msg.platform}
            </div>
            <div style={{ fontSize: 12, color: 'white', lineHeight: 1.5, marginBottom: 10 }}>
              {msg.text}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(msg.text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              style={{
                background: 'transparent', border: `1px solid ${C.glassBdr}`,
                borderRadius: 8, padding: '6px 12px',
                color: C.sub, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              📋 Copy this message
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
