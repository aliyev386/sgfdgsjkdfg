// src/api/authApi.js
// Backend DTO-larına uyğun: Name, Surname, Email, Password, Phone
import axiosInstance from "./axiosInstance";

// ── Login ─────────────────────────────────────────────────────
// POST /auth/login  →  { data: { accessToken, refreshToken, expireDate } }
export const login = async ({ email, password }) => {
  const { data } = await axiosInstance.post("/auth/login", { email, password });
  return data?.data ?? data;
};

// ── Register ──────────────────────────────────────────────────
// POST /auth/register  →  { data: { accessToken, refreshToken, expireDate } }
export const register = async ({ name, surname, email, password, phone }) => {
  const { data } = await axiosInstance.post("/auth/register", {
    name,
    surname,
    email,
    password,
    phone: phone || undefined,
  });
  return data?.data ?? data;
};

// ── Google OAuth ──────────────────────────────────────────────
export const googleAuth = async (credential) => {
  const { data } = await axiosInstance.post("/auth/google", { idToken: credential });
  return data?.data ?? data;
};

// ── Forgot Password ───────────────────────────────────────────
export const forgotPassword = async (email) => {
  const { data } = await axiosInstance.post("/auth/forgot-password", { email });
  return data;
};

// ── Reset Password ────────────────────────────────────────────
export const resetPassword = async ({ token, newPassword }) => {
  const { data } = await axiosInstance.post("/auth/reset-password", { token, newPassword });
  return data;
};

// ── Get current user ──────────────────────────────────────────
export const getMe = async () => {
  const { data } = await axiosInstance.get("/users/me");
  return data?.data ?? data;
};

// ── Token helpers ─────────────────────────────────────────────
export const getToken = () => localStorage.getItem("arvana_token");
export const removeToken = () => {
  localStorage.removeItem("arvana_token");
  localStorage.removeItem("arvana_user");
};
export const isAuthenticated = () => !!getToken();
