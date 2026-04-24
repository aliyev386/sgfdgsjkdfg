import axiosInstance from "./axiosInstance";


const toBackendPayload = (form, id = null) => {
  const translations = ["az", "en", "ru"].map(lang => ({
    lang,
    name:        form.name?.[lang]        || "",
    description: form.description?.[lang] || "",
  }));

  const payload = {
    imageUrl:             form.image || null,
    totalPrice:           Number(form.price) || 0,
    discountPrice:        form.discount_price ? Number(form.discount_price) : null,
    displayOrder:         Number(form.display_order) || 0,
    collectionCategoryId: Number(form.collection_category_id) || 0,
    productIds:           form.product_ids || [],
    translations,
  };

  if (id !== null) payload.id = id;
  return payload;
};

const collectionApi = {
  getAll: () =>
    axiosInstance.get("/collections").then(r => {
      const arr = r.data?.data ?? r.data;
      return Array.isArray(arr) ? arr : [];
    }),

  getById: (id) =>
    axiosInstance.get(`/collections/${id}`).then(r => r.data?.data ?? r.data),

  getCategories: () =>
    axiosInstance.get("/collection-categories").then(r => {
      const arr = r.data?.data ?? r.data;
      return Array.isArray(arr) ? arr : [];
    }),

  getByCategory: (categoryId) =>
    axiosInstance.get(`/collections/by-category/${categoryId}`).then(r => r.data?.data ?? r.data),

  create: (form) =>
    axiosInstance.post("/collections", toBackendPayload(form)).then(r => r.data?.data ?? r.data),

  update: (id, form) =>
    axiosInstance.put(`/collections/${id}`, toBackendPayload(form, id)).then(r => r.data?.data ?? r.data),

  remove: (id) =>
    axiosInstance.delete(`/collections/${id}`).then(r => r.data),

  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance.post("/media/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data?.data?.url ?? r.data?.url ?? r.data);
  },
};

export default collectionApi;