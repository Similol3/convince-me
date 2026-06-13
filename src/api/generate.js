export default async function handler(req, res) {
    // Allow requests from your app
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { situationId, context, image } = req.body;
  
    // Build a prompt that actually responds to what the user said
    let promptText = '';
  
    if (situationId === 'reply_story') {
      promptText = `Someone posted a story or photo on social media. The user wants to reply to it.
  ${context ? `Here's what the story/post is about, in the user's words: "${context}"` : 'No extra context given — just react naturally to the image.'}
  
  Write ONE short, casual reply (under 18 words) the user could send. Match the tone of what's actually in the context — if it's something positive, be warm; if it's neutral, be curious; if it's something hard or sad, be supportive and real, not cheerful or random. Return ONLY the message text, nothing else.`;
  
    } else if (situationId === 'start_chat') {
      promptText = `The user wants to start a conversation with someone.
  ${context ? `Context: "${context}"` : 'No context given — keep it general and friendly.'}
  
  Write ONE short, casual conversation opener (under 18 words) based on this context. Return ONLY the message text, nothing else.`;
  
    } else {
      // reply_text — THIS is the important one for "my mom scolded me"
      promptText = `Someone said this to the user: "${context}"
  
  The user wants a reply to send back. Read what was said carefully and respond appropriately to the actual content and emotional tone:
  - If it's something difficult, sad, or stressful (like getting scolded, bad news, a hard day) — write something supportive, understanding, and real. Don't be falsely cheerful.
  - If it's something exciting or happy — match that energy.
  - If it's neutral or factual — respond naturally and conversationally.
  
  Write ONE short, genuine reply (under 20 words). Return ONLY the message text, nothing else, no quotes.`;
    }
  
    try {
      const messageContent = [];
  
      if (image && situationId === 'reply_story') {
        const base64Data = image.split(',')[1];
        const mediaType  = image.split(';')[0].split(':')[1];
        messageContent.push({
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64Data },
        });
      }
      messageContent.push({ type: 'text', text: promptText });
  
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 100,
          messages: [{ role: 'user', content: messageContent }],
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error('Anthropic error:', data);
        return res.status(500).json({ error: 'AI request failed', details: data });
      }
  
      const text = data.content.map(c => c.text || '').join('').trim();
      return res.status(200).json({ message: text });
  
    } catch (err) {
      console.error('Handler error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  