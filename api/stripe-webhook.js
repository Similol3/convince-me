import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service role key — add this to Vercel env vars
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    await supabase
      .from("users")
      .update({
        is_pro: true,
        pro_until: proUntil,
        stripe_customer_id: session.customer,
        last_payment_at: new Date().toISOString(),
      })
      .eq("id", userId);

    const proUntil =
      plan === "yearly"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabase
      .from("users")
      .update({
        is_pro: true,
        pro_until: proUntil,
        stripe_customer_id: session.customer,
      })
      .eq("id", userId);

    console.log(`✅ Pro activated for user ${userId} until ${proUntil}`);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    await supabase
      .from("users")
      .update({ is_pro: false, pro_until: null })
      .eq("stripe_customer_id", customerId);

    console.log(`❌ Pro cancelled for Stripe customer ${customerId}`);
  }

  return res.status(200).json({ received: true });
}
