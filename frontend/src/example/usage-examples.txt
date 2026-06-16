// ============================================================================
// LEDGERFLOW - Usage Examples
// ============================================================================
// Contoh bagaimana mengintegrasikan payment system ke page yang sudah ada
// ============================================================================

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 1: IncomeStatementPage dengan FeatureGate
// ═══════════════════════════════════════════════════════════════════════
/*
// Di IncomeStatementPage.tsx, wrap konten dengan FeatureGate:

import { useSubscription } from "../hooks/useSubscription";
import { FeatureGate } from "../components/Paywall";
import { AppShell } from "../components/AppShell";

export default function IncomeStatementPage() {
  const { canAccess, planName, getRequiredPlan, isLoading } = useSubscription();

  if (isLoading) {
    return <AppShell><div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div></AppShell>;
  }

  return (
    <AppShell>
      <FeatureGate
        feature="income_statement"
        canAccess={canAccess}
        currentPlan={planName}
        getRequiredPlan={getRequiredPlan}
      >
        {/* === Existing IncomeStatementPage content here === */}
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ... all existing JSX ... */}
        </div>
      </FeatureGate>
    </AppShell>
  );
}
*/

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 2: Inline Paywall (untuk tombol export)
// ═══════════════════════════════════════════════════════════════════════
/*
// Di BalanceSheet.tsx, ganti handleExportPDF:

import { useSubscription } from "../hooks/useSubscription";
import { Paywall } from "../components/Paywall";

export default function BalanceSheet() {
  const { canAccess, planName } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleExportPDF = () => {
    if (!canAccess("export_pdf")) {
      setShowPaywall(true);
      return;
    }
    // ... actual export logic ...
  };

  return (
    <AppShell>
      {showPaywall && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-darkCard rounded-2xl p-8 max-w-lg w-full">
            <Paywall
              feature="export_pdf"
              currentPlan={planName}
              requiredPlan="pro"
              compact
            />
            <button
              onClick={() => setShowPaywall(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ... rest of page ... */}
    </AppShell>
  );
}
*/

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 3: AppShell dengan TrialBanner
// ═══════════════════════════════════════════════════════════════════════
/*
// Di AppShell.tsx, tambahkan TrialBanner:

import { useSubscription } from "../hooks/useSubscription";
import { TrialBanner } from "../components/Paywall";

export function AppShell({ children }) {
  const { isTrial, trialDaysLeft } = useSubscription();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg">
      {/* Trial Banner — hanya muncul saat trial & sisa ≤ 14 hari */}
      {isTrial && trialDaysLeft > 0 && trialDaysLeft <= 10 && (
        <TrialBanner daysLeft={trialDaysLeft} />
      )}

      <Sidebar />
      <main className="ml-64 p-6">
        {children}
      </main>
    </div>
  );
}
*/

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 4: DashboardPage dengan Subscription Info Widget
// ═══════════════════════════════════════════════════════════════════════
/*
// Di DashboardPage.tsx, tambahkan widget subscription:

import { useSubscription } from "../hooks/useSubscription";
import { Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function SubscriptionWidget() {
  const { subscriptionSummary, isFree, isTrial, trialDaysLeft } = useSubscription();

  if (!subscriptionSummary) return null;

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700/50 shadow-md p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crown size={16} className="text-primary-500" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Subscription
          </h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          subscriptionSummary.isActive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
        }`}>
          {subscriptionSummary.isActive ? "Aktif" : "Tidak Aktif"}
        </span>
      </div>

      <p className="text-lg font-bold text-gray-900 dark:text-white">
        {subscriptionSummary.planName}
      </p>

      {isTrial && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
          <Sparkles size={14} className="inline mr-1" />
          Trial: {trialDaysLeft} hari tersisa
        </p>
      )}

      {isFree && !isTrial && (
        <Link
          to="/pricing"
          className="mt-3 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <Crown size={14} /> Upgrade ke Pro →
        </Link>
      )}
    </motion.div>
  );
}
*/

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 5: Router Setup (App.tsx)
// ═══════════════════════════════════════════════════════════════════════
/*
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PricingPage from "./pages/PricingPage";
import PaymentResultPage from "./pages/PaymentResultPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... existing routes ... */}

        {/* Payment Routes — TAMBAHKAN INI */}
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/payment/success" element={<PaymentResultPage type="success" />} />
        <Route path="/payment/pending" element={<PaymentResultPage type="pending" />} />
        <Route path="/payment/failed" element={<PaymentResultPage type="failed" />} />
      </Routes>
    </BrowserRouter>
  );
}
*/

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 6: SettingsPage — Subscription Management Section
// ═══════════════════════════════════════════════════════════════════════
/*
// Tambahkan section baru di SettingsPage.tsx:

import { useSubscription } from "../hooks/useSubscription";
import { cancelSubscription, formatPrice } from "../services/paymentService";
import { Crown, CreditCard } from "lucide-react";

// Di dalam SettingsPage component, tambahkan section:

const { subscription, planName, isPro, isEnterprise, isTrial, trialDaysLeft, refresh } = useSubscription();

// JSX section:
<motion.div
  variants={itemVariants}
  className="rounded-2xl bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700/50 shadow-md p-6"
>
  <div className="flex items-center gap-2 mb-4">
    <CreditCard size={18} className="text-primary-500" />
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
      Langganan
    </h3>
  </div>

  <div className="space-y-3">
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Plan Saat Ini</p>
        <p className="text-xs text-gray-500">{subscription?.plans?.display_name}</p>
      </div>
      <span className="text-sm font-bold text-primary-600">
        {formatPrice(subscription?.plans?.price_monthly || 0)}/bulan
      </span>
    </div>

    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Status</p>
      </div>
      <span className={`text-xs px-2.5 py-1 rounded-lg ${
        subscription?.is_active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
          : "bg-rose-50 text-rose-700"
      }`}>
        {isTrial ? `Trial (${trialDaysLeft} hari)` : subscription?.status}
      </span>
    </div>

    <div className="flex gap-3 pt-3">
      {(planName === "free" || isTrial) && (
        <Link
          to="/pricing"
          className="flex-1 py-2 text-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium hover:shadow-md transition-all"
        >
          <Crown size={14} className="inline mr-1" /> Upgrade
        </Link>
      )}
      {(isPro || isEnterprise) && !isTrial && (
        <button
          onClick={async () => {
            if (confirm("Yakin ingin cancel subscription?")) {
              await cancelSubscription("User requested");
              refresh();
            }
          }}
          className="flex-1 py-2 text-center rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          Cancel Subscription
        </button>
      )}
    </div>
  </div>
</motion.div>
*/

export {};
