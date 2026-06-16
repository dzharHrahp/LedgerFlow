import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Tambah x-user-id dari localStorage untuk payment routes
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.id) {
        config.headers["x-user-id"] = user.id;
      }
      if (user.company_id) {
        config.headers["x-company-id"] = user.company_id;
      }
    } catch {}
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Jangan redirect ke login untuk payment routes yang memang bisa 401
    // (misal user belum login tapi buka pricing page)
    const url = err.config?.url || "";
    const isPaymentRoute = url.includes("/api/payments/");

    if (err.response?.status === 401 && !isPaymentRoute) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
