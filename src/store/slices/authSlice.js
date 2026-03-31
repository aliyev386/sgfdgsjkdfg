import { createSlice } from "@reduxjs/toolkit";

const savedToken = localStorage.getItem("arvana_token");
const savedUser  = (() => {
  try { return JSON.parse(localStorage.getItem("arvana_user")); }
  catch { return null; }
})();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: savedToken || null,
    user:  savedUser  || null,
    isAuthenticated: !!savedToken,
  },
  reducers: {
    loginSuccess(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user  = user;
      state.isAuthenticated = true;
      localStorage.setItem("arvana_token", token);
      localStorage.setItem("arvana_user", JSON.stringify(user));
    },
    logoutAction(state) {
      state.token = null;
      state.user  = null;
      state.isAuthenticated = false;
      localStorage.removeItem("arvana_token");
      localStorage.removeItem("arvana_user");
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("arvana_user", JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, logoutAction, updateUser } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuth = (state) => state.auth.isAuthenticated;
export default authSlice.reducer;
