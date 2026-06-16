// ============================================================================
// LEDGERFLOW - Paywall Component
// ============================================================================
// Shows when user tries to access a premium feature without the right plan.
//
// Usage:
//   <Paywall
//     feature="export_pdf"
//     currentPlan="free"
//     requiredPlan="pro"
//     onUpgrade={() => navigate("/pricing")}
//   />
//
// Or as a wrapper:
//   <FeatureGate feature="income_statement" fallback={<Paywall />}>
//     <IncomeStatementPage />
//   </FeatureGate>
// ============================================================================

import { motion, type Variants } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Lock,
  Crown,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  ChevronRight,
} from "lucide-react";
import type { ReactNode } from "react";

// ─── Dictionaries ───────────────────────────────────────────────────
const FEATURE_NAMES: Record<string, string> = {
  income_statement: "Laporan Laba Rugi",
  balance_sheet: "Neraca (Balance Sheet)",
  cash_flow: "Laporan Arus Kas",
  export_pdf: "Export PDF",
  export_csv: "Export CSV",
  unlimited_journals: "Unlimited Journal Entries",
  multi_company: "Multi-Company",
  multi_user: "Multi-User & Roles",
  api_access: "API Access",
  custom_reports: "Custom Reports",
};

const PLAN_NAMES: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

const PLAN_COLORS: Record<string, string> = {
  pro: "from-blue-600 to-cyan-500",
  enterprise: "from-purple-600 to-pink-500",
};

// ─── Animation Variants (hoisted — created once, not per render) ────
// Per-CHARACTER animation. `spaceVariants` separately so spaces don't
// rotate (they're invisible anyway, rotating them can cause layout jitter).
const titleContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.025, delayChildren: 0.2 },
  },
};

const charVariants: Variants = {
  hidden: { y: 40, opacity: 0, rotateX: -90 },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: { type: "spring", stiffness: 220, damping: 18 },
  },
};

const spaceVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, delay: 0.1 },
  },
};

// ─── Default Highlights ─────────────────────────────────────────────
const DEFAULT_HIGHLIGHTS = [
  { icon: Zap, label: "Unlimited Journals", desc: "Tanpa batasan" },
  { icon: Shield, label: "Semua Laporan", desc: "Laba Rugi, Neraca, dll" },
  { icon: Sparkles, label: "Export PDF", desc: "Download laporan" },
];

