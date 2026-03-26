// src/api/authApi.js
// ─────────────────────────────────────────────────────────────
// Auth API – Login, Register, Google OAuth, Forgot/Reset Password
// Backend-ə uyğun endpoint-ləri dəyiş
// ─────────────────────────────────────────────────────────────

import axiosInstance from "./axiosInstance";

// ── Token idarəetməsi ─────────────────────────────────────────
export const setToken = (token) => {
  localStorage.setItem("arvana_token", token);
};

export const getToken = () => {
  return localStorage.getItem("arvana_token");
};

export const removeToken = () => {
  localStorage.removeItem("arvana_token");
  localStorage.removeItem("arvana_user");
};

export const setUser = (user) => {
  localStorage.setItem("arvana_user", JSON.stringify(user));
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("arvana_user"));
  } catch {
    return null;
  }
};

// ── Login ─────────────────────────────────────────────────────
// POST /auth/login
// Body: { email, password }
// Response: { token, user }
export const login = async ({ email, password }) => {
  const { data } = await axiosInstance.post("/auth/login", {
    email,
    password,
  });
  if (data.token) {
    setToken(data.token);
    setUser(data.user);
  }
  return data;
};

// ── Register ─────────────────────────────────────────────────
// POST /auth/register
// Body: { fullName, email, password, phone? }
// Response: { token, user }
export const register = async ({ fullName, email, password, phone }) => {
  const { data } = await axiosInstance.post("/auth/register", {
    fullName,
    email,
    password,
    phone: phone || undefined,
  });
  if (data.token) {
    setToken(data.token);
    setUser(data.user);
  }
  return data;
};

// ── Google OAuth ─────────────────────────────────────────────
// POST /auth/google
// Body: { credential } — Google ID token
// Response: { token, user }
export const googleAuth = async (credential) => {
  const { data } = await axiosInstance.post("/auth/google", { credential });
  if (data.token) {
    setToken(data.token);
    setUser(data.user);
  }
  return data;
};

// ── Forgot Password ───────────────────────────────────────────
// POST /auth/forgot-password
// Body: { email }
// Response: { message }
export const forgotPassword = async (email) => {
  const { data } = await axiosInstance.post("/auth/forgot-password", {
    email,
  });
  return data;
};

// ── Reset Password ────────────────────────────────────────────
// POST /auth/reset-password
// Body: { token, newPassword }
// Response: { message }
export const resetPassword = async ({ token, newPassword }) => {
  const { data } = await axiosInstance.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return data;
};

// ── Logout ────────────────────────────────────────────────────
export const logout = () => {
  removeToken();
  window.location.href = "/login";
};

// ── Auth yoxla ────────────────────────────────────────────────
export const isAuthenticated = () => {
  return !!getToken();
};
