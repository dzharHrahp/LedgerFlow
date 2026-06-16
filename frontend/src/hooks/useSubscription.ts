// ============================================================================
// LEDGERFLOW - useSubscription Hook
// ============================================================================
// Usage:
//   const { subscription, isLoading, isPro, isEnterprise, isTrial,
//           trialDaysLeft, canAccess, refresh } = useSubscription();
//
//   if (!canAccess("export_pdf")) { showPaywall(); }
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getSubscription,
  checkFeatureAccess,
  type Subscription,
} from "../services/paymentService"

// Feature → minimum plan
const FEATURE_PLAN: Record<string, string[]> = {
  income_statement: ["pro", "enterprise"],
  balance_sheet: ["pro", "enterprise"],
  cash_flow: ["pro", "enterprise"],
  export_pdf: ["pro", "enterprise"],
  export_csv: ["enterprise"],
  unlimited_journals: ["pro", "enterprise"],
  multi_company: ["pro", "enterprise"],
  multi_user: ["enterprise"],
  api_access: ["enterprise"],
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSubscription();
      setSubscription(data);
    } catch (err: any) {
      console.error("[useSubscription] Error:", err);
      setError(err.message || "Failed to load subscription");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // ─── Computed Properties ────────────────────────────────────────
  const planName = subscription?.plans?.name || "free";
  const isActive = subscription?.is_active ?? false;
  const isTrial = subscription?.is_trial ?? false;
  const trialDaysLeft = subscription?.trial_days_left ?? 0;

  const isFree = planName === "free";
  const isPro = planName === "pro";
  const isEnterprise = planName === "enterprise";

  // Check if user can access a specific feature (client-side check)
  const canAccess = useCallback(
    (feature: string): boolean => {
      if (!isActive) return false;

      // Trial = sama kayak Free (tetap dibatasi, harus bayar dulu)
      // Fitur premium hanya bisa diakses kalau SUDAH BAYAR (plan pro/enterprise)

      const allowedPlans = FEATURE_PLAN[feature];
      if (!allowedPlans) return true; // feature not gated
      return allowedPlans.includes(planName);
    },
    [isActive, planName]
  );

  // Get required plan for a feature
  const getRequiredPlan = useCallback((feature: string): string | null => {
    const plans = FEATURE_PLAN[feature];
    return plans ? plans[0] : null;
  }, []);

  // Summary for display
  const subscriptionSummary = useMemo(() => {
    if (!subscription) return null;

    return {
      planName: subscription.plans?.display_name || "Free",
      status: subscription.status,
      billingCycle: subscription.billing_cycle,
      currentPeriodEnd: subscription.current_period_end,
      isActive,
      isTrial,
      trialDaysLeft,
    };
  }, [subscription, isActive, isTrial, trialDaysLeft]);

  return {
    subscription,
    subscriptionSummary,
    isLoading,
    error,

    // Plan checks
    planName,
    isActive,
    isFree,
    isPro,
    isEnterprise,
    isTrial,
    trialDaysLeft,

    // Feature checks
    canAccess,
    getRequiredPlan,

    // Actions
    refresh: fetchSubscription,
  };
}
