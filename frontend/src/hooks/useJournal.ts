import { useState, useEffect, useCallback, useRef } from "react";
import type {
  JournalEntry,
  Toast,
  CreateJournalPayload,
} from "../types/journal";
import { journalService } from "../services/JournalService";

// ✅ Fix 1: Ubah sorting ke ASCENDING (001 di atas)
function sortByEntryNumber(list: JournalEntry[]): JournalEntry[] {
  return [...list].sort((a, b) => {
    // Sort by entry number ascending: JE-202606-0001 → JE-202606-0002
    const numA = a.number ?? "";
    const numB = b.number ?? "";
    return numA.localeCompare(numB);
  });
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const addToast = useCallback(
    (msg: string, type: Toast["type"] = "success") => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev, { id, msg, type }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3500,
      );
    },
    [],
  );

  // ── Fetch all ──────────────────────────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await journalService.getAll();
      setEntries(sortByEntryNumber(data)); // ✅ pakai sort by number
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ── Create ─────────────────────────────────────────────────────────────────
  const createEntry = useCallback(
    async (payload: CreateJournalPayload): Promise<JournalEntry | null> => {
      setSaving(true);
      try {
        const created = await journalService.create(payload);

        // ✅ Fix 2: Langsung update state + return created
        setEntries((prev) => sortByEntryNumber([...prev, created]));

        addToast("Entry berhasil dibuat"); // ✅ tambah toast sukses
        return created; // ✅ FIX: jangan lupa return!
      } catch (e) {
        addToast(
          e instanceof Error ? e.message : "Gagal membuat entry",
          "error",
        );
        return null;
      } finally {
        setSaving(false);
      }
    },
    [addToast],
  );

  // ── Post ───────────────────────────────────────────────────────────────────
  const postEntry = useCallback(
    async (id: string): Promise<boolean> => {
      setPosting(true);
      try {
        const updated = await journalService.post(id);
        setEntries((prev) =>
          sortByEntryNumber(prev.map((e) => (e.id === id ? updated : e))),
        );
        addToast("Entry berhasil diposting ke buku besar");
        return true;
      } catch (e) {
        addToast(
          e instanceof Error ? e.message : "Gagal posting entry",
          "error",
        );
        return false;
      } finally {
        setPosting(false);
      }
    },
    [addToast],
  );

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteEntry = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await journalService.remove(id);
        setEntries((prev) => prev.filter((e) => e.id !== id));
        addToast("Draft berhasil dihapus");
        return true;
      } catch (e) {
        addToast(
          e instanceof Error ? e.message : "Gagal menghapus entry",
          "error",
        );
        return false;
      }
    },
    [addToast],
  );

  return {
    entries,
    loading,
    error,
    saving,
    posting,
    toasts,
    fetchEntries,
    createEntry,
    postEntry,
    deleteEntry,
  };
}
