// src/api/adminApi.js
// ─────────────────────────────────────────────────────────────
// Admin Panel üçün bütün API çağırışları.
//
// Hər section üçün ayrı endpoint qrupu:
//   Products, Categories, Collections, CollectionCategories,
//   Orders, HeroSections, Campaigns, DiscountCodes, Dashboard
//
// Bütün endpointlər Authorization: Bearer <token> tələb edir.
// axiosInstance bunu avtomatik əlavə edir.
//
// Backend URL: VITE_API_BASE_URL (default: http://localhost:5174/api)
// ─────────────────────────────────────────────────────────────

import axiosInstance from "./axiosInstance";

// ════════════════════════════════════════════════════════════
// 📊 DASHBOARD
// ════════════════════════════════════════════════════════════
export const dashboardApi = {
  // GET /admin/dashboard/stats
  // Response: { totalProducts, totalOrders, todayOrders, totalRevenue, outOfStock, totalCustomers }
  getStats: () =>
    axiosInstance.get("/admin/dashboard/stats").then((r) => r.data),

  // GET /admin/dashboard/top-products?limit=5
  // Response: [{ id, name, price, stock, category }]
  getTopProducts: (limit = 5) =>
    axiosInstance
      .get("/admin/dashboard/top-products", { params: { limit } })
      .then((r) => r.data),

  // GET /admin/dashboard/monthly-revenue?year=2024
  // Response: [{ month, revenue, orders }]
  getMonthlyRevenue: (year) =>
    axiosInstance
      .get("/admin/dashboard/monthly-revenue", { params: { year } })
      .then((r) => r.data),
};

