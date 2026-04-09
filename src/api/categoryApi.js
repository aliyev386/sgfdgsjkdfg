import axiosInstance from "./axiosInstance";

const categoryApi = {
  getAll: () =>
    axiosInstance.get("/furniture-categories").then(r => r.data?.data ?? r.data),

  getById: (id) =>
    axiosInstance.get(`/furniture-categories/${id}`).then(r => r.data?.data ?? r.data),

  getProducts: (categoryId, params = {}) =>
    axiosInstance.get("/products", {
      params: { furnitureCategoryId: categoryId, ...params }
    }).then(r => r.data),
};

export default categoryApi;
