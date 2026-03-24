// src/api/categoryApi.js
// ─────────────────────────────────────────────────────────────
// Kateqoriya API çağırışları.
//
// Backend endpoint nümunələri:
//   GET /furniture-categories            → bütün kateqoriyalar
//   GET /furniture-categories/:id        → tək kateqoriya
//   GET /furniture-categories/:id/products → məhsullar + filter
// ─────────────────────────────────────────────────────────────

import axiosInstance from "./axiosInstance";

const categoryApi = {
  // Bütün kateqoriyaları gətir (nav, footer üçün)
  getAll: () =>
    axiosInstance.get("/furniture-categories"),

  // Tək kateqoriya məlumatı (ad, şəkil, açıqlama)
  getById: (id) =>
    axiosInstance.get(`/furniture-categories/${id}`),

  // Kateqoriyaya aid məhsullar — filter + sort + pagination
  // params: { page, limit, price_min, price_max, colors, materials, sort }
  getProducts: (id, params = {}) =>
    axiosInstance.get(`/furniture-categories/${id}/products`, { params }),

  // Mövcud filter seçimlərini gətir (hansı rənglər, materiallar var)
  getFilters: (id) =>
    axiosInstance.get(`/furniture-categories/${id}/filters`),
};

export default categoryApi;
