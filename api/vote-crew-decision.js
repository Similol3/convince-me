
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
      .select('id, status, creator_id')
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

    // If voter is a known friend of the creator, update streak
    if (voterId && voterId !== decision.creator_id) {
      const { data: friendRow } = await supabase
        .from('friends')
        .select('id, streak, last_streak_date')
        .eq('user_id', decision.creator_id)
        .eq('friend_id', voterId)
        .maybeSingle();

      if (friendRow) {
        const today     = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const lastDate  = friendRow.last_streak_date;

        let newStreak = friendRow.streak || 0;
        if (lastDate !== today) {
          newStreak = lastDate === yesterday ? newStreak + 1 : 1;

          // Update both directions of the friendship
          await supabase.from('friends')
            .update({ streak: newStreak, last_streak_date: today })
            .eq('user_id', decision.creator_id)
            .eq('friend_id', voterId);

          await supabase.from('friends')
            .update({ streak: newStreak, last_streak_date: today })
            .eq('user_id', voterId)
            .eq('friend_id', decision.creator_id);
        }
      }
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('vote-crew-decision error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
