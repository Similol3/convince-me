import { useState } from 'react';
import { C, gr } from '../tokens';

export default function Feedback({ onClose }) {
  const [step,     setStep]     = useState('prompt');
  const [rating,   setRating]   = useState(null);
  const [feedback, setFeedback] = useState('');
  const [sent,     setSent]     = useState(false);

  async function handleSend() {
    if (!feedback.trim() && !rating) { onClose(); return; }

    // Send to support API
    try {
      await fetch('/api/support', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role:    'user',
            content: `USER FEEDBACK — Rating: ${rating}/5\n\n${feedback}`,
          }],
          system: 'This is user feedback. Acknowledge it warmly and confirm it has been recorded.',
          topic:  'feedback',
        }),
      });
    } catch { /* silent fail — feedback is not critical */ }

    setSent(true);
    setTimeout(onClose, 2000);
  }

  if (sent) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}>
        <div style={{
          width: '100%', maxWidth: 430,
          background: C.bg, borderRadius: '24px 24px 0 0',
          padding: '32px 20px 48px', textAlign: 'center',
          border: `1px solid ${C.glassBdr}`,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🙏</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>
            Thank you!
          </div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>
            Your feedback helps us improve Convince Me
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 430,
        background: C.bg, borderRadius: '24px 24px 0 0',
        padding: '28px 20px 48px',
        border: `1px solid ${C.glassBdr}`,
        animation: 'slideUp 0.35s ease',
      }}>

        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: C.glassBdr, margin: '0 auto 20px',
        }} />

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💭</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>
            Quick feedback?
          </div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>
            Takes 10 seconds — helps us improve
          </div>
        </div>

        {/* Star rating */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setRating(n)} style={{
              background: 'transparent', border: 'none',
              fontSize: 32, cursor: 'pointer',
              opacity: rating && n > rating ? 0.3 : 1,
              transition: 'all 0.1s',
              filter: rating && n <= rating ? 'none' : 'grayscale(1)',
            }}>
              ⭐
            </button>
          ))}
        </div>

        {/* Text feedback */}
        <div style={{
          background: C.glass, border: `1px solid ${C.glassBdr}`,
          borderRadius: 14, padding: '14px 16px', marginBottom: 16,
        }}>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="What would make Convince Me better? Any ideas welcome 💡"
            rows={3}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              color: 'white', fontSize: 14, outline: 'none',
              fontFamily: 'inherit', resize: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSend} style={{
            flex: 1, background: gr(), border: 'none', borderRadius: 12,
            padding: '14px', color: 'white', fontSize: 14,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Send Feedback
          </button>
          <button onClick={onClose} style={{
            flex: 1, background: C.glass, border: `1px solid ${C.glassBdr}`,
            borderRadius: 12, padding: '14px', color: C.sub,
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Skip
          </button>
        </div>

      </div>
    </div>
  );
}
