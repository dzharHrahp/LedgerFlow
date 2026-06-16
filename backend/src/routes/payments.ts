// ============================================================================
// LEDGERFLOW - Payment Routes (Midtrans Integration) — FIXED VERSION
// ============================================================================

import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";
import {
  snap,
  coreApi,
  generateOrderId,
  verifySignature,
  getPlanPrice,
  type PlanName,
  type BillingCycle,
} from "../lib/midtrans.js";

const payments = new Hono();

// ═══════════════════════════════════════════════════════════════════════
// GET /plans — List all available plans
// ═══════════════════════════════════════════════════════════════════════
payments.get("/plans", async (c) => {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("price_monthly", { ascending: true });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ═══════════════════════════════════════════════════════════════════════
// GET /subscription — Get current user's subscription
// ═══════════════════════════════════════════════════════════════════════
payments.get("/subscription", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "User ID required" }, 401);

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      `
      *,
      plans (
        id, name, display_name, price_monthly, price_yearly,
        max_companies, max_journals, features
      )
    `,
    )
    .eq("user_id", userId)
    .maybeSingle(); // ← FIXED: pakai maybeSingle() biar gak error kalau kosong

  if (error) {
    console.error("[Payments] Subscription fetch error:", error);
    return c.json({ error: error.message }, 500);
  }

  // Kalau belum punya subscription, auto-create
  if (!data) {
    console.log("[Payments] No subscription found, creating default...");

    const { data: freePlan } = await supabase
      .from("plans")
      .select("id")
      .eq("name", "free")
      .single();

    if (!freePlan) return c.json({ error: "Free plan not found" }, 500);

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 15 * 86400000);

    const { data: newSub, error: insertErr } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_id: freePlan.id,
        status: "trialing",
        trial_start: now.toISOString(),
        trial_end: trialEnd.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: trialEnd.toISOString(),
      })
      .select(
        `
        *,
        plans (
          id, name, display_name, price_monthly, price_yearly,
          max_companies, max_journals, features
        )
      `,
      )
      .single();

    if (insertErr) {
      console.error("[Payments] Auto-create subscription error:", insertErr);
      return c.json({ error: insertErr.message }, 500);
    }

    return c.json({
      ...newSub,
      is_active: true,
      trial_days_left: 15,
      is_trial: true,
    });
  }

  // Calculate remaining trial days
  const now = new Date();
  const trialEnd = data.trial_end ? new Date(data.trial_end) : null;
  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000))
    : 0;

  const isActive =
    (data.status === "trialing" && trialEnd && trialEnd > now) ||
    (data.status === "active" &&
      data.current_period_end &&
      new Date(data.current_period_end) > now);

  return c.json({
    ...data,
    is_active: isActive,
    trial_days_left: trialDaysLeft,
    is_trial: data.status === "trialing",
  });
});

