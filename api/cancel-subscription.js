import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeKey   = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey || !supabaseUrl || !supabaseKey) {
    console.error('Missing env vars:', {
      stripe:   !!stripeKey,
      supabase: !!supabaseUrl,
      key:      !!supabaseKey,
    });
    return res.status(500).json({
      error: 'Server configuration error. Please try again or contact support.',
    });
  }

  const stripe   = new Stripe(stripeKey);
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { stripeCustomerId, userId } = req.body;

  if (!stripeCustomerId) {
    return res.status(400).json({
      error: 'No subscription found on your account.',
    });
  }

  try {
    let subscription = null;

    const active = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (active.data.length > 0) {
      subscription = active.data[0];
    } else {
      const trialing = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'trialing',
        limit: 1,
      });
      if (trialing.data.length > 0) subscription = trialing.data[0];
    }

    if (!subscription) {
      return res.status(404).json({
        error: 'No active subscription found. It may have already been cancelled.',
      });
    }

    const updated = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    const cancelDate = new Date(
      updated.current_period_end * 1000
    ).toISOString();

    if (userId) {
      await supabase
        .from('users')
        .update({ pro_until: cancelDate })
        .eq('id', userId);
    }

    return res.status(200).json({ success: true, cancelDate });

  } catch (err) {
    console.error('Cancel error:', err.message);
    return res.status(500).json({
      error: err.message || 'Could not cancel. Please try again.',
    });
  }
}
