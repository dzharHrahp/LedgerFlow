// src/services/reportsService.ts (UPDATED — dengan getCashFlow)
import { api } from "../lib/api";
import type {
  IncomeStatementResponse,
  BalanceSheetResponse,
  CashFlowResponse,
  Period,
} from "../types/reports";

// Fungsi pembantu untuk ambil Company ID dari localStorage
const getCompanyId = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return "";
  try {
    const userObj = JSON.parse(userStr);
    return userObj.company_id || userObj.company?.id || "";
  } catch {
    return "";
  }
};

export const getIncomeStatement = async (
  periodId?: string,
): Promise<IncomeStatementResponse> => {
  const { data } = await api.get<IncomeStatementResponse>(
    "/api/reports/income-statement",
    {
      params: {
        period_id: periodId,
        company_id: getCompanyId(),
      },
    },
  );
  return data;
};

export const getBalanceSheet = async (
  periodId: string,
  companyId: string,
): Promise<BalanceSheetResponse> => {
  const { data } = await api.get<BalanceSheetResponse>(
    "/api/reports/balance-sheet",
    {
      params: {
        period_id: periodId,
        company_id: companyId,
      },
    },
  );
  return data;
};

// ✨ BARU: Cash Flow
export const getCashFlow = async (
  periodId?: string,
): Promise<CashFlowResponse> => {
  const { data } = await api.get<CashFlowResponse>("/api/reports/cash-flow", {
    params: {
      period_id: periodId,
      company_id: getCompanyId(),
    },
  });
  return data;
};

export const getPeriods = async (): Promise<Period[]> => {
  const userStr = localStorage.getItem("user");
  let companyId = "";
  if (userStr) {
    const userObj = JSON.parse(userStr);
    companyId = userObj.company_id || userObj.company?.id || "";
  }

  const { data } = await api.get("/api/reports/periods", {
    params: { company_id: companyId },
  });

  return Array.isArray(data) ? data : [];
};

export const reportsService = {
  getIncomeStatement,
  getBalanceSheet,
  getCashFlow,
  getPeriods,
};

export default reportsService;
