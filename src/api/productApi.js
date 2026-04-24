import axiosInstance from "./axiosInstance";

const productApi = {

  getAll: (params = {}) =>
    axiosInstance.get("/products", { params }).then(r => {
      const d = r.data;
      const arr = d?.data ?? (Array.isArray(d) ? d : []);
      return { data: Array.isArray(arr) ? arr : [], pagination: d?.pagination ?? null };
    }),

  getFeatured: () =>
    axiosInstance.get("/products/featured").then(r => r.data?.data ?? r.data),

  getById: (id) =>
    axiosInstance.get(`/products/${id}`).then(r => r.data?.data ?? r.data),

  getBySlug: (slug) =>
    axiosInstance.get(`/products/by-name/${slug}`).then(r => r.data?.data ?? r.data),

  search: (keyword, params = {}) =>
    axiosInstance.get("/products/search", { params: { keyword, ...params } }).then(r => r.data),

  getByCategory: (categoryId, params = {}) =>
    axiosInstance.get(`/products/by-furniture-category/${categoryId}`, { params }).then(r => r.data),

  getByCollection: (collectionId, params = {}) =>
    axiosInstance.get(`/products/by-collection/${collectionId}`, { params }).then(r => r.data),

  getByColor: (color, params = {}) =>
    axiosInstance.get("/products/by-color", { params: { color, ...params } }).then(r => r.data),

  getColors: () =>
    axiosInstance.get("/products/colors").then(r => r.data?.data ?? []),

  getByPriceRange: (min, max, params = {}) =>
    axiosInstance.get("/products/price-range", { params: { min, max, ...params } }).then(r => r.data),

  getSimilar: (productId) =>
    axiosInstance.get(`/products/${productId}/similar`).then(r => r.data?.data ?? r.data),

  getReviews: (productId, params = {}) =>
    axiosInstance.get(`/reviews/by-product/${productId}`, { params }).then(r => r.data),

  addReview: ({ productId, rating, comment, authorName, authorEmail }) =>
    axiosInstance.post("/reviews", { productId, rating, comment, authorName, authorEmail }).then(r => r.data?.data ?? r.data),

  updateReview: (id, { rating, comment }) =>
    axiosInstance.put(`/reviews/${id}`, { rating, comment }).then(r => r.data?.data ?? r.data),

  deleteReview: (id) =>
    axiosInstance.delete(`/reviews/${id}`).then(r => r.data),
};

export default productApi;