import axiosInstance from "./axiosInstance";

const unwrap = (r) => r.data?.data ?? r.data;

const paymentApi = {

  createIntent: (orderId) =>
    axiosInstance.post(`/payments/${orderId}/create-intent`).then(unwrap),

 markPaid:   (orderId) =>
    axiosInstance.post(`/payments/${orderId}/mark-paid`).then(unwrap),

  markFailed: (orderId) =>
    axiosInstance.post(`/payments/${orderId}/mark-failed`).then(unwrap),
};

export default paymentApi;


