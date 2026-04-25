import axiosInstance from "./axiosInstance";

const unwrap = (r) => r.data?.data ?? r.data;

const campaignApi = {
  getActive: () =>
    axiosInstance.get("/campaigns").then(unwrap),

  getById: (id) =>
    axiosInstance.get(`/campaigns/${id}`).then(unwrap),

  getProducts: (campaignId, params = {}) =>
    axiosInstance.get(`/campaigns/${campaignId}/products`, { params }).then(r => r.data),
};

export default campaignApi;