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
// Helper to extract data array from ApiResponse wrapper
const unwrapList = (r) => {
  const d = r.data;
  if (Array.isArray(d)) return { data: d, total: d.length };
  if (d?.data) return { data: Array.isArray(d.data) ? d.data : [], total: d.pagination?.totalCount ?? 0 };
  return { data: [], total: 0 };
};
const unwrap = (r) => r.data?.data ?? r.data;

export const productApi = {
  // GET /products?page=1&pageSize=10
  getAll: (params = {}) =>
    axiosInstance.get("/products", { params: { page: params.page||1, pageSize: params.limit||params.pageSize||10, ...params } })
      .then(unwrapList),

  getById: (id) =>
    axiosInstance.get(`/products/${id}`).then(unwrap),

  // POST /products  — Admin only
  // Body maps to CreateProductDto
  create: (data) =>
    axiosInstance.post("/products", buildProductPayload(data)).then(unwrap),

  update: (id, data) =>
    axiosInstance.put(`/products/${id}`, buildProductPayload(data, id)).then(unwrap),

  remove: (id) =>
    axiosInstance.delete(`/products/${id}`).then(unwrap),

  // POST /media/upload?folder=products
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance
      .post("/media/upload?folder=products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(r => ({ url: r.data?.data?.url ?? r.data?.url ?? r.data }));
  },
};

// Build CreateProductDto / UpdateProductDto from admin form data
function buildProductPayload(form, id) {
  const translations = ["az","en","ru"].map(lang => ({
    lang,
    name:        form.name?.[lang]        || form.name?.az || "",
    description: form.description?.[lang] || form.description?.az || "",
  }));

  const imageUrls = (form.images || []).map((url, i) => ({
    imageUrl:  typeof url === "string" ? url : url.url || url.imageUrl,
    isPrimary: i === 0,
    sortOrder: i,
  }));

  const colors = (form.colors || []).map(c => ({
    name:    c.name,
    hexCode: c.hex || c.hexCode,
  }));

  return {
    ...(id ? { id: Number(id) } : {}),
    price:               Number(form.price) || 0,
    discountPrice:       form.discount_price ? Number(form.discount_price) : null,
    stock:               Number(form.stock)  || 0,
    furnitureCategoryId: Number(form.category_id) || 0,
    isFeatured:          form.is_featured || false,
    displayOrder:        form.display_order || 0,
    label:               form.label || null,
    material:            form.material || null,
    width:               form.width  ? Number(form.width)  : null,
    height:              form.height ? Number(form.height) : null,
    depth:               form.depth  ? Number(form.depth)  : null,
    weight:              form.weight ? Number(form.weight) : null,
    translations,
    imageUrls,
    colors,
  };
}

// ════════════════════════════════════════════════════════════
// 🏷️ CATEGORIES (Furniture Categories)
// ════════════════════════════════════════════════════════════
export const categoryApi = {
  // GET /furniture-categories
  getAll: (params = {}) =>
    axiosInstance.get("/furniture-categories", { params }).then(r => {
      const arr = r.data?.data ?? r.data;
      return { data: Array.isArray(arr) ? arr : [], total: Array.isArray(arr) ? arr.length : 0 };
    }),

  getById: (id) =>
    axiosInstance.get(`/furniture-categories/${id}`).then(unwrap),

  // POST /furniture-categories  — Admin
  // Body: CreateFurnitureCategoryDto: { translations:[{lang,name}], imageUrl? }
  create: (form) =>
    axiosInstance.post("/furniture-categories", buildCategoryPayload(form)).then(unwrap),

  update: (id, form) =>
    axiosInstance.put(`/furniture-categories/${id}`, buildCategoryPayload(form, id)).then(unwrap),

  remove: (id) =>
    axiosInstance.delete(`/furniture-categories/${id}`).then(unwrap),

  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance
      .post("/media/upload?folder=categories", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(r => ({ url: r.data?.data?.url ?? r.data?.url ?? r.data }));
  },
};

function buildCategoryPayload(form, id) {
  return {
    ...(id ? { id: Number(id) } : {}),
    imageUrl: form.image || form.imageUrl || null,
    translations: ["az","en","ru"].map(lang => ({
      lang, name: form.name?.[lang] || form.name?.az || "",
    })),
  };
}

