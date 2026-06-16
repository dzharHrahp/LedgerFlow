// ============================================================================
// LEDGERFLOW - Export PDF Utility
// ============================================================================
// Install dulu:
//   npm install jspdf jspdf-autotable
//   npm install -D @types/jspdf
//
// Usage:
//   import { exportIncomeStatementPDF, exportBalanceSheetPDF, exportCashFlowPDF } from "../utils/exportPDF";
//   exportIncomeStatementPDF(data, periodName);
// ============================================================================

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Format helpers ─────────────────────────────────────────────────
const formatRupiah = (val: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

const today = (): string =>
  new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// ─── Shared: Setup PDF document ─────────────────────────────────────
function createPDF(title: string, periodName: string): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");

  // Header gradient bar
  doc.setFillColor(37, 99, 235); // primary-600
  doc.rect(0, 0, 210, 28, "F");

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LedgerFlow", 14, 14);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Financial Platform", 14, 20);

  // Report title
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 40);

  // Period & date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Periode: ${periodName || "Semua Periode (YTD)"}`, 14, 48);
  doc.text(`Dicetak: ${today()}`, 14, 54);

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 58, 196, 58);

  return doc;
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT: Income Statement (Laba Rugi)
// ═══════════════════════════════════════════════════════════════════════
export function exportIncomeStatementPDF(
  data: {
    revenue: { accountCode: string; accountName: string; amount: number }[];
    expense: { accountCode: string; accountName: string; amount: number }[];
    totalRevenue: number;
    totalExpense: number;
    netIncome: number;
  },
  periodName: string,
) {
  const doc = createPDF("Laporan Laba Rugi", periodName);
  let startY = 64;

  // ── PENDAPATAN ──
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129); // emerald
  doc.text("PENDAPATAN (REVENUE)", 14, startY);
  startY += 4;

  if (data.revenue.length > 0) {
    autoTable(doc, {
      startY,
      head: [["Kode", "Nama Akun", "Jumlah"]],
      body: [
        ...data.revenue.map((item) => [
          item.accountCode,
          item.accountName,
          formatRupiah(item.amount),
        ]),
        [
          { content: "", styles: { fillColor: [236, 253, 245] } },
          {
            content: "Total Pendapatan",
            styles: { fontStyle: "bold", fillColor: [236, 253, 245] },
          },
          {
            content: formatRupiah(data.totalRevenue),
            styles: {
              fontStyle: "bold",
              fillColor: [236, 253, 245],
              halign: "right" as const,
            },
          },
        ],
      ],
      theme: "striped",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        2: { halign: "right" as const, cellWidth: 50 },
      },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Tidak ada transaksi pendapatan", 14, startY + 6);
    startY += 12;
  }

  // ── BEBAN ──
  startY = (doc as any).lastAutoTable?.finalY + 10 || startY + 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(239, 68, 68); // rose
  doc.text("BEBAN (EXPENSE)", 14, startY);
  startY += 4;

  if (data.expense.length > 0) {
    autoTable(doc, {
      startY,
      head: [["Kode", "Nama Akun", "Jumlah"]],
      body: [
        ...data.expense.map((item) => [
          item.accountCode,
          item.accountName,
          formatRupiah(item.amount),
        ]),
        [
          { content: "", styles: { fillColor: [254, 242, 242] } },
          {
            content: "Total Beban",
            styles: { fontStyle: "bold", fillColor: [254, 242, 242] },
          },
          {
            content: formatRupiah(data.totalExpense),
            styles: {
              fontStyle: "bold",
              fillColor: [254, 242, 242],
              halign: "right" as const,
            },
          },
        ],
      ],
      theme: "striped",
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        2: { halign: "right" as const, cellWidth: 50 },
      },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });
  }

  // ── NET INCOME ──
  startY = (doc as any).lastAutoTable?.finalY + 10 || startY + 10;

  const isProfit = data.netIncome >= 0;
  doc.setFillColor(
    isProfit ? 236 : 254,
    isProfit ? 253 : 242,
    isProfit ? 245 : 242,
  );
  doc.roundedRect(14, startY, 182, 16, 3, 3, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    isProfit ? 5 : 185,
    isProfit ? 150 : 28,
    isProfit ? 105 : 28,
  );
  doc.text(
    isProfit ? "Laba Bersih (Net Income)" : "Rugi Bersih (Net Loss)",
    20,
    startY + 10,
  );
  doc.text(formatRupiah(data.netIncome), 190, startY + 10, { align: "right" });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "Dokumen ini digenerate otomatis oleh LedgerFlow",
    14,
    pageHeight - 10,
  );
  doc.text(`Halaman 1`, 190, pageHeight - 10, { align: "right" });

  doc.save(`LedgerFlow_LabaRugi_${periodName || "YTD"}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT: Balance Sheet (Neraca)
// ═══════════════════════════════════════════════════════════════════════
export function exportBalanceSheetPDF(
  data: {
    assets: { accountCode: string; accountName: string; balance: number }[];
    liabilities: {
      accountCode: string;
      accountName: string;
      balance: number;
    }[];
    equity: { accountCode: string; accountName: string; balance: number }[];
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    is_balanced: boolean;
  },
  periodName: string,
) {
  const doc = createPDF("Neraca (Balance Sheet)", periodName);
  let startY = 64;

  // Helper to render a section
  const renderSection = (
    title: string,
    items: { accountCode: string; accountName: string; balance: number }[],
    total: number,
    color: [number, number, number],
    bgColor: [number, number, number],
  ) => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(title, 14, startY);
    startY += 4;

    if (items.length > 0) {
      autoTable(doc, {
        startY,
        head: [["Kode", "Nama Akun", "Saldo"]],
        body: [
          ...items.map((item) => [
            item.accountCode,
            item.accountName,
            formatRupiah(item.balance),
          ]),
          [
            { content: "", styles: { fillColor: bgColor } },
            {
              content: `Total ${title}`,
              styles: { fontStyle: "bold", fillColor: bgColor },
            },
            {
              content: formatRupiah(total),
              styles: {
                fontStyle: "bold",
                fillColor: bgColor,
                halign: "right" as const,
              },
            },
          ],
        ],
        theme: "striped",
        headStyles: { fillColor: color, textColor: 255, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 30 },
          2: { halign: "right" as const, cellWidth: 50 },
        },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 14, right: 14 },
      });
      startY = (doc as any).lastAutoTable?.finalY + 10 || startY + 10;
    } else {
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`Tidak ada data ${title.toLowerCase()}`, 14, startY + 6);
      startY += 14;
    }
  };

  renderSection(
    "ASET",
    data.assets,
    data.total_assets,
    [6, 182, 212],
    [236, 254, 255],
  );
  renderSection(
    "KEWAJIBAN",
    data.liabilities,
    data.total_liabilities,
    [245, 158, 11],
    [255, 251, 235],
  );
  renderSection(
    "EKUITAS",
    data.equity,
    data.total_equity,
    [168, 85, 247],
    [250, 245, 255],
  );

  // Balance status
  const balanced = data.is_balanced;
  doc.setFillColor(
    balanced ? 236 : 254,
    balanced ? 253 : 242,
    balanced ? 245 : 242,
  );
  doc.roundedRect(14, startY, 182, 14, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    balanced ? 5 : 185,
    balanced ? 150 : 28,
    balanced ? 105 : 28,
  );
  doc.text(
    balanced ? "✓ Neraca Seimbang (Balanced)" : "✗ Neraca Tidak Seimbang",
    20,
    startY + 9,
  );
  doc.text(
    `Aset: ${formatRupiah(data.total_assets)} = Kewajiban + Ekuitas: ${formatRupiah(data.total_liabilities + data.total_equity)}`,
    190,
    startY + 9,
    { align: "right" },
  );

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "Dokumen ini digenerate otomatis oleh LedgerFlow",
    14,
    pageHeight - 10,
  );

  doc.save(`LedgerFlow_Neraca_${periodName || "YTD"}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT: Chart of Accounts (COA)
// ═══════════════════════════════════════════════════════════════════════
export function exportChartOfAccountsPDF(
  accounts: { code: string; name: string; type: string; isActive: boolean }[],
) {
  const doc = createPDF("Chart of Accounts", "");
  let startY = 64;

  // Summary
  const total = accounts.length;
  const active = accounts.filter((a) => a.isActive).length;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Total: ${total} akun · Aktif: ${active} · Nonaktif: ${total - active}`,
    14,
    startY,
  );
  startY += 8;

  // Group by type
  const types = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];
  const typeLabels: Record<string, string> = {
    ASSET: "Aset",
    LIABILITY: "Kewajiban",
    EQUITY: "Ekuitas",
    REVENUE: "Pendapatan",
    EXPENSE: "Beban",
  };
  const typeColors: Record<string, [number, number, number]> = {
    ASSET: [6, 182, 212],
    LIABILITY: [245, 158, 11],
    EQUITY: [168, 85, 247],
    REVENUE: [16, 185, 129],
    EXPENSE: [239, 68, 68],
  };

  for (const type of types) {
    const typeAccounts = accounts.filter((a) => a.type.toUpperCase() === type);
    if (typeAccounts.length === 0) continue;

    const color = typeColors[type] || [100, 100, 100];

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(
      `${typeLabels[type] || type} (${typeAccounts.length})`,
      14,
      startY,
    );
    startY += 4;

    autoTable(doc, {
      startY,
      head: [["Kode", "Nama Akun", "Tipe", "Status"]],
      body: typeAccounts.map((a) => [
        a.code,
        a.name,
        typeLabels[a.type.toUpperCase()] || a.type,
        a.isActive ? "Aktif" : "Nonaktif",
      ]),
      theme: "striped",
      headStyles: { fillColor: color, textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
      },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });

    startY = (doc as any).lastAutoTable?.finalY + 8 || startY + 8;

    // Add page if running out of space
    if (startY > 260) {
      doc.addPage();
      startY = 20;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      "Dokumen ini digenerate otomatis oleh LedgerFlow",
      14,
      pageHeight - 10,
    );
    doc.text(`Halaman ${i} dari ${pageCount}`, 190, pageHeight - 10, {
      align: "right",
    });
  }

  doc.save("LedgerFlow_ChartOfAccounts.pdf");
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT: Chart of Accounts as CSV
// ═══════════════════════════════════════════════════════════════════════
export function exportChartOfAccountsCSV(
  accounts: {
    code: string;
    name: string;
    type: string;
    normalBalance?: string;
    isActive: boolean;
  }[],
) {
  const headers = ["Kode", "Nama Akun", "Tipe", "Normal Balance", "Status"];
  const rows = accounts.map((a) => [
    a.code,
    `"${a.name.replace(/"/g, '""')}"`,
    a.type,
    a.normalBalance || "",
    a.isActive ? "Active" : "Inactive",
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "LedgerFlow_ChartOfAccounts.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════════
// IMPORT: Parse CSV file for Chart of Accounts
// ═══════════════════════════════════════════════════════════════════════
export interface ImportedAccount {
  code: string;
  name: string;
  type: string;
  normalBalance: string;
}

