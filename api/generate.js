export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { situationId, context, image, audience, tone, purpose } = req.body;

  const AUDIENCE_DESC = {
    friend:    'a close friend they know well and are comfortable with',
    crush:     "someone they have a crush on — be confident and charming, not desperate or cringe",
    partner:   'their romantic partner / boyfriend / girlfriend / bae',
    family:    'a family member — keep it warm and appropriate',
    stranger:  "someone new they don't know well yet — friendly but not overly familiar",
    colleague: 'a work colleague or classmate — keep it professional but friendly',
    group:     'a group chat with several people — make it inclusive and fun',
    ex:        "their ex — be careful here, warm but not desperate, respectful",
  };

  const TONE_DESC = {
    casual:     'Relaxed and natural, like texting a close friend. Everyday language, no formality.',
    romantic:   'Warm, heartfelt and genuinely sweet. Show real interest. Playful but sincere — not cringe or try-hard.',
    funny:      'Playful and humorous. A witty observation or light joke that fits the situation naturally.',
    uk_slang:   'British/UK street talk used authentically — words like "fam", "innit", "bare", "peng", "wagwan", "you good", "mandem", "no cap", "it\'s giving" used naturally where they fit. Not forced.',
    supportive: 'Warm, empathetic and reassuring. Acknowledge their feelings first. Genuine care without being preachy.',
    formal:     'Polite, respectful and clear. Slightly more professional — good for colleagues or people they want to impress.',
    flirty:     'Playful, light and flirtatious. Confident but not overwhelming. Keep them guessing a little.',
    hype:       'High energy and enthusiastic. Pump them up. Lots of personality — the kind of message that makes someone smile immediately.',
  };

  const PURPOSE_DESC = {
    check_in:   'The user wants to check in on them and see how they are doing',
    compliment:  'The user wants to give them a genuine compliment about something',
    apologize:   'The user wants to apologise for something and make it right',
    interest:    'The user wants to show interest in them and keep the conversation going',
    comfort:     'The user wants to comfort or support them through something difficult',
    invite:      'The user wants to invite them somewhere or suggest hanging out',
    reconnect:   'The user wants to reconnect after not talking for a while — natural, not awkward',
    respond:     'The user wants to reply to something specific they said',
  };

  const audienceLine = AUDIENCE_DESC[audience] || AUDIENCE_DESC.friend;
  const toneLine     = TONE_DESC[tone]         || TONE_DESC.casual;
  const purposeLine  = PURPOSE_DESC[purpose]   || 'The user wants to send a message that feels natural';

  let promptText = '';

  if (situationId === 'reply_story') {
    promptText = `The user wants to reply to someone's social media story or post.

WHO they're messaging: ${audienceLine}
THE GOAL: ${purposeLine}
TONE/STYLE: ${toneLine}
${context ? `EXTRA CONTEXT from user: "${context}"` : 'No extra context — react naturally to the image content.'}

Look at the image carefully. Understand what's in it — the place, mood, activity, or emotion it shows. Then write a reply that responds directly to what you see, not just a generic reaction.

Write ONE short, natural reply (under 18 words) that fits the tone, audience, and purpose above. Return ONLY the message text. No quotes, no explanation, nothing else.`;

  } else if (situationId === 'start_chat') {
    promptText = `The user wants to start a conversation with someone from scratch.

WHO they're messaging: ${audienceLine}
THE GOAL: ${purposeLine}
TONE/STYLE: ${toneLine}
${context ? `CONTEXT/BACKGROUND: "${context}"` : 'No background given — keep the opener general but engaging.'}

Write ONE conversation opener (under 20 words) that fits the tone and purpose. Make it feel natural — not like a copy-paste opener. Return ONLY the message text. No quotes, no explanation.`;

  } else {
    promptText = `The user wants to reply to a message they received.

WHO sent the message: ${audienceLine}
WHAT THEY SAID: "${context}"
THE GOAL: ${purposeLine}
TONE/STYLE: ${toneLine}

Read what they said carefully. Understand the emotional weight behind it:
— If it's something difficult, sad, stressful or vulnerable (like being scolded, failing, having a bad day, feeling lonely) — acknowledge their feeling first, then respond with genuine care. Do NOT be falsely cheerful or give random positive messages. Be human.
— If it's something exciting or happy — match that energy authentically
— If it's casual or neutral — respond naturally and keep the conversation flowing
— If it needs an apology — be sincere, not overdone

THEN apply the tone/style on top of that emotional read.

Write ONE short, genuine reply (under 20 words) that sounds like a real human wrote it for this specific situation. Return ONLY the message text. No quotes, no explanation.`;
  }

  try {
    const parts = [];

    if (image && situationId === 'reply_story') {
      const base64Data = image.split(',')[1];
      const mimeType   = image.split(';')[0].split(':')[1];
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
          generationConfig: {
            maxOutputTokens: 150,
            temperature:     1.0,
            topP:            0.95,
          },
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
