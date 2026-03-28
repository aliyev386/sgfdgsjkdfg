import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: JSON.parse(localStorage.getItem("wishlist")) || [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist(state, action) {
      const product = action.payload;

      const exists = state.items.find(item => item.id === product.id);
      if (!exists) {
        state.items.push(product);
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      }
    },

    removeFromWishlist(state, action) {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      localStorage.setItem("wishlist", JSON.stringify(state.items));
    },

    toggleWishlist(state, action) {
      const product = action.payload;
      const exists = state.items.find(item => item.id === product.id);

      if (exists) {
        state.items = state.items.filter(item => item.id !== product.id);
      } else {
        state.items.push(product);
      }

      localStorage.setItem("wishlist", JSON.stringify(state.items));
    }
  },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;