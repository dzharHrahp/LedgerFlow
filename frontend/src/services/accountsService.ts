import type { Account, AccountFormData } from "../types/account";
import { api } from "../lib/api";

const API_BASE = "/api/accounts";

// Helper: ambil company_id dari localStorage
const getCompanyId = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return "";
  try {
    const userObj = JSON.parse(userStr);
    return userObj.company_id || "";
  } catch {
    return "";
  }
};

export const accountsService = {
  // GET ALL — kirim company_id sebagai query param
  getAll: async (): Promise<Account[]> => {
    const companyId = getCompanyId();
    const { data } = await api.get(API_BASE, {
      params: { company_id: companyId },
    });
    return Array.isArray(data) ? data : [];
  },

  // CREATE — kirim company_id di body
  create: async (formData: AccountFormData): Promise<Account> => {
    const companyId = getCompanyId();
    const { data } = await api.post(API_BASE, {
      code: formData.code,
      name: formData.name,
      type: formData.type,
      normal_balance: formData.normalBalance,
      is_active: formData.isActive,
      company_id: companyId,
    });
    return data;
  },

  // UPDATE — kirim semua field, termasuk is_active
  update: async (
    id: string,
    formData: Partial<AccountFormData>
  ): Promise<Account> => {
    const payload: Record<string, any> = {};
    if (formData.code !== undefined) payload.code = formData.code;
    if (formData.name !== undefined) payload.name = formData.name;
    if (formData.type !== undefined) payload.type = formData.type;
    if (formData.normalBalance !== undefined)
      payload.normal_balance = formData.normalBalance;
    if (formData.isActive !== undefined) payload.is_active = formData.isActive;

    const { data } = await api.put(`${API_BASE}/${id}`, payload);
    return data;
  },

  // DELETE
  remove: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`${API_BASE}/${id}`);
    return data;
  },
};