// ════════════════════════════════════════════════════════════
// 📦 PRODUCTS
// ════════════════════════════════════════════════════════════
export const productApi = {
  // GET /admin/products?page=1&limit=10&search=&category=
  // Response: { data: [...], total, page, totalPages }
  getAll: (params = {}) =>
    axiosInstance.get("/admin/products", { params }).then((r) => r.data),

  // GET /admin/products/:id
  getById: (id) =>
    axiosInstance.get(`/admin/products/${id}`).then((r) => r.data),

  // POST /admin/products
  // Body: { name: {az, en, ru}, description: {az, en, ru}, price, stock, category_id, colors: [{hex, name}], images: [url] }
  // Validation: name.az, name.en, price > 0, stock >= 0, category_id required
  create: (data) =>
    axiosInstance.post("/admin/products", data).then((r) => r.data),

  // PUT /admin/products/:id
  update: (id, data) =>
    axiosInstance.put(`/admin/products/${id}`, data).then((r) => r.data),

  // DELETE /admin/products/:id  (soft delete)
  remove: (id) =>
    axiosInstance.delete(`/admin/products/${id}`).then((r) => r.data),

  // POST /admin/products/upload-image
  // Body: FormData { file }
  // Response: { url }
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance
      .post("/admin/products/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};

// ════════════════════════════════════════════════════════════
// 🏷️ CATEGORIES (Furniture Categories)
// ════════════════════════════════════════════════════════════
export const categoryApi = {
  // GET /admin/categories?page=1&limit=20
  getAll: (params = {}) =>
    axiosInstance.get("/admin/categories", { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`/admin/categories/${id}`).then((r) => r.data),

  // POST /admin/categories
  // Body: { name: {az, en, ru}, image?: url }
  // Validation: name.az, name.en required
  create: (data) =>
    axiosInstance.post("/admin/categories", data).then((r) => r.data),

  update: (id, data) =>
    axiosInstance.put(`/admin/categories/${id}`, data).then((r) => r.data),

  remove: (id) =>
    axiosInstance.delete(`/admin/categories/${id}`).then((r) => r.data),

  // POST /admin/categories/upload-image
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance
      .post("/admin/categories/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};

// ════════════════════════════════════════════════════════════
// 🗂️ COLLECTIONS
// ════════════════════════════════════════════════════════════
export const collectionApi = {
  // GET /admin/collections?page=1&limit=20
  getAll: (params = {}) =>
    axiosInstance.get("/admin/collections", { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`/admin/collections/${id}`).then((r) => r.data),

  // POST /admin/collections
  // Body: { name: {az, en, ru}, description: {az, en, ru}, price, product_ids: [id,...] }
  // Validation: name.az, name.en, price > 0 required
  create: (data) =>
    axiosInstance.post("/admin/collections", data).then((r) => r.data),

  update: (id, data) =>
    axiosInstance.put(`/admin/collections/${id}`, data).then((r) => r.data),

  remove: (id) =>
    axiosInstance.delete(`/admin/collections/${id}`).then((r) => r.data),
};

// ════════════════════════════════════════════════════════════
// 🗂️ COLLECTION CATEGORIES
// ════════════════════════════════════════════════════════════
export const collectionCategoryApi = {
  // GET /admin/collection-categories
  getAll: (params = {}) =>
    axiosInstance
      .get("/admin/collection-categories", { params })
      .then((r) => r.data),

  getById: (id) =>
    axiosInstance
      .get(`/admin/collection-categories/${id}`)
      .then((r) => r.data),

  // POST /admin/collection-categories
  // Body: { name: {az, en, ru}, image?: url }
  create: (data) =>
    axiosInstance
      .post("/admin/collection-categories", data)
      .then((r) => r.data),

  update: (id, data) =>
    axiosInstance
      .put(`/admin/collection-categories/${id}`, data)
      .then((r) => r.data),

  remove: (id) =>
    axiosInstance
      .delete(`/admin/collection-categories/${id}`)
      .then((r) => r.data),

  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance
      .post("/admin/collection-categories/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};

// ════════════════════════════════════════════════════════════
// 🛍️ ORDERS
// ════════════════════════════════════════════════════════════
export const orderApi = {
  // GET /admin/orders?page=1&limit=10&status=&search=
  // Response: { data: [...], total, page, totalPages }
  getAll: (params = {}) =>
    axiosInstance.get("/admin/orders", { params }).then((r) => r.data),

  // GET /admin/orders/:id
  // Response: { id, user, total, status, date, address, products: [{name, qty, price}] }
  getById: (id) =>
    axiosInstance.get(`/admin/orders/${id}`).then((r) => r.data),

  // PATCH /admin/orders/:id/status
  // Body: { status: "pending" | "confirmed" | "shipped" | "delivered" }
  updateStatus: (id, status) =>
    axiosInstance
      .patch(`/admin/orders/${id}/status`, { status })
      .then((r) => r.data),
};

// ════════════════════════════════════════════════════════════
// 🖼️ HERO SECTIONS
// ════════════════════════════════════════════════════════════
export const heroApi = {
  // GET /admin/hero-sections
  getAll: (params = {}) =>
    axiosInstance.get("/admin/hero-sections", { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`/admin/hero-sections/${id}`).then((r) => r.data),

  // POST /admin/hero-sections
  // Body: { title: {az,en,ru}, subtitle: {az,en,ru}, image?: url, active: bool }
  // Validation: title.az, title.en required
  create: (data) =>
    axiosInstance.post("/admin/hero-sections", data).then((r) => r.data),

  update: (id, data) =>
    axiosInstance.put(`/admin/hero-sections/${id}`, data).then((r) => r.data),

  remove: (id) =>
    axiosInstance.delete(`/admin/hero-sections/${id}`).then((r) => r.data),

  // PATCH /admin/hero-sections/:id/toggle
  // Response: { id, active }
  toggle: (id) =>
    axiosInstance
      .patch(`/admin/hero-sections/${id}/toggle`)
      .then((r) => r.data),

  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance
      .post("/admin/hero-sections/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};

// ════════════════════════════════════════════════════════════
// 📣 CAMPAIGNS
// ════════════════════════════════════════════════════════════
export const campaignApi = {
  // GET /admin/campaigns
  getAll: (params = {}) =>
    axiosInstance.get("/admin/campaigns", { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`/admin/campaigns/${id}`).then((r) => r.data),

  // POST /admin/campaigns
  // Body: { name: {az,en,ru}, discount: number(1-100), startDate, endDate, active: bool }
  // Validation: name.az, name.en, discount 1-100, startDate <= endDate required
  create: (data) =>
    axiosInstance.post("/admin/campaigns", data).then((r) => r.data),

  update: (id, data) =>
    axiosInstance.put(`/admin/campaigns/${id}`, data).then((r) => r.data),

  remove: (id) =>
    axiosInstance.delete(`/admin/campaigns/${id}`).then((r) => r.data),

  // PATCH /admin/campaigns/:id/toggle
  toggle: (id) =>
    axiosInstance.patch(`/admin/campaigns/${id}/toggle`).then((r) => r.data),
};

// ════════════════════════════════════════════════════════════
// 🎟️ DISCOUNT CODES
// ════════════════════════════════════════════════════════════
export const discountCodeApi = {
  // GET /admin/discount-codes
  getAll: (params = {}) =>
    axiosInstance
      .get("/admin/discount-codes", { params })
      .then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`/admin/discount-codes/${id}`).then((r) => r.data),

  // POST /admin/discount-codes
  // Body: { code: string(uppercase), type: "percent"|"fixed", value: number, limit: number, expiration: date, active: bool }
  // Validation: code required & unique, type required, value > 0, limit >= 0, expiration required
  create: (data) =>
    axiosInstance.post("/admin/discount-codes", data).then((r) => r.data),

  update: (id, data) =>
    axiosInstance
      .put(`/admin/discount-codes/${id}`, data)
      .then((r) => r.data),

  remove: (id) =>
    axiosInstance.delete(`/admin/discount-codes/${id}`).then((r) => r.data),

  // PATCH /admin/discount-codes/:id/toggle
  toggle: (id) =>
    axiosInstance
      .patch(`/admin/discount-codes/${id}/toggle`)
      .then((r) => r.data),
};