import { useState, useEffect, useCallback } from "react";
import type { IncomeStatementResponse } from "../types/reports";
import { reportsService } from "../services/reportsService";

export function useIncomeStatement(initialPeriodId?: string) {
  const [periodId, setPeriodId] = useState<string | undefined>(initialPeriodId);
  const [data, setData] = useState<IncomeStatementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getIncomeStatement(periodId);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat memuat Laporan Laba Rugi");
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { data, loading, error, periodId, setPeriodId, refetch: fetchReport };
}