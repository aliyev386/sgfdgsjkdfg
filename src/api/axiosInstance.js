// src/api/axiosInstance.js
// ─────────────────────────────────────────────────────────────
// Base Axios instance.
// .env faylında tənzimlə:
//   VITE_API_BASE_URL=https://api.yourbackend.com/api
//
// Avtomatik olaraq:
//   - Authorization header-i əlavə edir (localStorage-dan token)
//   - 401 gəldikdə token silir və login-ə yönləndirir
//   - Şəbəkə xətalarını standart formata çevirir
// ─────────────────────────────────────────────────────────────

import axios from "axios";


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// ── Request interceptor — token əlavə et ──────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("arvana_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — xəta handling ─────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 — token keçərsizdir, çıxış et
    if (error.response?.status === 401) {
      localStorage.removeItem("arvana_token");
      window.location.href = "/login";
    }

    // Standart xəta mesajı
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      "Naməlum xəta baş verdi.";

    return Promise.reject({ ...error, userMessage: message });
  }
);

export default axiosInstance;
