import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], itemCount: 0, grandTotal: 0, loading: false },
  reducers: {
    setCart(state, action) {
      const cart = action.payload;
      state.items      = cart?.items      ?? [];
      state.itemCount  = cart?.itemCount  ?? 0;
      state.grandTotal = cart?.grandTotal ?? 0;
    },
    setCartLoading(state, action) { state.loading = action.payload; },
    clearCart(state) { state.items = []; state.itemCount = 0; state.grandTotal = 0; },
  },
});

export const { setCart, setCartLoading, clearCart } = cartSlice.actions;
export const selectCart = (state) => state.cart;
export const selectCartCount = (state) => state.cart.itemCount;
export default cartSlice.reducer;
