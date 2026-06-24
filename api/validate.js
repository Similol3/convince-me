export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { optionA, optionB, category, vibe, wantRecommendation } = req.body;

  // General — skip validation, just give recommendation if asked
  if (category === 'general') {
    if (!wantRecommendation) {
      return res.status(200).json({ valid: true, recommendation: null });
    }

    const generalPrompt = `Someone is deciding between: "${optionA}" vs "${optionB}".

Give a clear, honest recommendation on which option is better for them right now.
Be specific, direct and helpful. Consider practical benefits of each.
Keep it under 3 sentences. Return ONLY the recommendation text, nothing else.`;

    try {
      const r = await callGemini(generalPrompt, process.env.GEMINI_API_KEY);
      return res.status(200).json({ valid: true, recommendation: r });
    } catch {
      return res.status(200).json({ valid: true, recommendation: null });
    }
  }

  // Food validation + recommendation
  if (category === 'food') {
    const prompt = `You are a food expert and assistant.

Someone wants to decide between: "${optionA}" vs "${optionB}"

TASK 1 — Validation:
Are BOTH of these food or drink items? This includes ANY food from ANY country worldwide — Nigerian food, African cuisine, Asian food, Western food, street food, drinks, snacks, anything edible. Answer true or false.

TASK 2 — Recommendation (only if both are valid food):
Give a detailed, specific recommendation explaining:
- Which food is better right now and why
- Nutritional or taste benefits
- What mood or situation each suits
- Keep it under 4 sentences, warm and helpful

IMPORTANT: If EITHER option is NOT food/drink (e.g. "going to gym", "sleeping", a movie title), set valid to false.

Respond ONLY with this JSON, no markdown, no extra text:
{"valid": true or false, "recommendation": "detailed recommendation here" or null}`;

    try {
      const raw    = await callGemini(prompt, process.env.GEMINI_API_KEY);
      const parsed = safeParseJSON(raw);
      return res.status(200).json({
        valid:          parsed.valid !== false,
        recommendation: parsed.recommendation || null,
      });
    } catch {
      return res.status(200).json({ valid: true, recommendation: null });
    }
  }

  // Watch validation + recommendation
  if (category === 'watch') {
    const vibeContext = vibe ? `Their current mood/vibe: ${vibe}.` : '';

    const prompt = `You are a movie and entertainment expert.

Someone wants to decide between watching: "${optionA}" vs "${optionB}"
${vibeContext}

TASK 1 — Validation:
Are BOTH of these things to watch? This includes ANY movie, TV show, series, anime, documentary, K-drama, Nollywood film, Bollywood film, YouTube series, sporting event — from ANY country in ANY language. Answer true or false.

TASK 2 — Recommendation (only if both are valid watch options):
Give a specific recommendation explaining:
- Which to watch right now based on their mood/vibe (if provided)
- What genre, tone, or feeling each has
- Why one might suit this moment better
- If you don't recognise a title, say so honestly and recommend based on the name/genre you can infer
- Keep it under 4 sentences

IMPORTANT: If EITHER option is NOT something to watch (e.g. "pizza", "gym", a food item), set valid to false.

Respond ONLY with this JSON, no markdown, no extra text:
{"valid": true or false, "recommendation": "detailed recommendation here" or null}`;

    try {
      const raw    = await callGemini(prompt, process.env.GEMINI_API_KEY);
      const parsed = safeParseJSON(raw);
      return res.status(200).json({
        valid:          parsed.valid !== false,
        recommendation: parsed.recommendation || null,
      });
    } catch {
      return res.status(200).json({ valid: true, recommendation: null });
    }
  }

  return res.status(200).json({ valid: true, recommendation: null });
}

// ── Helpers ───────────────────────────────────────────────
async function callGemini(prompt, apiKey) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 200, temperature: 0.4 },
      }),
    }
  );
  const data = await r.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
}

function safeParseJSON(raw) {
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { valid: true, recommendation: null };
  }
}
