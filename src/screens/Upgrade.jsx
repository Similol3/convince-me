import { useState } from 'react';
import { C, gr, grGold } from '../tokens';
import { PRO_FEATURES, PRICING } from '../data/pricing';

export default function Upgrade({ user, go, onRequireLogin }) {
  const [plan, setPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancelDate, setCancelDate] = useState(null);

  async function handleUpgrade() {
    if (user?.is_guest) {
      onRequireLogin();
      return;
    }

    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: user.id, email: user.email }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    setError('');

    try {
      const response = await fetch('/api/cancel-subscription', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeCustomerId: user.stripe_customer_id }),
      });

      const data = await response.json();

      if (data.success) {
        setCancelled(true);
        setCancelDate(data.cancelDate);
        setShowCancelConfirm(false);
      } else {
        setError(data.error || 'Could not cancel subscription. Please try again.');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      setError('Connection error. Please try again.');
    }

    setCancelling(false);
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  // ─── ALREADY PRO — show status + cancel option ───────────
  if (user?.is_pro) {
    return (
      <div style={{
        padding: '24px 16px', display: 'flex', flexDirection: 'column',
        gap: 20, minHeight: '100%',
        background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(245,158,11,0.2) 0%, ${C.bg} 60%)`,
      }}>

        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>👑</div>
          <div style={{
            fontSize: 26, fontWeight: 900,
            background: grGold(), WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            You're Pro
          </div>
          {cancelled ? (
            <div style={{ fontSize: 13, color: C.sub, marginTop: 8, lineHeight: 1.5 }}>
              Your subscription is cancelled.{'\n'}
              You'll keep Pro access until <strong style={{ color: 'white' }}>{formatDate(cancelDate)}</strong>.
            </div>
          ) : (
            <div style={{ fontSize: 13, color: C.sub, marginTop: 8 }}>
              {user.pro_until
                ? `Renews on ${formatDate(user.pro_until)}`
                : 'Active subscription'}
            </div>
          )}
        </div>

        {/* Active features list */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: C.gold, margin: '0 0 10px' }}>
            ✨ YOUR ACTIVE FEATURES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRO_FEATURES.map(f => (
              <div key={f.id} style={{
                background: C.glass, border: `1px solid ${C.glassBdr}`,
                borderRadius: 16, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'rgba(245,158,11,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>{f.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{f.desc}</div>
                </div>
                <span style={{ color: C.emerald, fontSize: 16 }}>✓</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '10px 14px',
          }}>
            <span style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {!cancelled && (
          <button onClick={() => setShowCancelConfirm(true)} style={{
            background: 'transparent', border: `1px solid rgba(239,68,68,0.3)`,
            borderRadius: 14, padding: '14px', color: '#FCA5A5',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            width: '100%', fontFamily: 'inherit',
          }}>
            Cancel Subscription
          </button>
        )}

        <button onClick={() => go(8)} style={{
          background: C.glass, border: `1px solid ${C.glassBdr}`,
          borderRadius: 14, padding: '14px', color: 'white',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          width: '100%', fontFamily: 'inherit',
        }}>
          Back to Profile
        </button>

        {/* Cancel confirmation dialog */}
        {showCancelConfirm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24,
          }}>
            <div style={{
              background: C.card2, border: `1px solid ${C.glassBdr}`,
              borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 340,
            }}>
              <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>😢</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>
                Cancel your subscription?
              </h3>
              <p style={{ fontSize: 13, color: C.sub, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
                You'll keep all Pro features until the end of your current billing period. No refunds for the current period.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={handleCancel} disabled={cancelling} style={{
                  background: C.red, border: 'none', borderRadius: 12,
                  padding: '14px', color: 'white', fontSize: 14,
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  opacity: cancelling ? 0.6 : 1,
                }}>
                  {cancelling ? 'Cancelling...' : 'Yes, cancel'}
                </button>
                <button onClick={() => setShowCancelConfirm(false)} style={{
                  background: C.glass, border: `1px solid ${C.glassBdr}`,
                  borderRadius: 12, padding: '14px', color: 'white',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Keep my subscription
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ─── NOT PRO — show upgrade pitch ─────────────────────────
  return (
    <div style={{
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      gap: 20, minHeight: '100%',
      background: `radial-gradient(ellipse 90% 50% at 50% 0%, rgba(245,158,11,0.2) 0%, ${C.bg} 60%)`,
    }}>

      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>👑</div>
        <div style={{
          fontSize: 28, fontWeight: 900, lineHeight: 1.1,
          background: grGold(), WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Convince Me Pro
        </div>
        <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>
          Unlock everything. Support development.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PRO_FEATURES.map(f => (
          <div key={f.id} style={{
            background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 16, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>{f.emoji}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{f.label}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {Object.entries(PRICING).map(([key, p]) => (
          <button key={key} onClick={() => setPlan(key)} style={{
            flex: 1, background: plan === key ? gr() : C.glass,
            border: plan === key ? 'none' : `1px solid ${C.glassBdr}`,
            borderRadius: 16, padding: '16px', cursor: 'pointer',
            fontFamily: 'inherit', textAlign: 'center', position: 'relative',
          }}>
            {p.badge && (
              <div style={{
                position: 'absolute', top: -8, right: -6,
                background: C.emerald, borderRadius: 99,
                padding: '2px 8px', fontSize: 9, fontWeight: 800, color: 'white',
              }}>{p.badge}</div>
            )}
            <div style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>{p.price}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{p.period}</div>
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '10px 14px',
        }}>
          <span style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <button onClick={handleUpgrade} disabled={loading} style={{
        background: grGold(), border: 'none', borderRadius: 14,
        padding: '17px', color: '#1A1208', fontSize: 15,
        fontWeight: 800, cursor: 'pointer', width: '100%',
        fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
      }}>
        {loading ? 'Loading checkout...' : `Upgrade to Pro — ${plan === 'yearly' ? '$14.99/yr' : '$1.99/mo'} ✨`}
      </button>

      <button onClick={() => go(8)} style={{
        background: 'transparent', border: 'none', color: C.muted,
        fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
      }}>
        Maybe later
      </button>

      <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 1.6 }}>
        Payments are securely processed by Stripe.{'\n'}
        Cancel anytime from this screen.
      </div>

    </div>
  );
}
