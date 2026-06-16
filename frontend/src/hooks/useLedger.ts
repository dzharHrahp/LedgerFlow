import { useState, useCallback } from "react";
import { ledgerService } from "../services/ledgerService";
import type {
  LedgerResult,
  LedgerQueryParams,
  AccountOption,
  Period,
} from "../types/ledger";
import { useToast } from "../context/ToastContext";

export function useLedger() {
  const { toast } = useToast();

  const [result, setResult] = useState<LedgerResult | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [refLoading, setRefLoading] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);

  const fetchRefData = useCallback(async () => {
    setRefLoading(true);
    setRefError(null);
    try {
      const [accs, per] = await Promise.all([
        ledgerService.getAccounts(),
        ledgerService.getPeriods(),
      ]);
      setAccounts(accs);
      setPeriods(per);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Gagal memuat data referensi";
      setRefError(msg);
      toast({
        variant: "error",
        title: "Gagal memuat data referensi",
        message: msg,
      });
    } finally {
      setRefLoading(false);
    }
  }, [toast]);

  const fetchLedger = useCallback(
    async (params: LedgerQueryParams) => {
      setLedgerLoading(true);
      setLedgerError(null);
      try {
        const data = await ledgerService.getLedger(params);
        setResult(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal memuat buku besar";
        setLedgerError(msg);
        setResult(null);
        toast({
          variant: "error",
          title: "Gagal memuat buku besar",
          message: msg,
        });
      } finally {
        setLedgerLoading(false);
      }
    },
    [toast],
  );

  return {
    accounts,
    periods,
    refLoading,
    refError,
    fetchRefData,
    result,
    ledgerLoading,
    ledgerError,
    fetchLedger,
  };
}
