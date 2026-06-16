import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * HoverDropdown — dropdown halus yang muncul saat kursor mendekat (hover).
 *
 * Versi ini TIDAK memakai createPortal / react-dom agar menghindari
 * kemungkinan duplikasi instance React (penyebab error
 * "Cannot read properties of null (reading 'useState')").
 *
 * Dropdown dirender inline (absolute) di dalam parent. Agar tidak terpotong
 * oleh container ber-overflow, parent dibuat `relative` dan panel diberi
 * z-index tinggi. Untuk kasus di dalam tabel/area overflow, pastikan
 * wrapper filter tidak memakai `overflow-hidden`.
 */

export interface DropdownOption {
  value: string;
  label: string;
}

interface HoverDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  /** Optional custom renderer untuk label tombol */
  labelRenderer?: (value: string) => string;
  icon?: ReactNode;
  placeholder?: string;
  /** Lebar minimum dropdown panel */
  minWidth?: number;
  /** Apakah tombol mengisi penuh lebar parent (mobile-friendly) */
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  /** Posisi panel: buka ke bawah (default) atau ke atas */
  placement?: "bottom" | "top";
  /** Ratakan panel ke kanan tombol */
  alignRight?: boolean;
}

export function HoverDropdown({
  value,
  onChange,
  options,
  labelRenderer,
  icon,
  placeholder = "Pilih",
  minWidth = 180,
  fullWidth = false,
  disabled = false,
  className = "",
  placement = "bottom",
  alignRight = false,
}: HoverDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const getLabel = () => {
    if (labelRenderer) return labelRenderer(value);
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : placeholder;
  };

  const open = () => {
    if (disabled) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsOpen(true);
  };

  const scheduleClose = () => {
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  // Close ketika klik di luar (perangkat tanpa hover / mobile)
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Bersihkan timeout saat unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? "w-full" : "inline-block"} ${className}`}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        className={`flex items-center justify-between gap-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-darkCard hover:bg-gray-50 dark:hover:bg-white/5 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          fullWidth ? "w-full" : ""
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          <span className="text-gray-700 dark:text-gray-200 truncate">
            {getLabel()}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: placement === "top" ? 8 : -8,
              scale: 0.96,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === "top" ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{ minWidth }}
            className={`absolute z-[9999] max-h-72 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg ${
              placement === "top" ? "bottom-full mb-1" : "top-full mt-1"
            } ${alignRight ? "right-0" : "left-0"} ${fullWidth ? "w-full" : ""}`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                  value === option.value
                    ? "text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10 font-medium"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HoverDropdown;
