export async function generateMessage({
  situationId,
  context,
  image,
  audience,
  tone,
  purpose,
  personName,
  personHandle,
  pastMessages,
}) {
  try {
    const response = await fetch('/api/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        situationId,
        context,
        image,
        audience,
        tone,
        purpose,
        personName,
        personHandle,
        pastMessages,
      }),
    });

    if (!response.ok) throw new Error('API failed');
    const data = await response.json();
    return data.message || fallback(situationId);

  } catch (err) {
    console.error('AI generation failed:', err);
    return fallback(situationId);
  }
}

const FALLBACKS = {
  reply_story: [
    "This looks so good! What's the story here? 👀",
    "Okay I need the full story on this 😭",
    "This is giving everything, love it",
  ],
  start_chat: [
    "Hey! How's your day going?",
    "Hi! Been meaning to reach out 👋",
    "Hey, just wanted to say what's up",
  ],
  reply_text: [
    "That sounds tough — you good though?",
    "I hear you, that's a lot. Want to talk about it?",
    "Damn, I feel that. How are you holding up?",
  ],
};

function fallback(situationId) {
  const opts = FALLBACKS[situationId] || FALLBACKS.reply_text;
  return opts[Math.floor(Math.random() * opts.length)];
}
