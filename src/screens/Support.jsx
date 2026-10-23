import { useState } from 'react';

import { C, gr } from '../tokens';



const QUICK_OPTIONS = [

  { id: 'refund',   emoji: '💰', label: 'Request a refund',         desc: 'Within 24 hours of payment' },

  { id: 'cancel',   emoji: '❌', label: 'Cancel my subscription',   desc: 'Keep access until period ends' },

  { id: 'billing',  emoji: '💳', label: 'Billing question',         desc: 'Charges, receipts, plans' },

  { id: 'bug',      emoji: '🐛', label: 'Report a bug',             desc: 'Something not working' },

  { id: 'feature',  emoji: '💡', label: 'Suggest a feature',        desc: 'Ideas for the app' },

  { id: 'improve', emoji: '💡', label: 'Suggest an improvement', desc: 'Ideas to make the app better' },
  { id: 'other',    emoji: '💬', label: 'Something else',           desc: 'Any other question' },

];



export default function Support({ user, go }) {

  const [topic,    setTopic]    = useState(null);

  const [messages, setMessages] = useState([]);

  const [input,    setInput]    = useState('');

  const [loading,  setLoading]  = useState(false);

  const [submitted, setSubmitted] = useState(false);



  const SYSTEM_CONTEXT = `You are the friendly support assistant for Convince Me, a mobile decision-making and AI messaging app.



App info:

- Free plan: 3 decisions/day, 5 Connect AI messages/day

- Pro plan: $2.50/month or $14.99/year — unlimited everything

- Refund policy: available within 24 hours of payment

- Cancellations: user keeps access until billing period ends

- Contact email: Matt.dev275@gmail.com



You help users with:

- Refund requests (check if within 24hr window, guide them)

- Cancellation help (explain how, reassure them about access)

- Billing questions (explain pricing clearly)

- Bug reports (collect details, acknowledge)

- Feature requests (collect and appreciate)

- General app questions



Be warm, helpful and concise. Max 3 sentences per reply unless explaining steps. Use emojis sparingly. Never make up information you don't know — offer to escalate to the team instead.`;



  async function sendMessage(userMessage) {

    if (!userMessage.trim()) return;



    const newMessages = [...messages, { role: 'user', content: userMessage }];

    setMessages(newMessages);

    setInput('');

    setLoading(true);



    try {

      const conversationForAI = newMessages.map(m => ({

        role:    m.role,

        content: m.content,

      }));



      const response = await fetch('/api/support', {

        method:  'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          messages: conversationForAI,

          system:   SYSTEM_CONTEXT,

          topic:    topic?.id,

          userId:   user?.id,

          userEmail: user?.email,

        }),

      });



      const data = await response.json();

      const reply = data.message || "I'm having trouble connecting right now. Please email Matt.dev275@gmail.com for urgent help.";



      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);



    } catch {

      setMessages(prev => [...prev, {

        role: 'assistant',

        content: "I'm having trouble connecting right now. For urgent issues please email Matt.dev275@gmail.com",

      }]);

    }



    setLoading(false);

  }



  function selectTopic(t) {

    setTopic(t);

    const openers = {

      refund:  `Hi! I'd like to request a refund for my Pro subscription.`,

      cancel:  `Hi! I want to cancel my Pro subscription.`,

      billing: `Hi! I have a question about my billing.`,

      bug:     `Hi! I found a bug in the app I'd like to report.`,

      feature: `Hi! I have a feature suggestion.`,

      improve: `Hi! I have an idea that could improve Convince Me.`,
      other:   `Hi! I need some help with the app.`,

    };

    sendMessage(openers[t.id] || `Hi! I need help with: ${t.label}`);

  }



  return (

    <div style={{

      display: 'flex', flexDirection: 'column',

      height: '100%', minHeight: '100%',

      background: C.bg,

    }}>



      {/* Header */}

      <div style={{

        padding: '20px 16px 16px',

        borderBottom: `1px solid ${C.border}`,

        background: `radial-gradient(ellipse 90% 60% at 50% 0%, rgba(6,182,212,0.15) 0%, ${C.bg} 70%)`,

      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          <div style={{

            width: 44, height: 44, borderRadius: '50%',

            background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',

            display: 'flex', alignItems: 'center', justifyContent: 'center',

            fontSize: 22,

          }}>🤝</div>

          <div>

            <div style={{ fontSize: 17, fontWeight: 800, color: 'white' }}>Support</div>

            <div style={{ fontSize: 12, color: C.emerald, display: 'flex', alignItems: 'center', gap: 4 }}>

              <div style={{

                width: 6, height: 6, borderRadius: '50%',

                background: C.emerald, animation: 'pulse 2s infinite',

              }} />

              AI assistant · Online

            </div>

          </div>

        </div>

      </div>



      {/* Chat area */}

      <div style={{

        flex: 1, overflowY: 'auto', padding: '16px',

        display: 'flex', flexDirection: 'column', gap: 12,

      }}>



        {/* Initial greeting */}

        {messages.length === 0 && !topic && (

          <>

            <div style={{

              background: C.glass, border: `1px solid ${C.glassBdr}`,

              borderRadius: '18px 18px 18px 4px', padding: '14px 16px',

              maxWidth: '85%',

            }}>

              <p style={{ fontSize: 14, color: 'white', margin: 0, lineHeight: 1.55 }}>

                Hey! 👋 I'm the Convince Me support assistant. What can I help you with today?

              </p>

            </div>



            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>

              {QUICK_OPTIONS.map(opt => (

                <button key={opt.id} onClick={() => selectTopic(opt)} style={{

                  background: C.glass, border: `1px solid ${C.glassBdr}`,

                  borderRadius: 14, padding: '12px 10px',

                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',

                }}>

                  <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.emoji}</div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>

                    {opt.label}

                  </div>

                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{opt.desc}</div>

                </button>

              ))}

            </div>

          </>

        )}



        {/* Messages */}

        {messages.map((msg, i) => (

          <div key={i} style={{

            display: 'flex',

            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',

          }}>

            <div style={{

              background: msg.role === 'user'

                ? gr() : C.glass,

              border: msg.role === 'user'

                ? 'none' : `1px solid ${C.glassBdr}`,

              borderRadius: msg.role === 'user'

                ? '18px 18px 4px 18px' : '18px 18px 18px 4px',

              padding: '12px 14px',

              maxWidth: '82%',

            }}>

              <p style={{

                fontSize: 14, color: 'white', margin: 0,

                lineHeight: 1.55, whiteSpace: 'pre-wrap',

              }}>

                {msg.content}

              </p>

            </div>

          </div>

        ))}



        {/* Loading dots */}

        {loading && (

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>

            <div style={{

              background: C.glass, border: `1px solid ${C.glassBdr}`,

              borderRadius: '18px 18px 18px 4px', padding: '14px 18px',

              display: 'flex', gap: 6, alignItems: 'center',

            }}>

              {[0,1,2].map(i => (

                <div key={i} style={{

                  width: 7, height: 7, borderRadius: '50%',

                  background: 'rgba(255,255,255,0.5)',

                  animation: `pulse 1s ${i * 0.2}s infinite`,

                }} />

              ))}

            </div>

          </div>

        )}



        {/* Escalation option after a few messages */}

        {messages.length >= 4 && (

          <div style={{

            background: 'rgba(6,182,212,0.08)',

            border: '1px solid rgba(6,182,212,0.2)',

            borderRadius: 14, padding: '12px 14px',

            textAlign: 'center',

          }}>

            <p style={{ fontSize: 12, color: C.sub, margin: '0 0 8px' }}>

              Need to speak to a human?

            </p>

            <a href="mailto:Matt.dev275@gmail.com?subject=Convince Me Support" style={{

              fontSize: 13, fontWeight: 700, color: C.teal, textDecoration: 'none',

            }}>

              📧 Email us directly

            </a>

          </div>

        )}



      </div>



      {/* Input bar */}

      {topic && (

        <div style={{

          padding: '12px 16px',

          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',

          borderTop: `1px solid ${C.border}`,

          background: C.bg,

          display: 'flex', gap: 10, alignItems: 'flex-end',

        }}>

          <div style={{

            flex: 1, background: C.glass, border: `1px solid ${C.glassBdr}`,

            borderRadius: 20, padding: '10px 16px',

            display: 'flex', alignItems: 'center',

          }}>

            <textarea

              value={input}

              onChange={e => setInput(e.target.value)}

              onKeyDown={e => {

                if (e.key === 'Enter' && !e.shiftKey) {

                  e.preventDefault();

                  sendMessage(input);

                }

              }}

              placeholder="Type your message..."

              rows={1}

              style={{

                flex: 1, background: 'transparent', border: 'none',

                color: 'white', fontSize: 14, outline: 'none',

                fontFamily: 'inherit', resize: 'none', lineHeight: 1.4,

              }}

            />

          </div>

          <button

            onClick={() => sendMessage(input)}

            disabled={!input.trim() || loading}

            style={{

              width: 42, height: 42, borderRadius: '50%',

              background: input.trim() ? gr() : C.glass,

              border: 'none', cursor: input.trim() ? 'pointer' : 'default',

              display: 'flex', alignItems: 'center', justifyContent: 'center',

              fontSize: 18, flexShrink: 0,

            }}

          >

            ➤

          </button>

        </div>

      )}



    </div>

  );

}
