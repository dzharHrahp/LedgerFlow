// ============================================================================
// LEDGERFLOW - Payment Service (Frontend)
// ============================================================================

import { api } from "../lib/api";

// ─── Types ──────────────────────────────────────────────────────────
export interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  max_companies: number;
  max_journals: number | null;
  features: string[];
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "expired";
  billing_cycle: "monthly" | "yearly";
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  is_active: boolean;
  is_trial: boolean;
  trial_days_left: number;
  plans: Plan;
}

export interface PaymentHistory {
  id: string;
  order_id: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "expired" | "refunded";
  payment_type: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface SubscribeResponse {
  snap_token: string;
  redirect_url: string;
  order_id: string;
}

export interface AccessCheck {
  has_access: boolean;
  plan: string;
  required_plan?: string;
  reason?: string;
  is_trial?: boolean;
  trial_days_left?: number;
}

// ─── API Functions ──────────────────────────────────────────────────

/**
 * Get all available plans
 */
export async function getPlans(): Promise<Plan[]> {
  const res = await api.get("/api/payments/plans");
  return res.data;
}

/**
 * Get current user's subscription
 */
export async function getSubscription(): Promise<Subscription> {
  const res = await api.get("/api/payments/subscription");
  return res.data;
}

/**
 * Create subscription payment & get Midtrans Snap token
 */
export async function subscribe(
  planName: string,
  billingCycle: "monthly" | "yearly" = "monthly",
): Promise<SubscribeResponse> {
  const res = await api.post("/api/payments/subscribe", {
    plan_name: planName,
    billing_cycle: billingCycle,
  });
  return res.data;
}

/**
 * Get payment history
 */
export async function getPaymentHistory(): Promise<PaymentHistory[]> {
  const res = await api.get("/api/payments/history");
  return res.data;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(reason?: string): Promise<void> {
  await api.post("/api/payments/cancel", { reason });
}

/**
 * Check if user has access to a specific feature
 */
export async function checkFeatureAccess(
  feature: string,
): Promise<AccessCheck> {
  const res = await api.get(`/api/payments/check-access?feature=${feature}`);
  return res.data;
}

// ─── Midtrans Snap Helper ───────────────────────────────────────────

/**
 * Open Midtrans Snap payment popup
 * Requires Snap.js to be loaded: <script src="https://app.sandbox.midtrans.com/snap/snap.js">
 */
export function openSnapPayment(
  snapToken: string,
  callbacks?: {
    onSuccess?: (result: any) => void;
    onPending?: (result: any) => void;
    onError?: (result: any) => void;
    onClose?: () => void;
  },
): void {
  const win = window as any;

  if (!win.snap) {
    console.error(
      "[Payment] Snap.js not loaded! Add the script tag to your HTML.",
    );
    // Fallback: redirect to Snap redirect URL
    return;
  }

  win.snap.pay(snapToken, {
    onSuccess: (result: any) => {
      console.log("[Payment] Success:", result);
      callbacks?.onSuccess?.(result);
    },
    onPending: (result: any) => {
      console.log("[Payment] Pending:", result);
      callbacks?.onPending?.(result);
    },
    onError: (result: any) => {
      console.error("[Payment] Error:", result);
      callbacks?.onError?.(result);
    },
    onClose: () => {
      console.log("[Payment] Popup closed");
      callbacks?.onClose?.();
    },
  });
}

// ─── Format Helpers ─────────────────────────────────────────────────

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceCompact(amount: number): string {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(0)}jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  return formatPrice(amount);
}
