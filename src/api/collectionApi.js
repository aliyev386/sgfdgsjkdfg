// src/api/collectionApi.js  — backend CollectionController-ə uyğun
import axiosInstance from "./axiosInstance";

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

  // GET /collections?collectionCategoryId=X
  getByCategory: (categoryId) =>
    axiosInstance.get("/collections", {
      params: { collectionCategoryId: categoryId }
    }).then(r => r.data?.data ?? r.data),
};

export default collectionApi;
