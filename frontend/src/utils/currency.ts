// Helper format angka dan mata uang Rupiah

// Format number menjadi mata uang Rupiah, misalnya Rp99.000
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format angka biasa dengan pemisah ribuan
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

// Ambil nilai absolut lalu format sebagai Rupiah
export const formatAbsCurrency = (value: number): string => {
  return formatCurrency(Math.abs(value));
};
