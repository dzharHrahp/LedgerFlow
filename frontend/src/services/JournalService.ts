import type { JournalEntry, CreateJournalPayload } from "../types/journal";
import { api } from "../lib/api";

// Mapper: ubah bentuk data backend menjadi bentuk yang dipakai frontend
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

// Service jurnal: handle semua request frontend ke endpoint journal backend
export const journalService = {
  // Ambil semua jurnal
  getAll: async (): Promise<JournalEntry[]> => {
    const { data } = await api.get("/api/journal");
    return data.map(mapJournal);
  },

  // Ambil satu jurnal berdasarkan id
  getById: async (id: string): Promise<JournalEntry> => {
    const { data } = await api.get(`/api/journal/${id}`);
    return mapJournal(data);
  },

  // Buat jurnal baru dengan validasi dasar di frontend
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

    // Setelah create, ambil ulang detail lengkap jurnal agar struktur datanya sama seperti GET
    return journalService.getById(data.id);
  },

  // Posting jurnal draft menjadi posted
  post: async (id: string): Promise<JournalEntry> => {
    const { data } = await api.post(`/api/journal/${id}/post`);
    return mapJournal(data);
  },

  // Hapus jurnal
  remove: async (id: string): Promise<void> => {
    await api.delete(`/api/journal/${id}`);
  },
};
