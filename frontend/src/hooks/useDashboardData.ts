// src/hooks/useDashboardData.ts
import { useState, useEffect } from "react";
import { reportsService } from "../services/reportsService";

export interface DashboardSummary {
  // Income Statement
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
  // Balance Sheet
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
  // Cash Flow
  beginningCash: number;
  endingCash: number;
  netCashFlow: number;
  operatingCash: number;
  investingCash: number;
  financingCash: number;
}

export function useDashboardData(periodId?: string) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ambil company_id dari localStorage (sama seperti reportsService lainnya)
        const userStr = localStorage.getItem("user");
        let companyId = "";
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            companyId = userObj.company_id || userObj.company?.id || "";
          } catch {}
        }

        const [income, balance, cashFlow] = await Promise.all([
          reportsService.getIncomeStatement(periodId).catch(() => null),
          reportsService
            .getBalanceSheet(periodId || "", companyId)
            .catch(() => null),
          reportsService.getCashFlow(periodId).catch(() => null),
        ]);

        if (!active) return;

        setSummary({
          totalRevenue: income?.totalRevenue ?? 0,
          totalExpense: income?.totalExpense ?? 0,
          netIncome: income?.netIncome ?? 0,
          totalAssets: balance?.total_assets ?? 0,
          totalLiabilities: balance?.total_liabilities ?? 0,
          totalEquity: balance?.total_equity ?? 0,
          isBalanced: balance?.is_balanced ?? true,
          beginningCash: cashFlow?.beginningCash ?? 0,
          endingCash: cashFlow?.endingCash ?? 0,
          netCashFlow: cashFlow?.netCashFlow ?? 0,
          operatingCash: cashFlow?.operating?.subtotal ?? 0,
          investingCash: cashFlow?.investing?.subtotal ?? 0,
          financingCash: cashFlow?.financing?.subtotal ?? 0,
        });
      } catch (e: any) {
        setError(e?.message || "Gagal memuat data dashboard");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      active = false;
    };
  }, [periodId]);

  return { summary, loading, error };
}
