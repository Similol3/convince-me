import { useState } from 'react';
import { C, gr } from '../tokens';
import { signUp } from '../lib/auth';

export default function Signup({ onSwitch, onClose }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.08)',
    border: `1px solid ${C.glassBdr}`, borderRadius: 14,
    padding: '14px 16px', color: C.text, fontSize: 15,
    fontWeight: 600, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  async function handleSignup() {
    const clean = username.trim().toLowerCase().replace(/\s+/g, '_');

    if (!clean || clean.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(clean)) {
      setError('Username: lowercase letters, numbers, underscores only');
      return;
    }
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    const result = await signUp(email, password, clean);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (result.needsVerification) {
      setDone(true);
    } else {
      // Email confirmation OFF — session created instantly, close modal
      if (onClose) onClose();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSignup();
  }

  if (done) {
    return (
      <div style={{
        padding: '32px 24px 40px', display: 'flex', flexDirection: 'column',
        gap: 16, alignItems: 'center', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48 }}>📧</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: 0 }}>
          Check your email
        </h2>
        <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.6, maxWidth: 280 }}>
          We sent a verification link to <strong style={{ color: 'white' }}>{email}</strong>.
          Click it, then come back and log in.
        </p>
        <button onClick={() => onSwitch('login')} style={{
          background: gr(), border: 'none', borderRadius: 14,
          padding: '14px 28px', color: 'white', fontSize: 14,
          fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8,
        }}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px 24px 40px', display: 'flex', flexDirection: 'column',
      gap: 18,
    }}>

      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎲</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>Create Account</div>
        <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>
          Join Convince Me — it's free
        </div>
      </div>

      <input
        value={username} onChange={e => setUsername(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Username" style={inputStyle}
        autoComplete="username"
      />
      <input
        type="email" value={email} onChange={e => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Email" style={inputStyle}
        autoComplete="email"
      />
      <input
        type="password" value={password} onChange={e => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Password (min 6 chars)" style={inputStyle}
        autoComplete="new-password"
      />

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '10px 14px',
        }}>
          <span style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <button onClick={handleSignup} disabled={loading} style={{
        background: gr(), border: 'none', borderRadius: 14,
        padding: '16px', color: 'white', fontSize: 15,
        fontWeight: 700, cursor: 'pointer', width: '100%',
        fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
      }}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>

      <div style={{ textAlign: 'center', fontSize: 13, color: C.sub }}>
        Already have an account?{' '}
        <span onClick={() => onSwitch('login')} style={{
          color: C.grape, fontWeight: 700, cursor: 'pointer',
        }}>Log in</span>
      </div>

    </div>
  );
}
