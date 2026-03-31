// src/api/productApi.js  — backend ProductController-ə uyğun
import axiosInstance from "./axiosInstance";

const productApi = {
  // GET /products?page=1&pageSize=12
  getAll: (params = {}) =>
    axiosInstance.get("/products", { params }).then(r => r.data),

  // GET /products/featured
  getFeatured: () =>
    axiosInstance.get("/products/featured").then(r => r.data?.data ?? r.data),

  // GET /products/:id
  getById: (id) =>
    axiosInstance.get(`/products/${id}`).then(r => r.data?.data ?? r.data),

  // GET /products/by-name/:slug
  getBySlug: (slug) =>
    axiosInstance.get(`/products/by-name/${slug}`).then(r => r.data?.data ?? r.data),

  // GET /products/search?keyword=X
  search: (keyword, params = {}) =>
    axiosInstance.get("/products/search", { params: { keyword, ...params } }).then(r => r.data),

  // GET /products/by-furniture-category/:id?page=1&pageSize=12
  getByCategory: (categoryId, params = {}) =>
    axiosInstance.get(`/products/by-furniture-category/${categoryId}`, { params }).then(r => r.data),

  // GET /products/by-collection/:id
  getByCollection: (collectionId, params = {}) =>
    axiosInstance.get(`/products/by-collection/${collectionId}`, { params }).then(r => r.data),

  // GET /products/by-color?color=X
  getByColor: (color, params = {}) =>
    axiosInstance.get("/products/by-color", { params: { color, ...params } }).then(r => r.data),

  // GET /products/price-range?min=X&max=Y
  getByPriceRange: (min, max, params = {}) =>
    axiosInstance.get("/products/price-range", { params: { min, max, ...params } }).then(r => r.data),
};

export default productApi;
