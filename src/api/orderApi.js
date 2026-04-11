import axiosInstance from "./axiosInstance";

const unwrap = (r) => r.data?.data ?? r.data;

const orderApi = {
  create: (payload) =>
    axiosInstance.post("/orders", payload).then(unwrap),

  getMyOrders: () =>
    axiosInstance.get("/orders/my").then(unwrap),

  getById: (id) =>
    axiosInstance.get(`/orders/${id}`).then(unwrap),

  cancel: (id) =>
    axiosInstance.patch(`/orders/${id}/cancel`).then(unwrap),
};

export default orderApi;
