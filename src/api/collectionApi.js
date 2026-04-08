// src/api/collectionApi.js  — backend CollectionController-ə uyğun
import axiosInstance from "./axiosInstance";

// Frontend {name:{az,en,ru}, description:{az,en,ru}, price, discount_price,
//           display_order, collection_category_id, product_ids, image}
// → Backend CreateCollectionDto / UpdateCollectionDto formatına çevirir
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
  // GET /collections  →  CollectionDto[]
  getAll: () =>
    axiosInstance.get("/collections").then(r => r.data?.data ?? r.data),

  // GET /collections/:id  →  CollectionDto (products daxil)
  getById: (id) =>
    axiosInstance.get(`/collections/${id}`).then(r => r.data?.data ?? r.data),

  // GET /collection-categories  →  CollectionCategoryDto[]
  getCategories: () =>
    axiosInstance.get("/collection-categories").then(r => r.data?.data ?? r.data),

  // GET /collections/by-category/:id
  getByCategory: (categoryId) =>
    axiosInstance.get(`/collections/by-category/${categoryId}`).then(r => r.data?.data ?? r.data),

  // POST /collections  →  { id }
  create: (form) =>
    axiosInstance.post("/collections", toBackendPayload(form)).then(r => r.data?.data ?? r.data),

  // PUT /collections/:id
  update: (id, form) =>
    axiosInstance.put(`/collections/${id}`, toBackendPayload(form, id)).then(r => r.data?.data ?? r.data),

  // DELETE /collections/:id
  remove: (id) =>
    axiosInstance.delete(`/collections/${id}`).then(r => r.data),

  // Image upload — backend MediaController istifadə edir
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance.post("/media/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data?.data?.url ?? r.data?.url ?? r.data);
  },
};

export default collectionApi;