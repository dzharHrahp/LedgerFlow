// ─── Enums / Literals ─────────────────────────────────────────────────────────

export type JournalStatus = "draft" | "posted";
export type EntryType = "debit" | "credit";

// ─── Domain Models ─────────────────────────────────────────────────────────────

export interface JournalLine {
  id: number;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  number: string;        // e.g. "JE-2024-001"
  date: string;          // ISO date string
  description: string;
  status: JournalStatus;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  createdAt: string;
}

// ─── Form Models ──────────────────────────────────────────────────────────────

export interface JournalLineForm {
  uid: string;

  accountCode: string;
  accountName: string;

  description: string;
  debit: string;
  credit: string;
}

export interface JournalEntryForm {
  date: string;
  description: string;
  lines: JournalLineForm[];
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateJournalPayload {
  entry_date: string;
  description: string;
  lines: {
    accountCode: string;
    debit: number;
    credit: number;
    memo?: string;
  }[];
}
// ─── UI Helpers ───────────────────────────────────────────────────────────────

export interface Toast {
  id: number;
  msg: string;
  type: "success" | "error";
}

export type JournalFormErrors = {
  date?: string;
  description?: string;
  lines?: string;
  balance?: string;
};
