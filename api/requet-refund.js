import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, reason } = req.body;

  const { data: user } = await supabase
    .from('users')
    .select('last_payment_at, stripe_customer_id')
    .eq('id', userId)
    .single();

  if (!user?.last_payment_at) {
    return res.status(400).json({ error: 'No recent payment found' });
  }

  const hoursSince = (Date.now() - new Date(user.last_payment_at).getTime()) / 3600000;
  if (hoursSince > 24) {
    return res.status(400).json({ error: 'Refund window has expired (24 hours)' });
  }

  await supabase.from('refund_requests').insert({
    user_id:             userId,
    stripe_customer_id:  user.stripe_customer_id,
    reason:              reason || 'No reason given',
    status:              'pending',
  });

  return res.status(200).json({ success: true });
}
