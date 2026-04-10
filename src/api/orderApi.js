// src/api/orderApi.js
import axiosInstance from "./axiosInstance";

const unwrap = (r) => r.data?.data ?? r.data;

const orderApi = {
  // POST /orders — sifariş yarat
  create: (payload) =>
    axiosInstance.post("/orders", payload).then(unwrap),

  // GET /orders/my — istifadəçinin sifarişləri
  getMyOrders: () =>
    axiosInstance.get("/orders/my").then(unwrap),

  // GET /orders/:id — sifariş detalları
  getById: (id) =>
    axiosInstance.get(`/orders/${id}`).then(unwrap),

  // PATCH /orders/:id/cancel — sifarişi ləğv et
  cancel: (id) =>
    axiosInstance.patch(`/orders/${id}/cancel`).then(unwrap),

  // POST /payments/initiate — Payriff ödəniş URL-i al
  // amount null olarsa tam məbləğ, dolu olarsa həmin məbləğ (partial)
  initiatePayment: (orderId, amount = null) =>
    axiosInstance.post("/payments/initiate", { orderId, amount }).then(unwrap),

  // POST /payments/verify — Payriff callback-dən sonra ödənişi təsdiqlə
  verifyPayment: (orderId, payriffOrderId, sessionId) =>
    axiosInstance.post("/payments/verify", { orderId, payriffOrderId, sessionId }).then(unwrap),
};

export default orderApi;