// ════════════════════════════════════════════════════════════
// 🗂️ COLLECTIONS
// ════════════════════════════════════════════════════════════
export const collectionApi = {
  // GET /collections
  getAll: (params = {}) =>
    axiosInstance.get("/collections", { params }).then(r => {
      const arr = r.data?.data ?? r.data;
      return { data: Array.isArray(arr) ? arr : [], total: Array.isArray(arr) ? arr.length : 0 };
    }),

  getById: (id) =>
    axiosInstance.get(`/collections/${id}`).then(unwrap),

  // POST /collections  — Admin
  // Body: CreateCollectionDto
  create: (form) =>
    axiosInstance.post("/collections", buildCollectionPayload(form)).then(unwrap),

  update: (id, form) =>
    axiosInstance.put(`/collections/${id}`, buildCollectionPayload(form, id)).then(unwrap),

  remove: (id) =>
    axiosInstance.delete(`/collections/${id}`).then(unwrap),
};

function buildCollectionPayload(form, id) {
  return {
    ...(id ? { id: Number(id) } : {}),
    imageUrl:             form.image || null,
    totalPrice:           Number(form.price) || 0,
    discountPrice:        form.discount_price ? Number(form.discount_price) : null,
    displayOrder:         form.display_order || 0,
    collectionCategoryId: Number(form.collection_category_id) || 0,
    productIds:           (form.product_ids || []).map(Number),
    translations: ["az","en","ru"].map(lang => ({
      lang,
      name:        form.name?.[lang]        || form.name?.az        || "",
      description: form.description?.[lang] || form.description?.az || "",
    })),
  };
}

// ════════════════════════════════════════════════════════════
// 🗂️ COLLECTION CATEGORIES
// ════════════════════════════════════════════════════════════
export const collectionCategoryApi = {
  // GET /collection-categories
  getAll: (params = {}) =>
    axiosInstance.get("/collection-categories", { params }).then(r => {
      const arr = r.data?.data ?? r.data;
      return { data: Array.isArray(arr) ? arr : [], total: Array.isArray(arr) ? arr.length : 0 };
    }),

  getById: (id) =>
    axiosInstance.get(`/collection-categories/${id}`).then(unwrap),

  create: (form) =>
    axiosInstance.post("/collection-categories", buildCollCatPayload(form)).then(unwrap),

  update: (id, form) =>
    axiosInstance.put(`/collection-categories/${id}`, buildCollCatPayload(form, id)).then(unwrap),

  remove: (id) =>
    axiosInstance.delete(`/collection-categories/${id}`).then(unwrap),

  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance
      .post("/media/upload?folder=collection-categories", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(r => ({ url: r.data?.data?.url ?? r.data?.url ?? r.data }));
  },
};

function buildCollCatPayload(form, id) {
  return {
    ...(id ? { id: Number(id) } : {}),
    imageUrl: form.image || form.imageUrl || null,
    translations: ["az","en","ru"].map(lang => ({
      lang, name: form.name?.[lang] || form.name?.az || "",
    })),
  };
}

// ════════════════════════════════════════════════════════════
// 🛍️ ORDERS
// ════════════════════════════════════════════════════════════
export const orderApi = {
  // GET /orders/admin/all  (Admin role required)
  getAll: (params = {}) =>
    axiosInstance.get("/orders/admin/all", {
      params: { page: params.page || 1, pageSize: params.limit || params.pageSize || 8 }
    }).then(r => {
      const d = r.data?.data ?? r.data;
      const arr = Array.isArray(d) ? d : [];
      const total = r.data?.pagination?.totalCount ?? arr.length;
      return { data: arr, total };
    }),

  getById: (id) =>
    axiosInstance.get(`/orders/${id}`).then(unwrap),

  // PUT /orders/admin/:id/status  — Admin
  updateStatus: (id, status) =>
    axiosInstance.put(`/orders/admin/${id}/status`, { status }).then(unwrap),
};

// ════════════════════════════════════════════════════════════
// 🖼️ HERO SECTIONS
// ════════════════════════════════════════════════════════════
export const heroApi = {
  // GET /hero-sections/all  (Admin sees all, not just active)
  getAll: (params = {}) =>
    axiosInstance.get("/hero-sections/all", { params }).then(r => {
      const arr = r.data?.data ?? r.data;
      return { data: Array.isArray(arr) ? arr : [], total: Array.isArray(arr) ? arr.length : 0 };
    }),

  getById: (id) =>
    axiosInstance.get(`/hero-sections/${id}`).then(unwrap),

  // POST /hero-sections — Admin
  // Body: CreateHeroSectionDto: { imageUrl, translations:[{lang,title,subtitle,badgeText}] }
  create: (form) =>
    axiosInstance.post("/hero-sections", buildHeroPayload(form)).then(unwrap),

  update: (id, form) =>
    axiosInstance.put(`/hero-sections/${id}`, buildHeroPayload(form)).then(unwrap),

  toggle: (id) =>
    axiosInstance.patch(`/hero-sections/${id}/toggle`).then(unwrap),

  remove: (id) =>
    axiosInstance.delete(`/hero-sections/${id}`).then(unwrap),

  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance
      .post("/media/upload?folder=hero", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(r => ({ url: r.data?.data?.url ?? r.data?.url ?? r.data }));
  },
};

