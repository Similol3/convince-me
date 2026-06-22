import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

  const { stripeCustomerId, userId } = req.body;

  if (!stripeCustomerId) {
    return res.status(400).json({
      error: 'No subscription found for this account.',
    });
  }

  try {
    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status:   'active',
      limit:    1,
    });

    if (subscriptions.data.length === 0) {
      // Check for trialing subscriptions too
      const trialing = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status:   'trialing',
        limit:    1,
      });

      if (trialing.data.length === 0) {
        return res.status(404).json({
          error: 'No active subscription found to cancel.',
        });
      }
    }

    const sub = subscriptions.data[0]
      || (await stripe.subscriptions.list({
           customer: stripeCustomerId,
           status: 'trialing',
           limit: 1,
         })).data[0];

    // Cancel at period end — user keeps access until billing period ends
    const updated = await stripe.subscriptions.update(sub.id, {
      cancel_at_period_end: true,
    });

    const cancelDate = new Date(
      updated.current_period_end * 1000
    ).toISOString();

    // Update Supabase to reflect cancellation pending
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
    console.error('Cancel subscription error:', err);
    return res.status(500).json({
      error: 'Could not cancel subscription. Please try again.',
    });
  }
}
