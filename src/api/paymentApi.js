import axiosInstance from "./axiosInstance";

const unwrap = (r) => r.data?.data ?? r.data;

const paymentApi = {
  initiate: (orderId) =>
    axiosInstance.post("/payments/initiate", { orderId }).then(unwrap),
  verify: (payload) =>
    axiosInstance.post("/payments/verify", payload).then(unwrap),
};

export default paymentApi;
