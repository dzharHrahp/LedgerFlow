import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "../components/AppShell";
import {
  HelpCircle,
  ChevronDown,
  Mail,
  MessageCircle,
  Send,
  CheckCircle2,
  Phone,
  Clock,
  ExternalLink,
} from "lucide-react";

// ── Animation Variants ──────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ── Animated Title Letter Variants ───────────────────────────────────
const letterContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.3 },
  },
};
const letterVariants = {
  hidden: { y: 40, opacity: 0, rotateX: -90 },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 18,
    },
  },
};

// ── FAQ Data ────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Bagaimana cara menambahkan akun baru di Chart of Accounts?",
    a: 'Buka menu Chart of Accounts → klik tombol "Add Account" → isi kode akun, nama, tipe, dan saldo normal → klik Simpan. Akun baru akan langsung muncul di daftar.',
  },
  {
    q: "Apa perbedaan akun Aktif dan Non-Aktif?",
    a: "Akun Aktif bisa dipakai untuk transaksi jurnal. Akun Non-Aktif tidak akan muncul di pilihan akun saat membuat jurnal, tapi datanya tetap tersimpan dan bisa diaktifkan kembali kapan saja.",
  },
  {
    q: "Bagaimana cara membuat Jurnal Entry?",
    a: 'Buka Journal Entries → klik "New Entry" → pilih periode → tambahkan baris debit & kredit → pastikan total debit = kredit → klik Simpan. Sistem otomatis memvalidasi keseimbangan.',
  },
  {
    q: "Apa itu Buku Besar (General Ledger)?",
    a: "Buku Besar menampilkan semua transaksi per akun beserta saldo berjalan (running balance). Berguna untuk melacak arus kas dan memverifikasi keakuratan pencatatan.",
  },
  {
    q: "Bagaimana cara membuka/menutup periode akuntansi?",
    a: "Buka Period Management → pilih periode yang diinginkan → klik tombol Open/Close. Periode yang sudah ditutup tidak bisa di-edit lagi untuk menjaga integritas data.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Ya! Data Anda disimpan di Supabase dengan enkripsi end-to-end, backup otomatis, dan akses terbatas hanya untuk user di perusahaan Anda.",
  },
  {
    q: "Bagaimana cara mengganti tema ke Dark Mode?",
    a: "Klik ikon tema di header (☀️/🌙) atau buka Settings → Theme → pilih Dark. Anda juga bisa memilih System untuk mengikuti pengaturan device Anda.",
  },
];

// ── FAQ Accordion Item ──────────────────────────────────────────────
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-darkCard overflow-hidden transition-colors hover:border-primary-300 dark:hover:border-primary-500/30"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {q}
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={16} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pl-15 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3 ml-10">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────
export default function HelpCenterPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;

    setSending(true);
    // Simulate sending (no real backend for this yet)
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    }, 1200);
  };

  return (
    <AppShell>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25"
          >
            <HelpCircle className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            variants={letterContainerVariants}
            initial="hidden"
            animate="visible"
            className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center justify-center flex-wrap"
            style={{ perspective: "600px" }}
          >
            {"Help & Center".split("").map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                className="inline-block"
                style={{ transformOrigin: "bottom center" }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
            Temukan jawaban untuk pertanyaan umum atau hubungi kami untuk
            bantuan
          </p>
        </motion.div>

        {/* ── Quick Contact Cards ─────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              icon: Mail,
              label: "Email",
              value: "support@ledgerflow.id",
              color: "primary",
              href: "mailto:support@ledgerflow.id",
            },
            {
              icon: MessageCircle,
              label: "WhatsApp",
              value: "+62 812-3456-7890",
              color: "emerald",
              href: "https://wa.me/6281234567890",
            },
            {
              icon: Clock,
              label: "Jam Operasional",
              value: "Sen–Jum, 09:00–17:00",
              color: "amber",
              href: null,
            },
          ].map((card) => (
            <motion.div
              key={card.label}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="group rounded-2xl bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-md p-5 transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    card.color === "primary"
                      ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400"
                      : card.color === "emerald"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  <card.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {card.label}
                  </p>
                  {card.href ? (
                    <a
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-gray-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors flex items-center gap-1 mt-0.5"
                    >
                      {card.value}
                      <ExternalLink size={12} className="opacity-50" />
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 dark:text-white mt-0.5">
                      {card.value}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── FAQ Section ─────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <HelpCircle size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Pertanyaan yang Sering Ditanyakan
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </motion.div>

        {/* ── Contact Form ────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700/50 shadow-md p-6 lg:p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <Send size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Hubungi Kami
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pesan Terkirim!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Terima kasih, tim kami akan segera menghubungi Anda
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Nama
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Nama Anda"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="email@anda.com"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Pesan
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    rows={4}
                    placeholder="Tuliskan pertanyaan atau masalah Anda..."
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkBg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={sending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-md hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
                  >
                    <Send
                      size={16}
                      className={sending ? "animate-pulse" : ""}
                    />
                    {sending ? "Mengirim..." : "Kirim Pesan"}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
