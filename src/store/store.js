import { configureStore } from "@reduxjs/toolkit";
import wishlistReducer from "./slices/wishlistStore";
import langReducer from "./slices/langSlice";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    lang: langReducer,
    cart: cartReducer,
    auth: authReducer,
  },
});
