import axiosInstance from "./axiosInstance";

const unwrap = (r) => r.data?.data ?? r.data;

const paymentApi = {
  createIntent: (payload) =>
    axiosInstance.post("/payment/create-intent", payload).then(unwrap),

  confirm: (payload) =>
    axiosInstance.post("/payment/confirm", payload).then(unwrap),
};

export default paymentApi;