export function parseAccountsCSV(csvText: string): {
  accounts: ImportedAccount[];
  errors: string[];
} {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return {
      accounts: [],
      errors: ["File CSV kosong atau hanya berisi header"],
    };
  }

  // Skip header
  const dataLines = lines.slice(1);
  const accounts: ImportedAccount[] = [];
  const errors: string[] = [];

  const validTypes = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];
  const validBalances = ["DEBIT", "CREDIT"];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    // Simple CSV parsing (handles quoted fields)
    const cols =
      line
        .match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        ?.map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"').trim()) || [];

    if (cols.length < 3) {
      errors.push(
        `Baris ${i + 2}: Kolom tidak lengkap (butuh minimal: Kode, Nama, Tipe)`,
      );
      continue;
    }

    const code = cols[0];
    const name = cols[1];
    const type = cols[2]?.toUpperCase();
    const normalBalance =
      cols[3]?.toUpperCase() ||
      (["ASSET", "EXPENSE"].includes(type) ? "DEBIT" : "CREDIT");

    if (!code || !name) {
      errors.push(`Baris ${i + 2}: Kode atau nama kosong`);
      continue;
    }

    if (!validTypes.includes(type)) {
      errors.push(
        `Baris ${i + 2}: Tipe "${cols[2]}" tidak valid (gunakan: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)`,
      );
      continue;
    }

    accounts.push({ code, name, type, normalBalance });
  }

  return { accounts, errors };
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT: Download CSV Template for Import
// ═══════════════════════════════════════════════════════════════════════
export function downloadImportTemplate() {
  const template = `Kode,Nama Akun,Tipe,Normal Balance
1000,Kas,ASSET,DEBIT
1100,Bank BCA,ASSET,DEBIT
1200,Piutang Usaha,ASSET,DEBIT
2000,Utang Usaha,LIABILITY,CREDIT
3000,Modal Pemilik,EQUITY,CREDIT
4000,Pendapatan Jasa,REVENUE,CREDIT
5000,Beban Gaji,EXPENSE,DEBIT
5100,Beban Sewa,EXPENSE,DEBIT`;

  const blob = new Blob(["\uFEFF" + template], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "LedgerFlow_Import_Template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT: Cash Flow (Arus Kas)
// ═══════════════════════════════════════════════════════════════════════
export function exportCashFlowPDF(
  data: {
    operating: {
      description: string;
      items: { label?: string; accountName?: string; amount: number }[];
      subtotal: number;
    };
    investing: {
      description: string;
      items: { label?: string; accountName?: string; amount: number }[];
      subtotal: number;
    };
    financing: {
      description: string;
      items: { label?: string; accountName?: string; amount: number }[];
      subtotal: number;
    };
    netCashFlow: number;
    beginningCash: number;
    endingCash: number;
  },
  periodName: string,
) {
  const doc = createPDF("Laporan Arus Kas", periodName);
  let startY = 64;

  const renderCashSection = (
    title: string,
    description: string,
    items: { label?: string; accountName?: string; amount: number }[],
    subtotal: number,
    color: [number, number, number],
  ) => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(title, 14, startY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(description, 14, startY + 5);
    startY += 9;

    const bodyRows = items.map((item) => [
      item.label || item.accountName || "-",
      formatRupiah(item.amount),
    ]);

    bodyRows.push([
      { content: `Subtotal ${title}`, styles: { fontStyle: "bold" } } as any,
      {
        content: formatRupiah(subtotal),
        styles: { fontStyle: "bold", halign: "right" as const },
      } as any,
    ]);

    autoTable(doc, {
      startY,
      head: [["Keterangan", "Jumlah"]],
      body: bodyRows,
      theme: "striped",
      headStyles: { fillColor: color, textColor: 255, fontStyle: "bold" },
      columnStyles: {
        1: { halign: "right" as const, cellWidth: 55 },
      },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });

    startY = (doc as any).lastAutoTable?.finalY + 8 || startY + 8;
  };

  renderCashSection(
    "OPERASI",
    data.operating.description,
    data.operating.items,
    data.operating.subtotal,
    [16, 185, 129],
  );
  renderCashSection(
    "INVESTASI",
    data.investing.description,
    data.investing.items,
    data.investing.subtotal,
    [59, 130, 246],
  );
  renderCashSection(
    "PENDANAAN",
    data.financing.description,
    data.financing.items,
    data.financing.subtotal,
    [168, 85, 247],
  );

  // Summary
  const summaryData = [
    ["Saldo Kas Awal", formatRupiah(data.beginningCash)],
    ["Perubahan Kas Bersih", formatRupiah(data.netCashFlow)],
    ["Saldo Kas Akhir", formatRupiah(data.endingCash)],
  ];

  autoTable(doc, {
    startY: startY + 2,
    body: summaryData,
    theme: "plain",
    styles: { fontSize: 11, fontStyle: "bold", cellPadding: 4 },
    columnStyles: {
      1: { halign: "right" as const },
    },
    margin: { left: 14, right: 14 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "Dokumen ini digenerate otomatis oleh LedgerFlow",
    14,
    pageHeight - 10,
  );

  doc.save(`LedgerFlow_ArusKas_${periodName || "YTD"}.pdf`);
}
