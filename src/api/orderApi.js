import axiosInstance from "./axiosInstance";

const unwrap = (r) => r.data?.data ?? r.data;

const orderApi = {
  create: (payload) =>
    axiosInstance.post("/orders", payload).then(unwrap),
  getMyOrders: () =>
    axiosInstance.get("/orders").then(unwrap),

  getById: (id) =>
    axiosInstance.get(`/orders/${id}`).then(unwrap),

  cancel: (id) =>
    axiosInstance.delete(`/orders/${id}`).then(unwrap),
};

export default orderApi;
