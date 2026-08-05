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

  const { userId } = req.body;
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

    // Generate a new code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    await supabase
      .from('users')
      .update({ invite_code: code })
      .eq('id', userId);

    return res.status(200).json({ code });

  } catch (err) {
    console.error('get-invite-code error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
