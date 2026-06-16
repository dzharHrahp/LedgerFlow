/**
 * Format number to Indonesian Rupiah currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format number with thousand separator
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Get absolute value and format as currency
 */
export const formatAbsCurrency = (value: number): string => {
  return formatCurrency(Math.abs(value));
};
