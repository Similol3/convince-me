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

  // ── GET: get or generate invite code ─────────────────
  if (req.method === 'GET' && action === 'code') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
      const { data: user } = await supabase
        .from('users')
        .select('invite_code')
        .eq('id', userId)
        .single();

      if (user?.invite_code) {
        return res.status(200).json({ code: user.invite_code });
      }

      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await supabase.from('users').update({ invite_code: code }).eq('id', userId);
      return res.status(200).json({ code });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── POST: use an invite code ──────────────────────────
  if (action === 'use') {
    const { inviteCode, newUserId } = req.body;
    if (!inviteCode || !newUserId) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      const { data: inviter } = await supabase
        .from('users')
        .select('id, invite_count, bonus_decisions')
        .eq('invite_code', inviteCode)
        .single();

      if (!inviter) return res.status(404).json({ error: 'Invalid invite code' });
      if (inviter.id === newUserId) {
        return res.status(400).json({ error: 'Cannot use your own invite code' });
      }

      const { data: existing } = await supabase
        .from('invites')
        .select('id')
        .eq('invitee_id', newUserId)
        .maybeSingle();

      if (existing) return res.status(400).json({ error: 'Already used an invite code' });

      const newBonus       = Math.min((inviter.bonus_decisions || 0) + 1, 7);
      const newInviteCount = (inviter.invite_count || 0) + 1;

      await supabase.from('users')
        .update({ bonus_decisions: newBonus, invite_count: newInviteCount })
        .eq('id', inviter.id);

      await supabase.from('users')
        .update({ invited_by: inviter.id, bonus_decisions: 5 })
        .eq('id', newUserId);

      await supabase.from('invites').insert({
        inviter_id: inviter.id,
        invitee_id: newUserId,
        invite_code: inviteCode,
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
}
