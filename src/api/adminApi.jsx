

import axiosInstance from "./axiosInstance";


export const dashboardApi = {
  getStats: () =>
    axiosInstance.get("/admin/dashboard/stats").then((r) => r.data),

  getTopProducts: (limit = 5) =>
    axiosInstance
      .get("/admin/dashboard/top-products", { params: { limit } })
      .then((r) => r.data),

  getMonthlyRevenue: (year) =>
    axiosInstance
      .get("/admin/dashboard/monthly-revenue", { params: { year } })
      .then((r) => r.data),
};

const unwrapList = (r) => {
  const d = r.data;
  if (Array.isArray(d)) return { data: d, total: d.length };
  if (d?.data) return { data: Array.isArray(d.data) ? d.data : [], total: d.pagination?.totalCount ?? 0 };
  return { data: [], total: 0 };
};
const unwrap = (r) => r.data?.data ?? r.data;

export const productApi = {
  getAll: (params = {}) =>
    axiosInstance.get("/products", { params: { page: params.page||1, pageSize: params.limit||params.pageSize||10, ...params } })
      .then(unwrapList),

  getById: (id) =>
    axiosInstance.get(`/products/${id}`).then(unwrap),
  create: (data) =>
    axiosInstance.post("/products", buildProductPayload(data)).then(unwrap),

  update: (id, data) =>
    axiosInstance.put(`/products/${id}`, buildProductPayload(data, id)).then(unwrap),

  remove: (id) =>
    axiosInstance.delete(`/products/${id}`).then(unwrap),

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

  const colors = (form.colors || []).map(c => {
    let hex = c.hex || c.hexCode || "#000000";
    if (!hex.startsWith("#")) hex = "#" + hex;  
    if (hex.length === 4) {
      hex = "#" + hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
    }
    return { name: c.name || "", hexCode: hex };
  });

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

export const categoryApi = {
  getAll: (params = {}) =>
    axiosInstance.get("/furniture-categories", { params }).then(r => {
      const arr = r.data?.data ?? r.data;
      return { data: Array.isArray(arr) ? arr : [], total: Array.isArray(arr) ? arr.length : 0 };
    }),

  getById: (id) =>
    axiosInstance.get(`/furniture-categories/${id}`).then(unwrap),

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
export const collectionApi = {
  getAll: (params = {}) =>
    axiosInstance.get("/collections", { params }).then(r => {
      const arr = r.data?.data ?? r.data;
      return { data: Array.isArray(arr) ? arr : [], total: Array.isArray(arr) ? arr.length : 0 };
    }),

  getById: (id) =>
    axiosInstance.get(`/collections/${id}`).then(unwrap),

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

export const collectionCategoryApi = {
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
export const orderApi = {
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

  updateStatus: (id, status, adminNote, estimatedDeliveryDate) =>
    axiosInstance.put(`/orders/admin/${id}/status`, {
      status,
      adminNote: adminNote || null,
      estimatedDeliveryDate: estimatedDeliveryDate || null,
    }).then(unwrap),

  getByStatus: (status, params = {}) =>
    axiosInstance.get("/orders/admin/by-status", {
      params: { status, page: params.page || 1, pageSize: params.pageSize || 20 }
    }).then(r => {
      const d = r.data?.data ?? r.data;
      const arr = Array.isArray(d) ? d : [];
      return { data: arr, total: r.data?.pagination?.totalCount ?? arr.length };
    }),
};

export const heroApi = {
  getAll: (params = {}) =>
    axiosInstance.get("/hero-sections/all", { params }).then(r => {
      const arr = r.data?.data ?? r.data;
      return { data: Array.isArray(arr) ? arr : [], total: Array.isArray(arr) ? arr.length : 0 };
    }),

  getById: (id) =>
    axiosInstance.get(`/hero-sections/${id}`).then(unwrap),

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

export const campaignApi = {
  getAll: (params = {}) =>
    axiosInstance.get("/campaigns/all", { params }).then(r => {
      const arr = r.data?.data ?? r.data;
      return { data: Array.isArray(arr) ? arr : [], total: Array.isArray(arr) ? arr.length : 0 };
    }),

  getById: (id) =>
    axiosInstance.get(`/campaigns/${id}`).then(unwrap),

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
  const rawStart = form.startDate || form.start_date;
  const rawEnd   = form.endDate   || form.end_date;
  return {
    imageUrl:        form.image || form.imageUrl || null,
    buttonLink:      form.button_link || null,
    discountPercent: form.discount ? Number(form.discount) : null,
    startDate:       rawStart ? new Date(rawStart).toISOString() : new Date().toISOString(),
    endDate:         rawEnd   ? new Date(rawEnd).toISOString()   : new Date().toISOString(),
    displayOrder:    form.display_order || 0,
    translations: ["az","en","ru"].map(lang => ({
      lang,
      title:       form.name?.[lang]        || form.name?.az        || "",
      description: form.description?.[lang] || form.description?.az || "",
      buttonText:  form.button_text?.[lang] || form.button_text?.az || "",
    })),
  };
}
export const discountCodeApi = {
  getAll: (params = {}) =>
    axiosInstance.get("/discount-codes", { params }).then(r => {
      const arr = r.data?.data ?? r.data;
      return { data: Array.isArray(arr) ? arr : [], total: Array.isArray(arr) ? arr.length : 0 };
    }),

  getById: (id) =>
    axiosInstance.get(`/discount-codes/${id}`).then(unwrap),

  create: (form) =>
    axiosInstance.post("/discount-codes", {
      code:           (form.code || "").toUpperCase(),
      type:           form.type === "percent" ? 1 : 2,
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

  deactivate: (id) =>
    axiosInstance.patch(`/discount-codes/${id}/deactivate`).then(unwrap),

  remove: (id) =>
    axiosInstance.delete(`/discount-codes/${id}`).then(unwrap),
};