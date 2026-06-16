// ============================================================================
// LEDGERFLOW - Payment Result Pages (Success, Pending, Failed)
// ============================================================================
// Routes:
//   /payment/success?order_id=xxx
//   /payment/pending?order_id=xxx
//   /payment/failed?order_id=xxx
// ============================================================================

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Home,
  FileText,
  RefreshCw,
} from "lucide-react";
import logo from "../assets/ledgerflow.png";

type ResultType = "success" | "pending" | "failed";

const RESULT_CONFIG: Record<
  ResultType,
  {
    icon: typeof CheckCircle;
    title: string;
    description: string;
    gradient: string;
    iconColor: string;
    bgColor: string;
  }
> = {
  success: {
    icon: CheckCircle,
    title: "Pembayaran Berhasil! 🎉",
    description:
      "Terima kasih! Subscription Anda telah aktif. Nikmati semua fitur premium LedgerFlow.",
    gradient: "from-emerald-500 to-cyan-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  pending: {
    icon: Clock,
    title: "Menunggu Pembayaran",
    description:
      "Pembayaran Anda sedang diproses. Kami akan mengaktifkan subscription Anda segera setelah pembayaran dikonfirmasi.",
    gradient: "from-amber-500 to-orange-500",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  failed: {
    icon: XCircle,
    title: "Pembayaran Gagal",
    description:
      "Maaf, pembayaran Anda tidak berhasil. Silakan coba lagi atau gunakan metode pembayaran lain.",
    gradient: "from-rose-500 to-red-500",
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-900/20",
  },
};

interface PaymentResultPageProps {
  type: ResultType;
}

export default function PaymentResultPage({ type }: PaymentResultPageProps) {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const config = RESULT_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-darkBg dark:to-gray-900 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full text-center"
      >
        {/* Logo */}
        <Link to="/" className="inline-block mb-8">
          <img src={logo} alt="LedgerFlow" className="w-12 h-12 mx-auto" />
        </Link>

        {/* Icon with Glow */}
        <div className="relative inline-block mb-6">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${config.gradient} blur-2xl opacity-30 rounded-full scale-150`}
          />
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className={`relative w-24 h-24 rounded-full ${config.bgColor} flex items-center justify-center`}
          >
            <Icon className={`w-12 h-12 ${config.iconColor}`} />
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
        >
          {config.title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-3 text-gray-600 dark:text-gray-400"
        >
          {config.description}
        </motion.p>

        {/* Order ID */}
        {orderId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 rounded-xl bg-gray-100 dark:bg-gray-800"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
            <p className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">
              {orderId}
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          {type === "success" && (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Home size={16} />
              Ke Dashboard
              <ArrowRight size={16} />
            </Link>
          )}

          {type === "pending" && (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Home size={16} />
                Ke Dashboard
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <RefreshCw size={16} />
                Cek Status
              </button>
            </>
          )}

          {type === "failed" && (
            <>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <RefreshCw size={16} />
                Coba Lagi
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Home size={16} />
                Ke Dashboard
              </Link>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-xs text-gray-500 dark:text-gray-400"
        >
          Ada pertanyaan?{" "}
          <Link to="/help-center" className="text-primary-600 hover:underline">
            Hubungi Support
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
