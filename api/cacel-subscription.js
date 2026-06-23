import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    return res.status(500).json({
      error: 'Server configuration error. Please contact support.',
    });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Missing STRIPE_SECRET_KEY');
    return res.status(500).json({
      error: 'Payment system configuration error.',
    });
  }

  const stripe   = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { stripeCustomerId, userId } = req.body;

  if (!stripeCustomerId) {
    return res.status(400).json({
      error:
        'No payment account found. Please contact support if you believe this is an error.',
    });
  }

  try {
    // Try to find active subscription
    let subscription = null;

    const active = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status:   'active',
      limit:    1,
    });

    if (active.data.length > 0) {
      subscription = active.data[0];
    } else {
      // Try trialing
      const trialing = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status:   'trialing',
        limit:    1,
      });
      if (trialing.data.length > 0) {
        subscription = trialing.data[0];
      }
    }

    if (!subscription) {
      return res.status(404).json({
        error:
          'No active subscription found. It may have already been cancelled.',
      });
    }

    // Cancel at period end — keeps access until billing period ends
    const updated = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    const cancelDate = new Date(
      updated.current_period_end * 1000
    ).toISOString();

    // Update Supabase
    if (userId) {
      await supabase
        .from('users')
        .update({ pro_until: cancelDate })
        .eq('id', userId);
    }

    return res.status(200).json({
      success:    true,
      cancelDate,
    });
  } catch (err) {
    console.error('Cancel subscription error:', err.message);
    return res.status(500).json({
      error: 'Could not cancel subscription. Please try again.',
    });
  }
}
