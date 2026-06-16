import type { JournalEntry, CreateJournalPayload } from "../types/journal";
import { api } from "../lib/api";

function mapJournal(j: any): JournalEntry {
  return {
    id: j.id,
    number: j.entry_number,
    date: j.entry_date,
    description: j.description ?? "",
    status: j.status,
    createdAt: j.created_at,

    lines: (j.journal_entry_lines ?? []).map((line: any) => ({
      id: line.id,
      accountCode: line.accounts?.code ?? "",
      accountName: line.accounts?.name ?? "",
      description: line.memo ?? "",
      debit: Number(line.debit || 0),
      credit: Number(line.credit || 0),
    })),

    totalDebit:
      j.journal_entry_lines?.reduce(
        (sum: number, line: any) => sum + Number(line.debit || 0),
        0,
      ) ?? 0,

    totalCredit:
      j.journal_entry_lines?.reduce(
        (sum: number, line: any) => sum + Number(line.credit || 0),
        0,
      ) ?? 0,
  };
}

export const journalService = {
  getAll: async (): Promise<JournalEntry[]> => {
    const { data } = await api.get("/api/journal");
    return data.map(mapJournal);
  },

  getById: async (id: string): Promise<JournalEntry> => {
    // FIX: kurung pembuka api.get() sebelumnya hilang -> syntax/runtime error.
    const { data } = await api.get(`/api/journal/${id}`);
    return mapJournal(data);
  },

  create: async (payload: CreateJournalPayload): Promise<JournalEntry> => {
    if (!payload.lines || payload.lines.length < 2) {
      throw new Error("Minimum 2 journal lines required");
    }

    for (const line of payload.lines) {
      if (!line.accountCode) {
        throw new Error("accountCode is required in all journal lines");
      }
    }

    const { data } = await api.post("/api/journal", payload);

    // PENTING:
    // Response POST /api/journal TIDAK menyertakan relasi lengkap
    // (mis. journal_entry_lines) dan/atau memakai struktur yang berbeda
    // dengan response GET. Akibatnya bila langsung di-map akan menghasilkan
    // date "Invalid Date", lines kosong ("0 baris"), dan total "RpNaN".
    //
    // Solusi: ambil ulang data lengkap by id agar struktur identik dengan
    // getAll(). Inilah yang membuat tampilan benar tanpa perlu refresh manual.
    return journalService.getById(data.id);
  },

  post: async (id: string): Promise<JournalEntry> => {
    const { data } = await api.post(`/api/journal/${id}/post`);
    return mapJournal(data);
  },

  remove: async (id: string): Promise<void> => {
    // FIX: kurung pembuka api.delete() sebelumnya hilang -> syntax/runtime error.
    await api.delete(`/api/journal/${id}`);
  },
};
