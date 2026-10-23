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

  const { userId, inviteCode } = req.body;

  if (!userId || !inviteCode) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const { data: friendUser, error } = await supabase
      .from('users')
      .select('id, username, avatar')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (error || !friendUser) {
      return res.status(404).json({ error: 'Invite code not found' });
    }

    if (friendUser.id === userId) {
      return res.status(400).json({ error: "You can't add yourself" });
    }

    const { data: existing } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', userId)
      .eq('friend_id', friendUser.id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'Already friends' });
    }

    await supabase.from('friends').insert([
      { user_id: userId, friend_id: friendUser.id },
      { user_id: friendUser.id, friend_id: userId },
    ]);

    return res.status(200).json({ success: true, friend: friendUser });

  } catch (err) {
    console.error('add-friend error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
