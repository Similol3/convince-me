export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    situationId,
    context,
    image,
    audience,
    tone,
    purpose,
    personName,
    personHandle,
    pastMessages,
  } = req.body;

  const AUDIENCE_DESC = {
    friend:    'a close friend they know well and are comfortable with',
    crush:     "someone they have a crush on — be confident and naturally charming, not desperate or cringe",
    partner:   'their romantic partner / boyfriend / girlfriend / bae',
    family:    'a family member — warm and appropriate',
    stranger:  "someone they don't know well yet — friendly but not overly familiar",
    colleague: 'a work colleague or classmate — professional but still friendly',
    group:     'a group chat with several people — make it inclusive and fun',
    ex:        "their ex — respectful, warm but not desperate or clingy",
  };

  const TONE_DESC = {
    casual:     'Completely relaxed and natural, like texting a close mate. Everyday language, no formality at all.',
    romantic:   'Warm, heartfelt and genuinely sweet. Show real interest. Playful but sincere — not cringe or try-hard. Make it feel special.',
    funny:      'Playful and humorous. A witty observation or light joke that fits naturally. Make them laugh or at least smile.',
    uk_slang:   'Authentic British/UK street talk — words like "fam", "innit", "bare", "peng", "wagwan", "you good", "mandem", "no cap", "it\'s giving", "bruv", "allow it", "on ones" used naturally where they fit. NOT forced.',
    supportive: 'Warm, empathetic and genuinely caring. Acknowledge their feelings first before anything else. No preaching or empty positivity.',
    formal:     'Polite, respectful and clear. Slightly professional — good for people they want to impress or don\'t know well.',
    flirty:     'Playful, confident and lightly flirtatious. Keep them interested without being overwhelming. A little mystery goes a long way.',
    hype:       'High energy, enthusiastic and full of personality. The kind of message that immediately makes someone smile or feel good.',
  };

  const PURPOSE_DESC = {
    check_in:   'Just checking in on them and seeing how they are doing — natural, not forced',
    compliment: 'Giving them a genuine compliment that feels specific and real, not generic',
    apologize:  'Apologising for something sincerely — own it without being overly dramatic',
    interest:   'Showing interest in them as a person and keeping the conversation going naturally',
    comfort:    'Comforting or supporting them through something difficult — presence over advice',
    invite:     'Inviting them somewhere or suggesting they hang out — confident not desperate',
    reconnect:  'Reconnecting after not talking for a while — natural, no awkward energy',
    respond:    'Replying directly and thoughtfully to what they said',
  };

  const nameLine    = personName   ? `Their name is ${personName}.` : '';
  const handleLine  = personHandle ? `Their social media handle is @${personHandle}.` : '';
  const audienceLine = AUDIENCE_DESC[audience] || AUDIENCE_DESC.friend;
  const toneLine     = TONE_DESC[tone]         || TONE_DESC.casual;
  const purposeLine  = PURPOSE_DESC[purpose]   || 'Send a message that feels natural and genuine';

  // Format past conversation for the prompt
  let pastConvoSection = '';
  if (pastMessages && pastMessages.trim().length > 2) {
    pastConvoSection = `
PREVIOUS CONVERSATION HISTORY (use this to understand their personality, how they talk, and the vibe between them):
---
${pastMessages.trim()}
---
Study this carefully. Match the established tone of the conversation. Build on what's already been said. Don't repeat things already mentioned.`;
  }

  let promptText = '';

  if (situationId === 'reply_story') {
    promptText = `The user wants to reply to someone's social media story or post.

WHO they're messaging: ${audienceLine}
${nameLine} ${handleLine}
GOAL: ${purposeLine}
TONE: ${toneLine}
${context ? `WHAT THE STORY IS ABOUT (user's description): "${context}"` : 'No description given — reply based on what you see in the image.'}
${pastConvoSection}

${image ? 'Look at the image carefully. Understand the mood, place, activity, or emotion it shows.' : ''}

Write a reply that:
— Responds directly and specifically to this story/post, not generically
— Feels like something a real human would actually send, not an AI
— Matches the tone, audience, and purpose above exactly
— If there is conversation history, stays consistent with how they already talk to each other
— Uses ${personName ? personName + "'s name naturally if it fits" : 'their name if you know it'}

Write 1 to 3 sentences max. Natural length — not cut short, not too long. Return ONLY the message. No quotes around it. No explanation.`;

  } else if (situationId === 'start_chat') {
    promptText = `The user wants to start a conversation with someone from scratch.

WHO they're messaging: ${audienceLine}
${nameLine} ${handleLine}
GOAL: ${purposeLine}
TONE: ${toneLine}
${context ? `BACKGROUND CONTEXT: "${context}"` : 'No background — create a natural opener that could work for anyone.'}
${pastConvoSection}

Write a conversation opener that:
— Feels completely natural and human, not copy-paste generic
— Fits the tone and relationship type exactly
— If context was given, references it specifically so it feels personal
— If they have a handle or name, use it naturally if it fits
— Is the kind of message that actually gets a reply

Write 1 to 3 sentences. Return ONLY the message. No quotes. No explanation.`;

  } else {
    promptText = `The user wants to reply to a message they received.

WHO sent the message: ${audienceLine}
${nameLine} ${handleLine}
WHAT THEY SAID: "${context}"
GOAL: ${purposeLine}
TONE: ${toneLine}
${pastConvoSection}

Read everything carefully. Understand the full picture:

EMOTIONAL READING — This is the most important part:
— If they said something difficult, vulnerable, sad, or stressful (failed something, got in trouble, feeling low, had a bad day, stressed out) — FIRST acknowledge that feeling specifically. Show you actually understood what they said. Then respond with genuine care. DO NOT be randomly cheerful. DO NOT give empty positive quotes. Be a real human who actually listened.
— If they said something exciting, happy, or achieved something — genuinely celebrate with them, match their energy
— If they're asking something or being curious — give a real thoughtful answer that continues the conversation
— If it's casual and chill — keep it light and natural
— If they need an apology — be sincere, specific, and not overdone

THEN layer the requested tone/style naturally on top of that emotional read.

If there is conversation history — read it carefully and stay consistent with the established dynamic between them. Build on previous things mentioned. Reference specific things they talked about if it's natural.

If you know their name, use it once if it fits naturally.

Write a complete, genuine reply — 1 to 4 sentences depending on what the situation needs. Don't cut it short artificially. Return ONLY the message. No quotes around it. No explanation or preamble.`;
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            maxOutputTokens: 500,  // No more cut-off replies
            temperature:     1.05,
            topP:            0.95,
            topK:            40,
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