// ═══════════════════════════════════════════════════════════════════════
// POST /subscribe — Create payment & get Midtrans Snap token
// ═══════════════════════════════════════════════════════════════════════
payments.post("/subscribe", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "User ID required" }, 401);

  const body = await c.req.json();
  const { plan_name, billing_cycle = "monthly" } = body as {
    plan_name: PlanName;
    billing_cycle?: BillingCycle;
  };

  if (!["pro", "enterprise"].includes(plan_name)) {
    return c.json({ error: "Invalid plan. Choose 'pro' or 'enterprise'" }, 400);
  }

  const amount = getPlanPrice(plan_name, billing_cycle);
  if (amount <= 0) {
    return c.json({ error: "Invalid plan/billing combination" }, 400);
  }

  try {
    // 1. Get user details
    const { data: userData } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", userId)
      .single();

    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }

    // 2. Get plan from DB
    const { data: plan } = await supabase
      .from("plans")
      .select("id, display_name")
      .eq("name", plan_name)
      .single();

    if (!plan) return c.json({ error: "Plan not found" }, 404);

    // 3. Generate order ID
    const orderId = generateOrderId(userId);

    // 4. Create Midtrans Snap transaction
    const cycleLabel = billing_cycle === "yearly" ? "Tahunan" : "Bulanan";
    const snapParameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: plan_name,
          price: amount,
          quantity: 1,
          name: `LedgerFlow ${plan.display_name} - ${cycleLabel}`,
          category: "subscription",
        },
      ],
      customer_details: {
        first_name: userData.name || "User",
        email: userData.email || "",
      },
      credit_card: {
        secure: true,
        save_card: true,
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/success?order_id=${orderId}`,
        error: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/failed?order_id=${orderId}`,
        pending: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/pending?order_id=${orderId}`,
      },
    };

    console.log("[Payments] Creating Snap transaction...", {
      orderId,
      amount,
      plan_name,
    });

    const snapResponse = await snap.createTransaction(snapParameter);

    console.log("[Payments] Snap response received:", {
      hasToken: !!snapResponse.token,
      hasRedirect: !!snapResponse.redirect_url,
    });

    // 5. Get or create subscription
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let subscriptionId: string;

    if (existingSub) {
      // JANGAN update plan disini — plan baru berubah SETELAH bayar (via webhook)
      subscriptionId = existingSub.id;
    } else {
      const { data: newSub, error: insertErr } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: plan.id,
          billing_cycle,
          status: "trialing",
          trial_start: new Date().toISOString(),
          trial_end: new Date(Date.now() + 15 * 86400000).toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() + 15 * 86400000,
          ).toISOString(),
        })
        .select("id")
        .single();

      if (insertErr || !newSub) {
        console.error("[Payments] Insert subscription error:", insertErr);
        return c.json({ error: "Failed to create subscription" }, 500);
      }
      subscriptionId = newSub.id;
    }

    // 6. Create payment record (simpan plan yang mau dibeli di midtrans_response)
    const { error: paymentErr } = await supabase.from("payments").insert({
      subscription_id: subscriptionId,
      user_id: userId,
      order_id: orderId,
      amount,
      status: "pending",
      snap_token: snapResponse.token,
      snap_redirect_url: snapResponse.redirect_url,
      midtrans_response: {
        pending_plan_id: plan.id,
        pending_billing_cycle: billing_cycle,
      },
    });

    if (paymentErr) {
      console.error("[Payments] Insert payment error:", paymentErr);
    }

    console.log(`[Payments] Snap token created for order ${orderId}`);

    return c.json({
      snap_token: snapResponse.token,
      redirect_url: snapResponse.redirect_url,
      order_id: orderId,
    });
  } catch (err: any) {
    console.error("[Payments] Subscribe error:", err?.message || err);
    return c.json({ error: err?.message || "Failed to create payment" }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════
// POST /webhook — Midtrans Payment Notification (Webhook)
// ═══════════════════════════════════════════════════════════════════════
payments.post("/webhook", async (c) => {
  try {
    const notification = await c.req.json();

    console.log("[Midtrans Webhook] Received:", {
      order_id: notification.order_id,
      transaction_status: notification.transaction_status,
      fraud_status: notification.fraud_status,
      payment_type: notification.payment_type,
    });

    const isValid = verifySignature(
      notification.order_id,
      notification.status_code,
      notification.gross_amount,
      process.env.MIDTRANS_SERVER_KEY || "",
      notification.signature_key,
    );

    if (!isValid) {
      console.error("[Midtrans Webhook] Invalid signature!");
      return c.json({ error: "Invalid signature" }, 403);
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*, subscriptions(id, user_id, plan_id, billing_cycle)")
      .eq("order_id", notification.order_id)
      .single();

    if (paymentError || !payment) {
      console.error(
        "[Midtrans Webhook] Payment not found:",
        notification.order_id,
      );
      return c.json({ error: "Payment not found" }, 404);
    }

    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    let paymentStatus: string;

    if (transactionStatus === "capture") {
      paymentStatus = fraudStatus === "accept" ? "paid" : "failed";
    } else if (transactionStatus === "settlement") {
      paymentStatus = "paid";
    } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
      paymentStatus = transactionStatus === "expire" ? "expired" : "failed";
    } else if (transactionStatus === "refund") {
      paymentStatus = "refunded";
    } else {
      paymentStatus = "pending";
    }

    await supabase
      .from("payments")
      .update({
        status: paymentStatus,
        payment_type: notification.payment_type,
        midtrans_transaction_id: notification.transaction_id,
        midtrans_response: notification,
        paid_at: paymentStatus === "paid" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", notification.order_id);

    if (paymentStatus === "paid") {
      const sub = payment.subscriptions;

      // Ambil plan & billing_cycle dari payment record (yang disimpan saat subscribe)
      const pendingPlanId =
        payment.midtrans_response?.pending_plan_id || sub.plan_id;
      const pendingBillingCycle =
        payment.midtrans_response?.pending_billing_cycle ||
        sub.billing_cycle ||
        "monthly";
      const periodDays = pendingBillingCycle === "yearly" ? 365 : 30;
      const periodEnd = new Date(
        Date.now() + periodDays * 86400000,
      ).toISOString();

      const updateData: Record<string, any> = {
        status: "active",
        plan_id: pendingPlanId, // ← BARU update plan SETELAH bayar
        billing_cycle: pendingBillingCycle,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      };

      if (notification.saved_token_id) {
        updateData.midtrans_saved_token_id = notification.saved_token_id;
      }

      await supabase.from("subscriptions").update(updateData).eq("id", sub.id);
      console.log(
        `[Midtrans Webhook] Subscription activated for user ${sub.user_id}`,
      );
    } else if (paymentStatus === "failed" || paymentStatus === "expired") {
      await supabase
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("id", payment.subscription_id);
    }

    console.log(
      `[Midtrans Webhook] Order ${notification.order_id} → ${paymentStatus}`,
    );
    return c.json({ status: "ok" });
  } catch (err: any) {
    console.error("[Midtrans Webhook] Error:", err);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET /history — Payment history
// ═══════════════════════════════════════════════════════════════════════
payments.get("/history", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "User ID required" }, 401);

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ═══════════════════════════════════════════════════════════════════════
// POST /cancel — Cancel subscription
// ═══════════════════════════════════════════════════════════════════════
payments.post("/cancel", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "User ID required" }, 401);

  const body = await c.req.json();
  const { reason } = body;

  const { data: freePlan } = await supabase
    .from("plans")
    .select("id")
    .eq("name", "free")
    .single();

  if (!freePlan) return c.json({ error: "Free plan not found" }, 500);

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan_id: freePlan.id,
      status: "canceled",
      canceled_at: new Date().toISOString(),
      cancel_reason: reason || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) return c.json({ error: error.message }, 500);

  console.log(`[Payments] Subscription canceled for user ${userId}`);
  return c.json({ message: "Subscription canceled successfully" });
});

// ═══════════════════════════════════════════════════════════════════════
// GET /check-access — Quick check if user can access premium features
// ═══════════════════════════════════════════════════════════════════════
payments.get("/check-access", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "User ID required" }, 401);

  const feature = c.req.query("feature");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("user_id", userId)
    .maybeSingle();

  if (!sub) {
    return c.json({ has_access: false, reason: "no_subscription" });
  }

  const now = new Date();
  const isTrialActive =
    sub.status === "trialing" && sub.trial_end && new Date(sub.trial_end) > now;
  const isSubActive =
    sub.status === "active" &&
    sub.current_period_end &&
    new Date(sub.current_period_end) > now;

  if (!isTrialActive && !isSubActive) {
    return c.json({
      has_access: false,
      reason: "subscription_expired",
      plan: sub.plans?.name,
    });
  }

  const planName = sub.plans?.name;
  const featureAccess: Record<string, string[]> = {
    export_pdf: ["pro", "enterprise"],
    export_csv: ["enterprise"],
    unlimited_journals: ["pro", "enterprise"],
    multi_company: ["pro", "enterprise"],
    multi_user: ["enterprise"],
    api_access: ["enterprise"],
    income_statement: ["pro", "enterprise"],
    balance_sheet: ["pro", "enterprise"],
    cash_flow: ["pro", "enterprise"],
  };

  if (feature && featureAccess[feature]) {
    const hasAccess = featureAccess[feature].includes(planName);
    return c.json({
      has_access: hasAccess,
      plan: planName,
      required_plan: hasAccess ? null : featureAccess[feature][0],
    });
  }

  return c.json({
    has_access: true,
    plan: planName,
    is_trial: isTrialActive,
    trial_days_left: isTrialActive
      ? Math.ceil(
          (new Date(sub.trial_end).getTime() - now.getTime()) / 86400000,
        )
      : 0,
  });
});

export default payments;
