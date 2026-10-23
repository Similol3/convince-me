import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const supabase    = createClient(supabaseUrl, supabaseKey);

  const action = req.query.action;

  // ── GET: fetch decision + vote counts ──────────────────
  if (req.method === 'GET' && action === 'get') {
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

      return res.status(200).json({ decision, votesA, votesB, votes: votes || [] });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── POST: create ──────────────────────────────────────
  if (action === 'create') {
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
      return res.status(200).json({ success: true, decisionId: data.id, shareToken });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // ── POST: vote ────────────────────────────────────────
  if (action === 'vote') {
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

      // Update friend streak if voter is a known friend
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
          let newStreak   = friendRow.streak || 0;

          if (lastDate !== today) {
            newStreak = lastDate === yesterday ? newStreak + 1 : 1;
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
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
}
