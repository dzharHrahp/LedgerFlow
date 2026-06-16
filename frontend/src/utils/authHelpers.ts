export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Lemah", color: "#e24b4a" };
  if (score === 2) return { score, label: "Sedang", color: "#ef9f27" };
  if (score === 3) return { score, label: "Baik", color: "#639922" };
  return { score, label: "Kuat", color: "#1d9e75" };
}

export function validateRegisterForm(form: {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
}): {
  fullName?: string;
  email?: string;
  password?: string;
  companyName?: string;
} {
  const errors: {
    fullName?: string;
    email?: string;
    password?: string;
    companyName?: string;
  } = {};
  if (!form.fullName.trim()) errors.fullName = "Nama lengkap wajib diisi.";
  if (!form.email.trim()) {
    errors.email = "Email wajib diisi.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Format email tidak valid.";
  }
  if (!form.password) {
    errors.password = "Password wajib diisi.";
  } else if (form.password.length < 8) {
    errors.password = "Password minimal 8 karakter.";
  }
  if (!form.companyName.trim())
    errors.companyName = "Nama perusahaan wajib diisi.";
  return errors;
}