function buildHeroPayload(form) {
  return {
    imageUrl: form.image || form.imageUrl || null,
    translations: ["az","en","ru"].map(lang => ({
      lang,
      title:     form.title?.[lang]    || form.title?.az    || "",
      subtitle:  form.subtitle?.[lang] || form.subtitle?.az || "",
      badgeText: form.badge?.[lang]    || form.badge?.az    || "",
    })),
  };
}

// ════════════════════════════════════════════════════════════
// 📣 CAMPAIGNS
// ════════════════════════════════════════════════════════════
export const campaignApi = {
  // GET /campaigns/all  (Admin — all campaigns)
  getAll: (params = {}) =>
    axiosInstance.get("/campaigns/all", { params }).then(r => {
      const arr = r.data?.data ?? r.data;
      return { data: Array.isArray(arr) ? arr : [], total: Array.isArray(arr) ? arr.length : 0 };
    }),

  getById: (id) =>
    axiosInstance.get(`/campaigns/${id}`).then(unwrap),

  // POST /campaigns  — Admin
  // Body: CreateCampaignDto
  create: (form) =>
    axiosInstance.post("/campaigns", buildCampaignPayload(form)).then(unwrap),

  update: (id, form) =>
    axiosInstance.put(`/campaigns/${id}`, buildCampaignPayload(form)).then(unwrap),

  toggle: (id) =>
    axiosInstance.patch(`/campaigns/${id}/toggle`).then(unwrap),

  remove: (id) =>
    axiosInstance.delete(`/campaigns/${id}`).then(unwrap),
};

function buildCampaignPayload(form) {
  return {
    imageUrl:        form.image || form.imageUrl || null,
    buttonLink:      form.button_link || null,
    discountPercent: form.discount ? Number(form.discount) : null,
    startDate:       form.start_date || new Date().toISOString(),
    endDate:         form.end_date   || new Date().toISOString(),
    displayOrder:    form.display_order || 0,
    translations: ["az","en","ru"].map(lang => ({
      lang,
      title:       form.name?.[lang]        || form.name?.az        || "",
      description: form.description?.[lang] || form.description?.az || "",
      buttonText:  form.button_text?.[lang] || form.button_text?.az || "",
    })),
  };
}

// ════════════════════════════════════════════════════════════
// 🎟️ DISCOUNT CODES
// ════════════════════════════════════════════════════════════
export const discountCodeApi = {
  // GET /discount-codes
  getAll: (params = {}) =>
    axiosInstance.get("/discount-codes", { params }).then(r => {
      const arr = r.data?.data ?? r.data;
      return { data: Array.isArray(arr) ? arr : [], total: Array.isArray(arr) ? arr.length : 0 };
    }),

  getById: (id) =>
    axiosInstance.get(`/discount-codes/${id}`).then(unwrap),

  // POST /discount-codes  — Admin
  // Backend DiscountType enum: 1=Percent, 2=Fixed
  create: (form) =>
    axiosInstance.post("/discount-codes", {
      code:           (form.code || "").toUpperCase(),
      type:           form.type === "percent" ? 1 : 2,   // DiscountType: 1=Percent, 2=Fixed
      value:          Number(form.value)  || 0,
      maxUses:        Number(form.limit)  || null,
      minOrderAmount: Number(form.min_order) || null,
      expiresAt:      form.expiration ? new Date(form.expiration).toISOString() : null,
    }).then(unwrap),

  update: (id, form) =>
    axiosInstance.put(`/discount-codes/${id}`, {
      code:           (form.code || "").toUpperCase(),
      type:           form.type === "percent" ? 1 : 2,
      value:          Number(form.value)  || 0,
      maxUses:        Number(form.limit)  || null,
      minOrderAmount: Number(form.min_order) || null,
      expiresAt:      form.expiration ? new Date(form.expiration).toISOString() : null,
    }).then(unwrap),

  // PATCH /discount-codes/:id/deactivate
  deactivate: (id) =>
    axiosInstance.patch(`/discount-codes/${id}/deactivate`).then(unwrap),

  remove: (id) =>
    axiosInstance.delete(`/discount-codes/${id}`).then(unwrap),
};