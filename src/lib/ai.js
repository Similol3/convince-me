export async function generateMessage(situationId, context, image, audience, tone, purpose) {
  try {
    const response = await fetch('/api/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ situationId, context, image, audience, tone, purpose }),
    });

    if (!response.ok) throw new Error('API failed');

    const data = await response.json();
    return data.message || fallback(situationId);

  } catch (err) {
    console.error('AI generation failed, using fallback:', err);
    return fallback(situationId);
  }
}

const FALLBACKS = {
  reply_story: [
    "This looks so good! What's the story behind it? 👀",
    "Okay I need details on this immediately 😭",
  ],
  start_chat: [
    "Hey! How's your day going so far?",
    "Hi! Just wanted to reach out 👋",
  ],
  reply_text: [
    "That sounds tough — you good?",
    "I hear you. Want to talk about it?",
  ],
};

function fallback(situationId) {
  const opts = FALLBACKS[situationId] || FALLBACKS.reply_text;
  return opts[Math.floor(Math.random() * opts.length)];
}
