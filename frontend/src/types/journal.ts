// Types untuk modul jurnal

export type JournalStatus = "draft" | "posted";
export type EntryType = "debit" | "credit";

// Satu baris detail jurnal
export interface JournalLine {
  id: number;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

// Satu entri jurnal lengkap
export interface JournalEntry {
  id: string;
  number: string;
  date: string;
  description: string;
  status: JournalStatus;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  createdAt: string;
}

// Bentuk line jurnal di form frontend
export interface JournalLineForm {
  uid: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: string;
  credit: string;
}

// Bentuk form jurnal di frontend
export interface JournalEntryForm {
  date: string;
  description: string;
  lines: JournalLineForm[];
}

// Payload saat create jurnal ke backend
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

// Tipe toast lokal untuk modul jurnal
export interface Toast {
  id: number;
  msg: string;
  type: "success" | "error";
}

// Error validasi form jurnal
export type JournalFormErrors = {
  date?: string;
  description?: string;
  lines?: string;
  balance?: string;
};
