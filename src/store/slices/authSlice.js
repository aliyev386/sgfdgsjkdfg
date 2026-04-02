import { createSlice } from "@reduxjs/toolkit";

const savedToken = localStorage.getItem("amore_token");
const savedUser  = (() => {
  try { return JSON.parse(localStorage.getItem("amore_user")); }
  catch { return null; }
})();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token:           savedToken || null,
    refreshToken:    localStorage.getItem("amore_refresh_token") || null,
    user:            savedUser  || null,
    isAuthenticated: !!savedToken,
  },
  reducers: {
    loginSuccess(state, action) {
      const { token, refreshToken, user } = action.payload;
      state.token           = token;
      state.refreshToken    = refreshToken || state.refreshToken;
      state.user            = user;
      state.isAuthenticated = true;
      localStorage.setItem("amore_token", token);
      if (refreshToken) localStorage.setItem("amore_refresh_token", refreshToken);
      if (user) localStorage.setItem("amore_user", JSON.stringify(user));
    },
    tokenRefreshed(state, action) {
      // axiosInstance refresh etdikdə store-u da yenilə
      const { accessToken, refreshToken } = action.payload;
      state.token = accessToken;
      if (refreshToken) state.refreshToken = refreshToken;
      localStorage.setItem("amore_token", accessToken);
      if (refreshToken) localStorage.setItem("amore_refresh_token", refreshToken);
    },
    logoutAction(state) {
      state.token           = null;
      state.refreshToken    = null;
      state.user            = null;
      state.isAuthenticated = false;
      localStorage.removeItem("amore_token");
      localStorage.removeItem("amore_refresh_token");
      localStorage.removeItem("amore_user");
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("amore_user", JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, tokenRefreshed, logoutAction, updateUser } = authSlice.actions;
export const selectAuth    = (state) => state.auth;
export const selectUser    = (state) => state.auth.user;
export const selectIsAuth  = (state) => state.auth.isAuthenticated;
export const selectToken   = (state) => state.auth.token;
export default authSlice.reducer;