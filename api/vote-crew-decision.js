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

  const { shareToken, choice, voterId, voterName } = req.body;

  if (!shareToken || !choice) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const { data: decision, error: fetchError } = await supabase
      .from('crew_decisions')
      .select('id, status')
      .eq('share_token', shareToken)
      .single();

    if (fetchError || !decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    if (decision.status === 'closed') {
      return res.status(400).json({ error: 'Voting has closed' });
    }

    await supabase.from('crew_votes').insert({
      crew_decision_id: decision.id,
      voter_id:         voterId || null,
      voter_name:       voterName || 'Anonymous',
      choice,
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('vote-crew-decision error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
