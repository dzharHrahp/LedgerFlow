export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "revenue"
  | "expense";
export type NormalBalance = "Debit" | "Credit";
export type FilterStatus = "all" | "active" | "inactive";
export type FilterType = AccountType | "all";

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;  // ✅ camelCase (konsisten dgn seluruh codebase)
  isActive: boolean;             // ✅ camelCase
}

export interface AccountFormData {
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
  isActive: boolean;
}

export type FormErrors = Partial<Record<keyof AccountFormData, string>>;

export interface Toast {
  id: number;
  msg: string;
  type: "success" | "error";
}
