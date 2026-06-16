import { useState, useMemo, useEffect } from "react";

/**
 * usePagination — utilitas paginasi sederhana.
 * Default 5 item per halaman, dengan tombol next/prev untuk
 * menggeser ke data selanjutnya.
 */
export function usePagination<T>(items: T[], pageSize = 5) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Pastikan halaman tetap valid saat data berubah (misal setelah filter)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const startIndex = items.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, items.length);

  return {
    page,
    setPage,
    totalPages,
    pageItems,
    pageSize,
    totalItems: items.length,
    startIndex,
    endIndex,
    canPrev: page > 1,
    canNext: page < totalPages,
    next: () => setPage((p) => Math.min(totalPages, p + 1)),
    prev: () => setPage((p) => Math.max(1, p - 1)),
    goTo: (p: number) => setPage(Math.min(totalPages, Math.max(1, p))),
  };
}
