import axios from "axios";
import i18n from "../i18n";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5147/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// ── Request interceptor — token + dil header-i ────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("arvana_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Backend Accept-Language header-i oxuyur: az, en, ru
    const lang = localStorage.getItem("arvana_lang") || i18n.language || "az";
    config.headers["Accept-Language"] = lang;

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("arvana_token");
      localStorage.removeItem("arvana_user");
      window.location.href = "/login";
    }

    // Backend-in qaytardığı validation xətaları (422)
    // { success: false, message: "...", errors: { "fieldName": ["msg1"] } }
    const apiData = error.response?.data;
    const userMessage =
      apiData?.message ||
      error.response?.data?.detail ||
      error.message ||
      "Naməlum xəta baş verdi.";

    const validationErrors = apiData?.errors || null;

    return Promise.reject({ ...error, userMessage, validationErrors });
  }
);

export default axiosInstance;
