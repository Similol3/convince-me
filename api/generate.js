export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { situationId, context, image, audience, tone } = req.body;

  const AUDIENCE_DESC = {
    friend:   'a close friend',
    crush:    "someone they have a crush on — be confident and charming, not desperate or over the top",
    partner:  'their romantic partner',
    family:   'a family member',
    stranger: "someone new they don't know well yet — friendly but not overly familiar",
    group:    'a group chat with several friends — keep it inclusive',
  };

  const TONE_DESC = {
    casual:     'Relaxed and natural, like texting a friend. Everyday language.',
    romantic:   'Warm, flirty and sweet — show genuine interest, playful but not cringe or desperate.',
    funny:      'Playful and humorous — a light joke or witty observation fits well.',
    uk_slang:   'British/UK slang and street talk — words like "bro", "fam", "innit", "bare", "peng", "wagwan", "you good" used naturally where it fits. Authentic, not forced.',
    supportive: 'Warm, empathetic and reassuring — show genuine care without being preachy.',
    formal:     "Polite and respectful, slightly more formal — good for people they don't know well.",
  };

  const audienceLine = AUDIENCE_DESC[audience] || AUDIENCE_DESC.friend;
  const toneLine = TONE_DESC[tone] || TONE_DESC.casual;

  let promptText = '';

  if (situationId === 'reply_story') {
    promptText = `Someone posted a story or photo on social media. The user wants to reply to it.
This message is for ${audienceLine}.
Tone: ${toneLine}
${context ? `Extra context from the user: "${context}"` : 'No extra context given — react naturally to the image.'}

Write ONE short, natural reply (under 18 words) the user could send, matching the tone and audience above. Return ONLY the message text, nothing else.`;

  } else if (situationId === 'start_chat') {
    promptText = `The user wants to start a conversation.
This message is for ${audienceLine}.
Tone: ${toneLine}
${context ? `Context: "${context}"` : 'No context given — keep it general.'}

Write ONE short conversation opener (under 18 words) matching the tone and audience above. Return ONLY the message text, nothing else.`;

  } else {
    promptText = `Someone said this to the user: "${context}"

The user wants a reply to send back, for ${audienceLine}.
Tone: ${toneLine}

Read what was said carefully and respond appropriately to the actual content and emotional tone — if it's difficult or sad, be genuinely caring (not falsely cheerful); if exciting, match that energy; if neutral, respond naturally. THEN apply the requested tone/style on top of that emotional read.

Write ONE short, genuine reply (under 20 words). Return ONLY the message text, nothing else, no quotes.`;
  }

  try {
    const parts = [];
    if (image && situationId === 'reply_story') {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
    }
    parts.push({ text: promptText });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: 120, temperature: 0.95 },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini error:', data);
      return res.status(500).json({ error: 'AI request failed', details: data });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return res.status(200).json({ message: text });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
