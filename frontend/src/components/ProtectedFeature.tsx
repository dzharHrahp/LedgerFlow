// ============================================================================
// LEDGERFLOW - ProtectedFeature Wrapper
// ============================================================================
// Wrap halaman premium di App.tsx routes. Kalau user Free → tampil Paywall.
//
// Usage di App.tsx:
//   <Route path="/income-statement" element={
//     <ProtectedRoute>
//       <ProtectedFeature feature="income_statement">
//         <IncomeStatementPage />
//       </ProtectedFeature>
//     </ProtectedRoute>
//   } />
// ============================================================================

import { Loader2 } from "lucide-react";
import { useSubscription } from "../hooks/useSubscription";
import { Paywall } from "./Paywall";
import { AppShell } from "./AppShell";

interface ProtectedFeatureProps {
  feature: string;
  children: React.ReactNode;
}

export function ProtectedFeature({ feature, children }: ProtectedFeatureProps) {
  const { canAccess, planName, getRequiredPlan, isLoading } = useSubscription();

  // Loading state
  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </AppShell>
    );
  }

  // User gak punya akses → tampilkan Paywall
  if (!canAccess(feature)) {
    return (
      <AppShell>
        <Paywall
          feature={feature}
          currentPlan={planName}
          requiredPlan={getRequiredPlan(feature) || "pro"}
        />
      </AppShell>
    );
  }

  // User punya akses → tampilkan halaman asli
  return <>{children}</>;
}
