export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { optionA, optionB, category } = req.body;
  
    const CATEGORY_PROMPTS = {
      food: `You are checking if two user inputs are food or drink related.
  Inputs: "${optionA}" and "${optionB}"
  Food/drink includes: any meal, snack, cuisine, dish, drink, beverage, restaurant, 
  takeout type, or food-related thing from ANY country or culture in the world.
  Examples of valid food: Jollof rice, Suya, Shawarma, Pho, Ramen, Injera, Fufu, 
  Boba, Lassi, Churros, Baklava, Pad Thai, Kimchi, Ugali, Pounded yam, etc.
  Is this a food/drink decision? Reply with ONLY: YES or NO`,
  
      watch: `You are checking if two user inputs are things to watch.
  Inputs: "${optionA}" and "${optionB}"
  "Things to watch" includes: movies, TV shows, series, anime, documentaries, 
  YouTube channels, Netflix/streaming content, sporting events to watch, 
  any film or video content from ANY country or in ANY language.
  Examples: Nollywood films, K-dramas, Bollywood movies, anime, sports matches, 
  reality shows, etc.
  Is this a watch/movie/show decision? Reply with ONLY: YES or NO`,
    };
  
    const prompt = CATEGORY_PROMPTS[category];
    if (!prompt) {
      return res.status(200).json({ valid: true });
    }
  
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 5, temperature: 0 },
          }),
        }
      );
  
      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        .toUpperCase() || 'YES';
  
      return res.status(200).json({ valid: answer.includes('YES') });
  
    } catch (err) {
      console.error('Validate error:', err);
      // If AI fails, allow it through — don't block users
      return res.status(200).json({ valid: true });
    }
  }
  