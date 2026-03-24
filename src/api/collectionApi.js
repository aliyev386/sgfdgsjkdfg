// src/api/collectionApi.js
// ─────────────────────────────────────────────────────────────
// Kolleksiya API çağırışları.
//
// Backend endpoint nümunələri:
//   GET /collections                   → bütün kolleksiyalar
//   GET /collections/featured          → öne çıxanlar (homepage)
//   GET /collections/:id               → tək kolleksiya + məhsullar
// ─────────────────────────────────────────────────────────────

import axiosInstance from "./axiosInstance";

const collectionApi = {
  getAll: () =>
    axiosInstance.get("/collections"),

  getFeatured: (params = {}) =>
    axiosInstance.get("/collections/featured", { params }),

  getById: (id) =>
    axiosInstance.get(`/collections/${id}`),

  // Kolleksiyaya aid məhsullar (ayrı endpoint varsa)
  getProducts: (id, params = {}) =>
    axiosInstance.get(`/collections/${id}/products`, { params }),
};

export default collectionApi;
