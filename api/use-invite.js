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

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Server config error' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { inviteCode, newUserId } = req.body;

  if (!inviteCode || !newUserId) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    // Find the inviter
    const { data: inviter, error: inviterError } = await supabase
      .from('users')
      .select('id, invite_count, bonus_decisions')
      .eq('invite_code', inviteCode)
      .single();

    if (inviterError || !inviter) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Make sure new user isn't inviting themselves
    if (inviter.id === newUserId) {
      return res.status(400).json({ error: 'Cannot use your own invite code' });
    }

    // Check not already used this invite
    const { data: existing } = await supabase
      .from('invites')
      .select('id')
      .eq('invitee_id', newUserId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already used an invite code' });
    }

    // Cap inviter bonus at +7 extra decisions (10 total max)
    const currentBonus  = inviter.bonus_decisions || 0;
    const newBonus      = Math.min(currentBonus + 1, 7);
    const newInviteCount = (inviter.invite_count || 0) + 1;

    // Reward inviter — +1 daily decision permanently
    await supabase
      .from('users')
      .update({
        bonus_decisions: newBonus,
        invite_count:    newInviteCount,
      })
      .eq('id', inviter.id);

    // Reward new user — +5 bonus decisions on day one
    await supabase
      .from('users')
      .update({
        invited_by:      inviter.id,
        bonus_decisions: 5,
      })
      .eq('id', newUserId);

    // Record the invite
    await supabase.from('invites').insert({
      inviter_id:  inviter.id,
      invitee_id:  newUserId,
      invite_code: inviteCode,
    });

    return res.status(200).json({
      success:        true,
      inviterReward:  newBonus,
      inviteeReward:  5,
    });

  } catch (err) {
    console.error('use-invite error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
