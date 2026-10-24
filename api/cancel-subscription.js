
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  res.setHeader("Allow", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  const publishableKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (
    !stripeKey ||
    !supabaseUrl ||
    !serviceKey ||
    !publishableKey
  ) {
    console.error("Missing server environment variables");

    return res.status(500).json({
      error: "Server configuration error",
    });
  }

  try {
    // Verify the user's Supabase access token.
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        error: "Please log in again.",
      });
    }

    const authClient = createClient(
      supabaseUrl,
      publishableKey
    );

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: "Your session has expired. Please log in again.",
      });
    }

    const supabase = createClient(
      supabaseUrl,
      serviceKey
    );

    // Get the Stripe customer ID from the verified user's profile.
    const { data: profile, error: profileError } =
      await supabase
        .from("users")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

    if (profileError) {
      console.error("Profile lookup:", profileError.message);

      return res.status(500).json({
        error: "Could not retrieve your subscription details.",
      });
    }

    if (!profile?.stripe_customer_id) {
      return res.status(404).json({
        error: "No Stripe customer is linked to your account.",
      });
    }

    const stripe = new Stripe(stripeKey);

    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "all",
      limit: 100,
    });

    const subscription = subscriptions.data
      .filter(sub =>
        sub.status === "active" ||
        sub.status === "trialing"
      )
      .sort((a, b) => b.created - a.created)[0];

    if (!subscription) {
      return res.status(404).json({
        error:
          "No active subscription found. Your subscription may already have ended.",
      });
    }

    // Already scheduled for cancellation.
    if (subscription.cancel_at_period_end) {
      const cancelDate = new Date(
        subscription.current_period_end * 1000
      ).toISOString();

      return res.status(200).json({
        success: true,
        alreadyCancelled: true,
        cancelDate,
        message: "Your subscription is already scheduled to end.",
      });
    }

    // Cancel at the end of the billing period.
    const updated = await stripe.subscriptions.update(
      subscription.id,
      {
        cancel_at_period_end: true,
      }
    );

    const cancelDate = new Date(
      updated.current_period_end * 1000
    ).toISOString();

    const { error: updateError } = await supabase
      .from("users")
      .update({
        pro_until: cancelDate,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update:", updateError.message);
    }

    return res.status(200).json({
      success: true,
      cancelDate,
      message:
        "Your subscription has been cancelled. Pro remains active until the end of your billing period.",
    });

  } catch (error) {
    console.error("Cancellation error:", error);

    return res.status(500).json({
      error:
        "Could not process your cancellation. Please try again.",
    });
  }
}
