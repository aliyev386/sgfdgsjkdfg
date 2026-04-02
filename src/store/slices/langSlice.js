import { createSlice } from "@reduxjs/toolkit";
import i18n from "../../i18n";

const savedLang = localStorage.getItem("amore_lang") || "az";

const langSlice = createSlice({
  name: "lang",
  initialState: { current: savedLang },
  reducers: {
    setLang(state, action) {
      const lng = action.payload;
      state.current = lng;
      localStorage.setItem("amore_lang", lng);
      i18n.changeLanguage(lng);
      document.documentElement.setAttribute("lang", lng);
    },
  },
});

export const { setLang } = langSlice.actions;
export const selectLang = (state) => state.lang.current;
export default langSlice.reducer;
