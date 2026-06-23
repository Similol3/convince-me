import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Try all possible env variable names
  const supabaseUrl = process.env.SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars:', {
      url: !!supabaseUrl,
      key: !!supabaseKey,
    });
    return res.status(500).json({
      error: 'Server configuration error. Please contact support.',
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { userId, reason } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('last_payment_at, stripe_customer_id, is_pro')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('User fetch error:', fetchError);
      return res.status(500).json({ error: 'Could not find your account.' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!user.is_pro) {
      return res.status(400).json({
        error: 'No active Pro subscription found.',
      });
    }

    // If last_payment_at is null, still allow refund request
    // but note it in the record
    let withinWindow = true;
    if (user.last_payment_at) {
      const hoursSince =
        (Date.now() - new Date(user.last_payment_at).getTime()) / 3600000;
      withinWindow = hoursSince <= 24;
    }

    if (!withinWindow) {
      return res.status(400).json({
        error:
          'Refund window has expired. Refunds are only available within 24 hours of payment.',
      });
    }

    // Check for existing pending request
    const { data: existing } = await supabase
      .from('refund_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        error: 'You already have a pending refund request.',
      });
    }

    const { error: insertError } = await supabase
      .from('refund_requests')
      .insert({
        user_id:            userId,
        stripe_customer_id: user.stripe_customer_id || null,
        reason:             reason || 'No reason given',
        status:             'pending',
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({
        error: 'Failed to submit refund request. Please try again.',
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Request refund error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
