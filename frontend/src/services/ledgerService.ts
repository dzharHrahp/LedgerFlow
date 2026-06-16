import type {
  AccountOption,
  Period,
  LedgerResult,
  LedgerQueryParams,
  NormalBalance,
} from "../types/ledger";
import { api } from "../lib/api";

// ─── Mappers (snake_case / UPPERCASE dari DB -> bentuk frontend) ──────────────

/** DB menyimpan 'DEBIT'/'CREDIT' (uppercase). Normalisasi ke "Debit"/"Credit". */
function normalizeBalance(nb: any): NormalBalance {
  return String(nb).toUpperCase() === "CREDIT" ? "Credit" : "Debit";
}

function mapAccount(a: any): AccountOption {
  return {
    id: a.id,
    code: a.code,
    name: a.name,
    normalBalance: normalizeBalance(a.normalBalance ?? a.normal_balance),
    isActive: a.isActive ?? a.is_active ?? true,
  };
}

// Periods di DB: { id, year, month, status } — diubah ke bentuk UI yang dipakai.
const MONTH_NAMES_ID = [
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

function mapPeriod(p: any): Period {
  // Bila backend sudah mengirim startDate/endDate/name, pakai itu.
  if (p.startDate || p.start_date || p.name) {
    return {
      id: p.id,
      name:
        p.name ??
        `${MONTH_NAMES_ID[(p.month ?? 1) - 1] ?? ""} ${p.year ?? ""}`.trim(),
      startDate: p.startDate ?? p.start_date,
      endDate: p.endDate ?? p.end_date,
      isActive: p.isActive ?? p.is_active ?? p.status === "open",
    };
  }
  // Kalau backend mengirim { year, month, status } mentah, hitung di sini.
  const year = Number(p.year);
  const month = Number(p.month);
  const pad = (n: number) => String(n).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return {
    id: p.id,
    name: `${MONTH_NAMES_ID[month - 1] ?? month} ${year}`,
    startDate: `${year}-${pad(month)}-01`,
    endDate: `${year}-${pad(month)}-${pad(lastDay)}`,
    isActive: p.status === "open",
  };
}

// ─── Service (memakai instance `api` yang sama dgn journalService: token + baseURL) ─

export const ledgerService = {
  /** GET /api/accounts — reuse the same endpoint from COA module */
  getAccounts: async (): Promise<AccountOption[]> => {
    const { data } = await api.get("/api/accounts");
    return (data ?? []).map(mapAccount);
  },

  /** GET /api/periods (opsional — tabel periods mungkin belum ada) */
  getPeriods: async (): Promise<Period[]> => {
    try {
      const { data } = await api.get("/api/periods");
      return (data ?? []).map(mapPeriod);
    } catch {
      // Tabel/endpoint periods belum tersedia -> kembalikan kosong,
      // user tetap bisa pakai mode "Rentang Kustom".
      return [];
    }
  },

  /**
   * GET /api/ledger?account_id=&period_id=&start_date=&end_date=
   *
   * Exactly one of (period_id) OR (start_date + end_date) must be supplied.
   */
  getLedger: async (params: LedgerQueryParams): Promise<LedgerResult> => {
    const query: Record<string, string> = {
      account_id: String(params.accountId),
    };
    if (params.periodId !== undefined && params.periodId !== "") {
      query.period_id = String(params.periodId);
    }
    if (params.startDate) query.start_date = params.startDate;
    if (params.endDate) query.end_date = params.endDate;

    const { data } = await api.get("/api/ledger", { params: query });
    return data as LedgerResult;
  },
};
