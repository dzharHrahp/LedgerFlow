import type {
AccountType,
NormalBalance,
AccountFormData,
} from "../types/account";
import type {
JournalLineForm,
JournalEntryForm,
} from "../types/journal";

export const STATUS_CONFIG = {
draft: {
label: "Draft",
badge: "bg-amber-50 text-amber-700 border-amber-200",
dot: "bg-amber-400",
},
posted: {
label: "Posted",
badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
dot: "bg-emerald-500",
},
} as const;

export function makeEmptyLine(): JournalLineForm {
return {
uid: crypto.randomUUID(),
accountCode: "",
accountName: "",
description: "",
debit: "",
credit: "",
};
}

export const DEFAULT_JOURNAL_FORM: JournalEntryForm = {
date: new Date().toISOString().split("T")[0],
description: "",
lines: [makeEmptyLine(), makeEmptyLine()],
};

export const MIN_LINES = 2;

export const ACCOUNT_TYPES: AccountType[] = [
"asset",
"liability",
"equity",
"revenue",
"expense",
];

export const NORMAL_BALANCE_MAP: Record<
AccountType,
NormalBalance

> = {
 asset: "Debit",
 liability: "Credit",
 equity: "Credit",
 revenue: "Credit",
 expense: "Debit",
 };

export const TYPE_CLASSES: Record<AccountType, any> = {
asset: {
badge: "bg-blue-50 text-blue-700 border-blue-200",
pill: "text-blue-600",
button: "border-blue-300 bg-blue-50 text-blue-700",
buttonSelected: "ring-2 ring-blue-400",
},
liability: {
badge: "bg-amber-50 text-amber-700 border-amber-200",
pill: "text-amber-600",
button: "border-amber-300 bg-amber-50 text-amber-700",
buttonSelected: "ring-2 ring-amber-400",
},
equity: {
badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
pill: "text-emerald-600",
button: "border-emerald-300 bg-emerald-50 text-emerald-700",
buttonSelected: "ring-2 ring-emerald-400",
},
revenue: {
badge: "bg-green-50 text-green-700 border-green-200",
pill: "text-green-600",
button: "border-green-300 bg-green-50 text-green-700",
buttonSelected: "ring-2 ring-green-400",
},
expense: {
badge: "bg-red-50 text-red-700 border-red-200",
pill: "text-red-600",
button: "border-red-300 bg-red-50 text-red-700",
buttonSelected: "ring-2 ring-red-400",
},
};

export const DEFAULT_ACCOUNT_FORM: AccountFormData = {
code: "",
name: "",
type: "asset",
normalBalance: "Debit",
isActive: true,
};

export const CODE_REGEX = /^\d{3,6}$/;
