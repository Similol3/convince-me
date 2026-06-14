import { useState } from 'react';
import { C, gr } from '../tokens';
import { resetPassword } from '../lib/auth';

export default function ForgotPassword({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.08)',
    border: `1px solid ${C.glassBdr}`, borderRadius: 14,
    padding: '14px 16px', color: C.text, fontSize: 15,
    fontWeight: 600, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  async function handleReset() {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    const result = await resetPassword(email);
    setLoading(false);
    if (!result.success) setError(result.error);
    else setSent(true);
  }

  return (
    <div style={{
      padding: '40px 24px', display: 'flex', flexDirection: 'column',
      gap: 20, minHeight: '100vh', justifyContent: 'center',
      background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(139,92,246,0.35) 0%, ${C.bg} 65%)`,
    }}>

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'white' }}>Reset Password</div>
        <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>
          We'll email you a reset link
        </div>
      </div>

      {sent ? (
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 14, padding: '16px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 13, color: C.emerald, fontWeight: 600 }}>
            ✓ Reset link sent to {email}
          </span>
        </div>
      ) : (
        <>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" style={inputStyle}
          />

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12, padding: '10px 14px',
            }}>
              <span style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <button onClick={handleReset} disabled={loading} style={{
            background: gr(), border: 'none', borderRadius: 14,
            padding: '16px', color: 'white', fontSize: 15,
            fontWeight: 700, cursor: 'pointer', width: '100%',
            fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
          }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </>
      )}

      <button onClick={() => onSwitch('login')} style={{
        background: 'transparent', border: 'none', color: C.sub,
        fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
      }}>
        ← Back to Login
      </button>

    </div>
  );
}
