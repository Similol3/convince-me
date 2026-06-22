import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, reason } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('last_payment_at, stripe_customer_id, is_pro')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      console.error('User fetch error:', fetchError);
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.is_pro) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    if (!user.last_payment_at) {
      return res.status(400).json({
        error: 'No payment record found. Please contact support.',
      });
    }

    const hoursSince =
      (Date.now() - new Date(user.last_payment_at).getTime()) / 3600000;

    if (hoursSince > 24) {
      return res.status(400).json({
        error: 'Refund window has expired. Refunds are only available within 24 hours of payment.',
      });
    }

    // Check if they already submitted a refund request
    const { data: existing } = await supabase
      .from('refund_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (existing) {
      return res.status(400).json({
        error: 'You already have a pending refund request.',
      });
    }

    const { error: insertError } = await supabase
      .from('refund_requests')
      .insert({
        user_id:            userId,
        stripe_customer_id: user.stripe_customer_id,
        reason:             reason || 'No reason given',
        status:             'pending',
      });

    if (insertError) {
      console.error('Insert refund request error:', insertError);
      return res.status(500).json({ error: 'Failed to submit refund request' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Request refund handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
