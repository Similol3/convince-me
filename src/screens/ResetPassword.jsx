import { useState } from 'react';
import { C, gr } from '../tokens';
import { supabase } from '../lib/supabase';

export default function ResetPassword({ onDone }) {
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.08)',
    border: `1px solid ${C.glassBdr}`, borderRadius: 14,
    padding: '14px 16px', color: '#fff', fontSize: 15,
    fontWeight: 600, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  async function handleReset() {
    setError('');

    if (!password) {
      setError('Please enter a new password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);

    // After 2 seconds go to home
    setTimeout(() => {
      onDone();
    }, 2000);
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: '0 0 8px' }}>
          Password updated!
        </h2>
        <p style={{ fontSize: 14, color: C.sub }}>
          Taking you back to the app...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '40px 24px',
      background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(139,92,246,0.35) 0%, ${C.bg} 65%)`,
    }}>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: 0 }}>
          Set New Password
        </h1>
        <p style={{ fontSize: 13, color: C.sub, marginTop: 8 }}>
          Choose a strong password for your account
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="New password (min 6 characters)"
          style={inputStyle}
        />
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          style={inputStyle}
          onKeyDown={e => e.key === 'Enter' && handleReset()}
        />

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '10px 14px',
          }}>
            <span style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 600 }}>
              {error}
            </span>
          </div>
        )}

        <button
          onClick={handleReset}
          disabled={loading}
          style={{
            background: gr(), border: 'none', borderRadius: 14,
            padding: '16px', color: 'white', fontSize: 15,
            fontWeight: 700, cursor: 'pointer', width: '100%',
            fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
            marginTop: 8,
          }}
        >
          {loading ? 'Updating...' : 'Set New Password →'}
        </button>
      </div>

    </div>
  );
}
