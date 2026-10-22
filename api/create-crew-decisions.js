import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const supabase    = createClient(supabaseUrl, supabaseKey);

  const { userId, optionA, optionB, category } = req.body;

  if (!userId || !optionA || !optionB) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const shareToken = Math.random().toString(36).substring(2, 10);

    const { data, error } = await supabase
      .from('crew_decisions')
      .insert({
        creator_id:  userId,
        option_a:    optionA,
        option_b:    optionB,
        category:    category || 'general',
        share_token: shareToken,
        status:      'open',
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success:    true,
      decisionId: data.id,
      shareToken,
    });

  } catch (err) {
    console.error('create-crew-decision error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
