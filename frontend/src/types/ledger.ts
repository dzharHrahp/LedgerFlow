// Types untuk modul buku besar

// Saldo normal akun di frontend
export type NormalBalance = "Debit" | "Credit";

// Bentuk akun ringkas untuk dropdown/select buku besar
export interface AccountOption {
  id: string;
  code: string;
  name: string;
  normalBalance: NormalBalance;
  isActive: boolean;
}

// Bentuk periode akuntansi untuk filter ledger
export interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Satu baris transaksi pada laporan buku besar
export interface LedgerLine {
  id: string;
  date: string;
  journalNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

// Hasil lengkap response ledger dari backend
export interface LedgerResult {
  account: AccountOption;
  period: Period | null;
  startDate: string;
  endDate: string;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  lines: LedgerLine[];
}

// Parameter query saat mengambil ledger
export interface LedgerQueryParams {
  accountId: string;
  periodId?: string;
  startDate?: string;
  endDate?: string;
}

// Tipe toast lokal sederhana
export interface Toast {
  id: number;
  msg: string;
  type: "success" | "error";
}

// Mode filter tanggal pada UI ledger
export type DateRangeMode = "period" | "custom";
