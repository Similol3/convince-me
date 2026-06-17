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

  const { plan, userId, email } = req.body;

  const PLANS = {
    monthly: {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Convince Me Pro — Monthly',
          description: 'Unlimited AI messages, custom photo avatar, Pro badge',
        },
        unit_amount: 199, // $1.99 in cents
        recurring: { interval: 'month' },
      },
    },
    yearly: {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Convince Me Pro — Yearly',
          description: 'Unlimited AI messages, custom photo avatar, Pro badge',
        },
        unit_amount: 1499, // $14.99 in cents
        recurring: { interval: 'year' },
      },
    },
  };

  const selectedPlan = PLANS[plan];
  if (!selectedPlan) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: selectedPlan.price_data,
        quantity: 1,
      }],
      success_url: `${req.headers.origin}?payment=success&userId=${userId}`,
      cancel_url:  `${req.headers.origin}?payment=cancelled`,
      customer_email: email,
      metadata: { userId, plan },
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
}
