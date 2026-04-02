// src/api/categoryApi.js  — backend FurnitureCategoriesController-ə uyğun
import axiosInstance from "./axiosInstance";

const categoryApi = {
  // GET /furniture-categories  →  FurnitureCategoryDto[]
  getAll: () =>
    axiosInstance.get("/furniture-categories").then(r => r.data?.data ?? r.data),

  // GET /furniture-categories/:id
  getById: (id) =>
    axiosInstance.get(`/furniture-categories/${id}`).then(r => r.data?.data ?? r.data),

  // GET /products?page=1&pageSize=12&furnitureCategoryId=X
  getProducts: (categoryId, params = {}) =>
    axiosInstance.get("/products", {
      params: { furnitureCategoryId: categoryId, ...params }
    }).then(r => r.data),
};

export default categoryApi;
