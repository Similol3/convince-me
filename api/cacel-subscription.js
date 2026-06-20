import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { stripeCustomerId } = req.body;

  if (!stripeCustomerId) {
    return res.status(400).json({ error: 'Missing customer ID' });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status:   'active',
      limit:    1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const sub = subscriptions.data[0];

    // Cancel at end of billing period — user keeps Pro until it expires
    const updated = await stripe.subscriptions.update(sub.id, {
      cancel_at_period_end: true,
    });

    return res.status(200).json({
      success:    true,
      cancelDate: new Date(updated.current_period_end * 1000).toISOString(),
    });

  } catch (err) {
    console.error('Cancel error:', err);
    return res.status(500).json({ error: err.message });
  }
}
