// src/store/slices/wishlistStore.js
// Wishlist həm localStorage-da (offline), həm də backend-də saxlanılır.
// İstifadəçi login olanda backend-dən sync edilir.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wishlistApi from "../../api/wishlistApi";

// ── Async thunk-lar ──────────────────────────────────────────
export const syncWishlistFromBackend = createAsyncThunk(
  "wishlist/syncFromBackend",
  async (_, { rejectWithValue }) => {
    try {
      const data = await wishlistApi.get();
      return data?.items ?? [];
    } catch {
      return rejectWithValue([]);
    }
  }
);

export const addToWishlistAsync = createAsyncThunk(
  "wishlist/addAsync",
  async ({ product, productId, collectionId }, { rejectWithValue }) => {
    try {
      await wishlistApi.addItem({ productId, collectionId });
      return product;
    } catch (err) {
      return rejectWithValue(err?.userMessage || "Xeta bas verdi");
    }
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  "wishlist/removeAsync",
  async ({ id, wishlistItemId }, { rejectWithValue }) => {
    try {
      if (wishlistItemId) await wishlistApi.removeItem(wishlistItemId);
      return id;
    } catch (err) {
      return rejectWithValue(err?.userMessage || "Xeta bas verdi");
    }
  }
);

// ── localStorage helpers ──────────────────────────────────────
const loadLocal = () => {
  try { return JSON.parse(localStorage.getItem("wishlist")) || []; }
  catch { return []; }
};
const saveLocal = (items) => {
  try { localStorage.setItem("wishlist", JSON.stringify(items)); }
  catch {}
};

// ── Slice ─────────────────────────────────────────────────────
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: loadLocal(),
    synced: false,
  },
  reducers: {
    toggleWishlist(state, action) {
      const product = action.payload;
      const idx = state.items.findIndex(i => i.id === product.id);
      if (idx >= 0) { state.items.splice(idx, 1); }
      else { state.items.push(product); }
      saveLocal(state.items);
    },
    addToWishlist(state, action) {
      const product = action.payload;
      if (!state.items.find(i => i.id === product.id)) {
        state.items.push(product);
        saveLocal(state.items);
      }
    },
    removeFromWishlist(state, action) {
      state.items = state.items.filter(i => i.id !== action.payload);
      saveLocal(state.items);
    },
    clearWishlist(state) {
      state.items = [];
      state.synced = false;
      saveLocal([]);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(syncWishlistFromBackend.fulfilled, (state, action) => {
      const backendItems = action.payload;
      state.items = backendItems.map(item => ({
        id:             item.productId    ?? ("coll_" + item.collectionId),
        wishlistItemId: item.id,
        productId:      item.productId,
        collectionId:   item.collectionId,
        name:           item.productName  ?? item.collectionName ?? "",
        price:          item.productPrice ?? item.collectionPrice ?? 0,
        image:          item.productImage ?? item.collectionImage ?? null,
      }));
      state.synced = true;
      saveLocal(state.items);
    });
    builder.addCase(addToWishlistAsync.fulfilled, (state, action) => {
      const product = action.payload;
      if (product && !state.items.find(i => i.id === product.id)) {
        state.items.push(product);
        saveLocal(state.items);
      }
    });
    builder.addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      saveLocal(state.items);
    });
  },
});

export const { toggleWishlist, addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export const selectWishlist      = (s) => s.wishlist.items;
export const selectWishlistCount = (s) => s.wishlist.items.length;
export const selectIsWishlisted  = (id) => (s) => s.wishlist.items.some(i => i.id === id);
export default wishlistSlice.reducer;
