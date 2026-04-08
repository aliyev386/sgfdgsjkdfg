// src/api/orderApi.js
import axiosInstance from "./axiosInstance";

const unwrap = (r) => r.data?.data ?? r.data;

const orderApi = {
  // POST /orders — sifariş yarat
  create: (payload) =>
    axiosInstance.post("/orders", payload).then(unwrap),

  // GET /orders — istifadəçinin sifarişləri
  getMyOrders: () =>
    axiosInstance.get("/orders").then(unwrap),

  // GET /orders/:id — sifariş detalları
  getById: (id) =>
    axiosInstance.get(`/orders/${id}`).then(unwrap),

  // DELETE /orders/:id — sifarişi ləğv et
  cancel: (id) =>
    axiosInstance.delete(`/orders/${id}`).then(unwrap),
};

export default orderApi;
