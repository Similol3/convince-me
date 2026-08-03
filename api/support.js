export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { messages, system, topic, userId, userEmail } = req.body;
  
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'No messages provided' });
    }
  
    try {
      // Build conversation for Gemini
      const conversation = messages.map(m => ({
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
  
      // Add system context as first user message
      const fullConversation = [
        {
          role:  'user',
          parts: [{ text: `SYSTEM CONTEXT: ${system}\n\nUser info: ID=${userId || 'guest'}, Email=${userEmail || 'unknown'}, Topic=${topic || 'general'}` }],
        },
        {
          role:  'model',
          parts: [{ text: 'Understood. I\'m ready to help.' }],
        },
        ...conversation,
      ];
  
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: fullConversation,
            generationConfig: {
              maxOutputTokens: 400,
              temperature:     0.7,
            },
          }),
        }
      );
  
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  
      if (!text) {
        return res.status(500).json({
          message: "I'm having trouble right now. Please email Matt.dev275@gmail.com for urgent help.",
        });
      }
  
      return res.status(200).json({ message: text });
  
    } catch (err) {
      console.error('Support API error:', err);
      return res.status(500).json({
        message: "I'm having trouble connecting. Please email Matt.dev275@gmail.com for direct support.",
      });
    }
  }
  