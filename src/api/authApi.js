// src/api/authApi.js
import axiosInstance from "./axiosInstance";

// ── Token localStorage helpers ────────────────────────────
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem("arvana_token", accessToken);
  if (refreshToken) localStorage.setItem("arvana_refresh_token", refreshToken);
};

export const getToken = () => localStorage.getItem("arvana_token");

export const removeTokens = () => {
  localStorage.removeItem("arvana_token");
  localStorage.removeItem("arvana_refresh_token");
  localStorage.removeItem("arvana_user");
};

export const isAuthenticated = () => !!getToken();

// ── Login ─────────────────────────────────────────────────
// POST /auth/login  →  { data: { accessToken, refreshToken, expireDate } }
export const login = async ({ email, password }) => {
  const { data } = await axiosInstance.post("/auth/login", { email, password });
  const tokenData = data?.data ?? data;
  // Refresh tokeni saxla
  saveTokens(tokenData.accessToken, tokenData.refreshToken);
  return tokenData;
};

// ── Register ──────────────────────────────────────────────
// POST /auth/register  →  { data: { accessToken, refreshToken, expireDate } }
export const register = async ({ name, surname, email, password, phone }) => {
  const { data } = await axiosInstance.post("/auth/register", {
    name,
    surname,
    email,
    password,
    phone: phone || undefined,
  });
  const tokenData = data?.data ?? data;
  // Refresh tokeni saxla
  saveTokens(tokenData.accessToken, tokenData.refreshToken);
  return tokenData;
};

// ── Google OAuth ──────────────────────────────────────────
export const googleAuth = async (credential) => {
  const { data } = await axiosInstance.post("/auth/google", { idToken: credential });
  const tokenData = data?.data ?? data;
  saveTokens(tokenData.accessToken, tokenData.refreshToken);
  return tokenData;
};

// ── Refresh token ─────────────────────────────────────────
// POST /auth/refresh  →  { data: { accessToken, refreshToken, expireDate } }
export const refreshToken = async () => {
  const currentRefresh = localStorage.getItem("arvana_refresh_token");
  const currentAccess  = localStorage.getItem("arvana_token") || "";
  if (!currentRefresh) throw new Error("No refresh token");

  const { data } = await axiosInstance.post("/auth/refresh", {
    accessToken: currentAccess,
    refreshToken: currentRefresh,
  });
  const tokenData = data?.data ?? data;
  saveTokens(tokenData.accessToken, tokenData.refreshToken);
  return tokenData;
};

// ── Logout ────────────────────────────────────────────────
export const logout = async () => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch {
    // Backend 401 versə belə local tokenləri sil
  } finally {
    removeTokens();
  }
};

// ── Forgot Password ───────────────────────────────────────
export const forgotPassword = async (email) => {
  const { data } = await axiosInstance.post("/auth/forgot-password", { email });
  return data;
};

// ── Reset Password ────────────────────────────────────────
export const resetPassword = async ({ token, email, newPassword }) => {
  const { data } = await axiosInstance.post("/auth/reset-password", {
    token,
    email,
    newPassword,
  });
  return data;
};

// ── Get current user ──────────────────────────────────────
export const getMe = async () => {
  const { data } = await axiosInstance.get("/users/me");
  return data?.data ?? data;
};