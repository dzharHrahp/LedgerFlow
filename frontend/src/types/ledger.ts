// ─── Account selector ─────────────────────────────────────────────────────────

export type NormalBalance = "Debit" | "Credit";

/** Slim account shape returned by GET /api/accounts (only fields we need) */
export interface AccountOption {
  id: string; // UUID (sesuai database)
  code: string;
  name: string;
  normalBalance: NormalBalance;
  isActive: boolean;
}

// ─── Period ───────────────────────────────────────────────────────────────────

export interface Period {
  id: string; // UUID (sesuai database)
  name: string; // e.g. "Januari 2024"
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// ─── Ledger response ──────────────────────────────────────────────────────────

/** One row in the ledger table */
export interface LedgerLine {
  id: string; // UUID (sesuai database)
  date: string;
  journalNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number; // running balance, pre-calculated by backend
}

/** Full response from GET /api/ledger */
export interface LedgerResult {
  account: AccountOption;
  period: Period | null; // null when using custom date range
  startDate: string;
  endDate: string;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  lines: LedgerLine[];
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface LedgerQueryParams {
  accountId: string; // UUID
  periodId?: string; // UUID
  startDate?: string;
  endDate?: string;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export interface Toast {
  id: number;
  msg: string;
  type: "success" | "error";
}

export type DateRangeMode = "period" | "custom";
