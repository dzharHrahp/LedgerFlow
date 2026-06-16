// services/periodsService.ts
import { api } from "../lib/api";
import type { Period } from "../types/reports";

export const periodsService = {
  getAll: async (companyId: string): Promise<Period[]> => {
    const { data } = await api.get("api/periods", {
      params: { company_id: companyId },
    });
    return data;
  },

  open: async (companyId: string, year: number, month: number) => {
    const { data } = await api.post("api/periods", {
      company_id: companyId,
      year,
      month,
    });
    return data;
  },

  close: async (id: string) => {
    const { data } = await api.patch(`api/periods/${id}/close`);
    return data;
  },
};