// ─── Props ──────────────────────────────────────────────────────────
interface PaywallProps {
  feature?: string;
  currentPlan?: string;
  requiredPlan?: string;
  title?: string;
  description?: ReactNode;
  onUpgrade?: () => void;
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
// FULL PAYWALL
// ═══════════════════════════════════════════════════════════════════════
export function Paywall({
  feature,
  currentPlan = "free",
  requiredPlan = "pro",
  title,
  description,
  onUpgrade,
  compact = false,
}: PaywallProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const featureName = feature ? (FEATURE_NAMES[feature] ?? feature) : "";
  const planName = PLAN_NAMES[requiredPlan] ?? requiredPlan;
  const gradientClass =
    PLAN_COLORS[requiredPlan] ?? "from-primary-600 to-primary-500";

  const handleUpgrade = () => {
    if (onUpgrade) onUpgrade();
    else navigate("/pricing");
  };

  const resolvedTitle = title ?? "Upgrade untuk Membuka Fitur Ini";

  // ─── Compact variant ───────────────────────────────────────────────
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-600/50 bg-amber-50/50 dark:bg-amber-900/10 p-6 text-center"
      >
        <Lock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title ?? `Fitur ${planName}`}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {description ?? (
            <>
              {featureName && <strong>{featureName}</strong>}
              {featureName && " "}
              {!featureName && "Fitur ini "}
              memerlukan plan {planName} atau lebih tinggi.
            </>
          )}
        </p>
        <button
          onClick={handleUpgrade}
          className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${gradientClass} text-white text-sm font-semibold hover:shadow-lg transition-all`}
        >
          <Crown size={14} /> Upgrade ke {planName}
        </button>
      </motion.div>
    );
  }

  // ─── Full-page variant ─────────────────────────────────────────────
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      {/* `key={location.pathname}` → every route navigation remounts this subtree
          and Framer Motion re-runs the entrance animation from scratch. */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-lg w-full text-center"
      >
        {/* Lock Icon with Glow */}
        <div className="relative inline-block mb-6">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${gradientClass} blur-2xl opacity-30 rounded-full scale-150`}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
            className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-xl`}
          >
            <Lock className="w-10 h-10 text-white" />
          </motion.div>
        </div>

        {/* Title — per-CHARACTER stagger animation */}
        <motion.h2
          initial="hidden"
          animate="visible"
          variants={titleContainerVariants}
          className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
          style={{ perspective: "600px" }}
        >
          {resolvedTitle.split("").map((char, i) => {
            const isSpace = char === " ";
            return (
              <motion.span
                key={i}
                variants={isSpace ? spaceVariants : charVariants}
                className="inline-block align-baseline"
                style={{
                  transformOrigin: "bottom center",
                  // spaces get a stable width so they don't shift layout during fade
                  ...(isSpace && { width: "0.3em" }),
                }}
              >
                {isSpace ? "\u00A0" : char}
              </motion.span>
            );
          })}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-3 text-gray-600 dark:text-gray-400 max-w-md mx-auto"
        >
          {description ?? (
            <>
              {featureName && <strong>{featureName}</strong>}
              {featureName && " "}
              {!featureName && "Fitur ini "}
              tersedia pada plan {planName}. Upgrade sekarang untuk akses penuh
              ke semua fitur premium LedgerFlow.
            </>
          )}
        </motion.p>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {DEFAULT_HIGHLIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700/50"
              >
                <Icon className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            );
          })}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={handleUpgrade}
            className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r ${gradientClass} text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all`}
          >
            <Crown size={18} />
            Upgrade ke {planName}
            <ArrowRight size={16} />
          </button>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Lihat Semua Plan
            <ChevronRight size={16} />
          </Link>
        </motion.div>

        {/* Current Plan Badge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 text-xs text-gray-500 dark:text-gray-400"
        >
          Plan saat ini:{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {PLAN_NAMES[currentPlan] ?? currentPlan}
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FEATURE GATE - Wrapper component
// ═══════════════════════════════════════════════════════════════════════
interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  // These come from useSubscription hook
  canAccess: (feature: string) => boolean;
  currentPlan: string;
  getRequiredPlan: (feature: string) => string | null;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  canAccess,
  currentPlan,
  getRequiredPlan,
}: FeatureGateProps) {
  if (canAccess(feature)) return children;

  if (fallback) return fallback;

  return (
    <Paywall
      feature={feature}
      currentPlan={currentPlan}
      requiredPlan={getRequiredPlan(feature) ?? "pro"}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TRIAL BANNER - Shows remaining trial days
// ═══════════════════════════════════════════════════════════════════════
interface TrialBannerProps {
  daysLeft: number;
  onUpgrade?: () => void;
}

export function TrialBanner({ daysLeft, onUpgrade }: TrialBannerProps) {
  const navigate = useNavigate();

  if (daysLeft <= 0) return null;

  const isUrgent = daysLeft <= 5;
  const bgClass = isUrgent
    ? "bg-gradient-to-r from-rose-500 to-orange-500"
    : "bg-gradient-to-r from-primary-600 to-cyan-500";

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`${bgClass} text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm`}
    >
      <Sparkles size={16} />
      <span>
        {isUrgent ? "⚡" : "🎉"} Trial Anda tersisa{" "}
        <strong>{daysLeft} hari</strong>
        {isUrgent
          ? " lagi! Upgrade sekarang agar tidak kehilangan akses."
          : ". Nikmati semua fitur premium LedgerFlow!"}
      </span>
      <button
        onClick={() => (onUpgrade ? onUpgrade() : navigate("/pricing"))}
        className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 font-semibold text-xs transition-colors"
      >
        Upgrade Sekarang →
      </button>
    </motion.div>
  );
}

export default Paywall;
