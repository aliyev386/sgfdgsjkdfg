// src/api/cartApi.js
// ─────────────────────────────────────────────────────────────
// Səbət API çağırışları.
// Token lazımdır — ProtectedRoute ilə qorunmalıdır.
// ─────────────────────────────────────────────────────────────

import axiosInstance from "./axiosInstance";

const cartApi = {
  // Cari istifadəçinin səbətini gətir
  get: () =>
    axiosInstance.get("/cart"),

  // Məhsul əlavə et
  // body: { product_id, quantity }
  addItem: (productId, quantity = 1) =>
    axiosInstance.post("/cart/items", { product_id: productId, quantity }),

  // Kəmiyyəti yenilə
  // body: { quantity }
  updateItem: (itemId, quantity) =>
    axiosInstance.patch(`/cart/items/${itemId}`, { quantity }),

  // Məhsulu sil
  removeItem: (itemId) =>
    axiosInstance.delete(`/cart/items/${itemId}`),

  // Səbəti tamamilə təmizlə
  clear: () =>
    axiosInstance.delete("/cart"),
};

export default cartApi;
