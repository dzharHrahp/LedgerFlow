export interface JournalEntry {
  id: string;
  number: string;
  date: string;
  description: string;
  status: "draft" | "posted";
  createdAt: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
}

export interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export interface CreateJournalPayload {
  entry_date: string;
  description: string;
  period_id?: string;
  status?: "draft" | "posted";
  lines: Array<{
    accountCode: string;
    debit: number;
    credit: number;
    memo?: string;
  }>;
}

export interface JournalEntryForm {
  date: string;
  period_id?: string;
  description: string;
  lines: JournalLineForm[];
}

export interface JournalLineForm {
  uid: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: string;
  credit: string;
}

export interface JournalFormErrors {
  date?: string;
  description?: string;
  lines?: string;
  balance?: string;
}

export type FilterStatus = "all" | "active" | "inactive";
