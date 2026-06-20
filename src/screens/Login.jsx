import { useState } from 'react';
import { C, gr } from '../tokens';
import { signIn } from '../lib/auth';

export default function Login({ onSwitch, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.08)',
    border: `1px solid ${C.glassBdr}`, borderRadius: 14,
    padding: '14px 16px', color: C.text, fontSize: 15,
    fontWeight: 600, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  async function handleLogin() {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    const result = await signIn(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Success — close the modal immediately.
    // App.jsx's session listener will pick up the new session automatically.
    if (onClose) onClose();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div style={{
      padding: '24px 24px 40px', display: 'flex', flexDirection: 'column',
      gap: 18,
    }}>

      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎲</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>Welcome Back</div>
        <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>
          Log in to Convince Me
        </div>
      </div>

      <input
        type="email" value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Email" style={inputStyle}
        autoComplete="email"
      />
      <input
        type="password" value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Password" style={inputStyle}
        autoComplete="current-password"
      />

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '10px 14px',
        }}>
          <span style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <button onClick={handleLogin} disabled={loading} style={{
        background: gr(), border: 'none', borderRadius: 14,
        padding: '16px', color: 'white', fontSize: 15,
        fontWeight: 700, cursor: 'pointer', width: '100%',
        fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
      }}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      <button onClick={() => onSwitch('forgot')} style={{
        background: 'transparent', border: 'none', color: C.sub,
        fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
        textAlign: 'center', padding: 4,
      }}>
        Forgot password?
      </button>

      <div style={{ textAlign: 'center', fontSize: 13, color: C.sub }}>
        Don't have an account?{' '}
        <span onClick={() => onSwitch('signup')} style={{
          color: C.grape, fontWeight: 700, cursor: 'pointer',
        }}>Sign up</span>
      </div>

    </div>
  );
}
