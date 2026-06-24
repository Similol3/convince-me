export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { optionA, optionB, category } = req.body;

  // General category — always valid, no check needed
  if (category === 'general') {
    return res.status(200).json({ valid: true, recommendation: null });
  }

  const PROMPTS = {
    food: `You are checking if two options are food or drink related, AND optionally giving a recommendation.

Option A: "${optionA}"
Option B: "${optionB}"

Food includes: ANY meal, snack, drink, cuisine, dish, or food-related thing from ANY country in the world. Nigerian food, Asian food, African food, Western food — all valid.

Answer these two questions in JSON format only:
1. Are both options food/drink related? (true or false)
2. If you know about these foods, give a one-sentence recommendation on which is better and why. If you don't know enough, return null.

Respond with ONLY this JSON, no other text:
{"valid": true or false, "recommendation": "your recommendation here" or null}`,

    watch: `You are checking if two options are things to watch, AND optionally giving a recommendation.

Option A: "${optionA}"
Option B: "${optionB}"

"Things to watch" includes: ANY movie, TV show, series, anime, documentary, YouTube content, sporting event — from ANY country or in ANY language. Nollywood, Bollywood, K-dramas, Hollywood, anime — all valid.

Answer these two questions in JSON format only:
1. Are both options things to watch? (true or false)
2. If you know about these titles, give a one-sentence recommendation on which is better and why. If you don't know enough, return null.

Respond with ONLY this JSON, no other text:
{"valid": true or false, "recommendation": "your recommendation here" or null}`,
  };

  const prompt = PROMPTS[category];
  if (!prompt) {
    return res.status(200).json({ valid: true, recommendation: null });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 100, temperature: 0 },
        }),
      }
    );

    const data = await response.json();
    const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';

    // Strip markdown code fences if Gemini wraps in them
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json({
      valid:          parsed.valid !== false,
      recommendation: parsed.recommendation || null,
    });

  } catch (err) {
    console.error('Validate error:', err);
    // If AI fails, let them through — never block users
    return res.status(200).json({ valid: true, recommendation: null });
  }
}
