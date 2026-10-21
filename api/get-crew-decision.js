import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const supabase    = createClient(supabaseUrl, supabaseKey);

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const { data: decision, error } = await supabase
      .from('crew_decisions')
      .select('*, users:creator_id (username, avatar)')
      .eq('share_token', token)
      .single();

    if (error || !decision) {
      return res.status(404).json({ error: 'Not found' });
    }

    const { data: votes } = await supabase
      .from('crew_votes')
      .select('choice, voter_name')
      .eq('crew_decision_id', decision.id);

    const votesA = (votes || []).filter(v => v.choice === 'A').length;
    const votesB = (votes || []).filter(v => v.choice === 'B').length;

    return res.status(200).json({
      decision,
      votesA,
      votesB,
      votes: votes || [],
    });

  } catch (err) {
    console.error('get-crew-decision error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
