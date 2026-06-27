import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper untuk menggabungkan className Tailwind secara aman
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
