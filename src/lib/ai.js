export async function generateMessage(situationId, context, image, audience, tone) {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ situationId, context, image, audience, tone }),
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
    "This looks amazing! Where was this? 👀",
    "Okay this is so cool, tell me more!",
  ],
  start_chat: [
    "Hey! How's your day going so far?",
    "Hi! Just wanted to say hey 👋",
  ],
  reply_text: [
    "I hear you — that sounds tough. You okay?",
    "That's a lot to deal with. I'm here if you want to talk.",
  ],
};

function fallback(situationId) {
  const opts = FALLBACKS[situationId] || FALLBACKS.reply_text;
  return opts[Math.floor(Math.random() * opts.length)];
}
