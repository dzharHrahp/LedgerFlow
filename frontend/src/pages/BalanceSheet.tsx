import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  FileText,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "../components/Appshell";
import { useAuth } from "../context/AuthContext";
import { getBalanceSheet, getPeriods } from "../services/reportsService";
import type { BalanceSheetResponse, Period } from "../types/reports";
import { BalanceSheetCard } from "../components/reports/BalanceSheetCard";
import { BalanceSheetTable } from "../components/reports/BalanceSheetTable";
import { BalanceSheetStatus } from "../components/reports/BalanceSheetStatus";
import { HoverDropdown } from "../components/HoverDropdown";
import { exportBalanceSheetPDF } from "../utils/exportPDF";

export default function BalanceSheet() {
  const { user } = useAuth();

  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetResponse | null>(
    null,
  );
  const [isLoadingPeriods, setIsLoadingPeriods] = useState<boolean>(true);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriodId && user?.company_id) {
      fetchBalanceSheet(selectedPeriodId);
    }
  }, [selectedPeriodId, user?.company_id]);

  const fetchPeriods = async () => {
    try {
      setIsLoadingPeriods(true);
      setError(null);
      const data = await getPeriods();
      setPeriods(data);
      const openPeriod = data.find((p) => p.status === "open");
      if (openPeriod) {
        setSelectedPeriodId(openPeriod.id);
      } else if (data.length > 0) {
        setSelectedPeriodId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching periods:", err);
      setError("Gagal memuat data periode");
    } finally {
      setIsLoadingPeriods(false);
    }
  };

  const fetchBalanceSheet = async (periodId: string) => {
    if (!user?.company_id) return;
    try {
      setIsLoadingReport(true);
      setError(null);
      const data = await getBalanceSheet(periodId, user.company_id);
      setBalanceSheet(data);
    } catch (err) {
      console.error("Error fetching balance sheet:", err);
      setError("Gagal memuat data neraca");
      setBalanceSheet(null);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const getPeriodLabel = (period: Period): string => {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${monthNames[period.month - 1]} ${period.year}`;
  };

  const handleExportPDF = () => {
    if (!balanceSheet) return;
    const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);
    const periodLabel = selectedPeriod
      ? getPeriodLabel(selectedPeriod)
      : "Semua Periode";
    exportBalanceSheetPDF(balanceSheet, periodLabel);
  };

  if (isLoadingPeriods) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Memuat data periode...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <motion.h1
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.04, delayChildren: 0.3 },
                    },
                  }}
                  className="text-2xl font-bold text-gray-900 dark:text-white flex items-center flex-wrap"
                  style={{ perspective: "600px" }}
                >
                  {"Neraca (Balance Sheet)".split("").map((char, i) => (
                    <motion.span
                      key={i}
                      variants={{
                        hidden: { y: 40, opacity: 0, rotateX: -90 },
                        visible: {
                          y: 0,
                          opacity: 1,
                          rotateX: 0,
                          transition: {
                            type: "spring",
                            stiffness: 200,
                            damping: 18,
                          },
                        },
                      }}
                      className="inline-block"
                      style={{ transformOrigin: "bottom center" }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Laporan Posisi Keuangan Perusahaan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HoverDropdown
                value={selectedPeriodId}
                onChange={setSelectedPeriodId}
                disabled={isLoadingReport}
                placeholder="Pilih Periode"
                icon={<Calendar size={16} />}
                minWidth={210}
                options={[
                  { value: "", label: "Pilih Periode" },
                  ...periods.map((period) => ({
                    value: period.id,
                    label: `${getPeriodLabel(period)}${
                      period.status === "closed" ? " (Tutup)" : ""
                    }`,
                  })),
                ]}
              />
              <button
                onClick={handleExportPDF}
                disabled={!balanceSheet || isLoadingReport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                <Download className="w-5 h-5" />
                <span className="hidden md:inline">Export PDF</span>
              </button>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-500 rounded-2xl p-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-1">
                  Terjadi Kesalahan
                </h3>
                <p className="text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {isLoadingReport && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Memuat laporan neraca...
              </p>
            </div>
          </div>
        )}

        {!isLoadingReport && !error && !balanceSheet && selectedPeriodId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Belum Ada Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Belum ada data neraca untuk periode ini
            </p>
          </motion.div>
        )}

        {!isLoadingReport && !error && balanceSheet && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BalanceSheetCard
                title="Total Aset"
                amount={balanceSheet.total_assets}
                icon={TrendingUp}
                colorClass="text-cyan-600 dark:text-cyan-400"
                bgColorClass="bg-cyan-100 dark:bg-cyan-900"
                index={0}
              />
              <BalanceSheetCard
                title="Total Liabilitas"
                amount={balanceSheet.total_liabilities}
                icon={TrendingDown}
                colorClass="text-amber-600 dark:text-amber-400"
                bgColorClass="bg-amber-100 dark:bg-amber-900"
                index={1}
              />
              <BalanceSheetCard
                title="Total Ekuitas"
                amount={balanceSheet.total_equity}
                icon={Wallet}
                colorClass="text-purple-600 dark:text-purple-400"
                bgColorClass="bg-purple-100 dark:bg-purple-900"
                index={2}
              />
            </div>

            <BalanceSheetStatus
              isBalanced={balanceSheet.is_balanced}
              totalAssets={balanceSheet.total_assets}
              totalLiabilitiesEquity={
                balanceSheet.total_liabilities + balanceSheet.total_equity
              }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BalanceSheetTable
                title="ASET"
                accounts={balanceSheet.assets}
                total={balanceSheet.total_assets}
                colorClass="text-cyan-600 dark:text-cyan-400"
                emptyMessage="Tidak ada data aset"
              />
              <div className="space-y-6">
                <BalanceSheetTable
                  title="LIABILITAS"
                  accounts={balanceSheet.liabilities}
                  total={balanceSheet.total_liabilities}
                  colorClass="text-amber-600 dark:text-amber-400"
                  emptyMessage="Tidak ada data liabilitas"
                />
                <BalanceSheetTable
                  title="EKUITAS"
                  accounts={balanceSheet.equity}
                  total={balanceSheet.total_equity}
                  colorClass="text-purple-600 dark:text-purple-400"
                  emptyMessage="Tidak ada data ekuitas"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
