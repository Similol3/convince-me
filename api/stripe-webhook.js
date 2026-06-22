import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// CRITICAL — tells Vercel NOT to parse the body automatically
// Stripe needs the raw bytes to verify its signature
export const config = {
  api: { bodyParser: false },
};

// Read raw bytes from the request
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('No Stripe signature header found');
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Webhook received:', event.type);

  // ── Payment completed ─────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId  = session.metadata?.userId;
    const plan    = session.metadata?.plan;

    console.log('Payment completed — userId:', userId, 'plan:', plan);

    if (!userId) {
      console.error('No userId in Stripe metadata — cannot update database');
      return res.status(200).json({ received: true });
    }

    const proUntil = plan === 'yearly'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() +  30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('users')
      .update({
        is_pro:             true,
        pro_until:          proUntil,
        stripe_customer_id: session.customer,
        last_payment_at:    new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Supabase update failed:', error);
    } else {
      console.log('User upgraded to Pro successfully:', userId);
    }
  }

  // ── Subscription cancelled ────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId   = subscription.customer;

    const { error } = await supabase
      .from('users')
      .update({ is_pro: false, pro_until: null })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Supabase cancel update failed:', error);
    } else {
      console.log('User Pro cancelled for customer:', customerId);
    }
  }

  return res.status(200).json({ received: true });
}
