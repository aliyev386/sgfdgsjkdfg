import axios from "axios";
import i18n from "../i18n";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5147/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Yardımçı funksiyalar ───────────────────────────────────
const getAccessToken  = () => localStorage.getItem("amore_token");
const getRefreshToken = () => localStorage.getItem("amore_refresh_token");
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem("amore_token", accessToken);
  if (refreshToken) localStorage.setItem("amore_refresh_token", refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem("amore_token");
  localStorage.removeItem("amore_refresh_token");
  localStorage.removeItem("amore_user");
};

// Eyni anda bir neçə sorğunun refresh etməsinin qarşısını almaq üçün
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ── Request interceptor ───────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const lang = localStorage.getItem("amore_lang") || i18n.language || "az";
    config.headers["Accept-Language"] = lang;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — refresh token məntiqi ──────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Auth endpointlərinin özü 401 qaytararsa (məs. yanlış şifrə),
      // refresh cəhdi etmə — sonsuz loop/page reload yaradır
      const isAuthEndpoint = originalRequest.url?.includes("/auth/");
      if (isAuthEndpoint) {
        return Promise.reject(formatError(error));
      }

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        window.location.href = "/login";
        return Promise.reject(formatError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentAccess = getAccessToken() || "";
        const { data } = await axios.post(
          (import.meta.env.VITE_API_BASE_URL || "http://localhost:5147/api") + "/auth/refresh",
          { accessToken: currentAccess, refreshToken: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": localStorage.getItem("amore_lang") || "az",
            },
          }
        );

        const tokenData = data?.data ?? data;
        const newAccess  = tokenData.accessToken;
        const newRefresh = tokenData.refreshToken;

        setTokens(newAccess, newRefresh);
        window.dispatchEvent(
          new CustomEvent("auth:token_refreshed", { detail: { accessToken: newAccess } })
        );

        processQueue(null, newAccess);
        originalRequest.headers.Authorization = "Bearer " + newAccess;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        window.location.href = "/login";
        return Promise.reject(formatError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(formatError(error));
  }
);

function formatError(error) {
  const apiData = error.response?.data;
  const userMessage =
    apiData?.message ||
    error.response?.data?.detail ||
    error.message ||
    "Naməlum xəta baş verdi.";
  const validationErrors = apiData?.errors || null;
  return { ...error, userMessage, validationErrors };
}

export default axiosInstance;