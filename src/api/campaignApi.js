// src/api/campaignApi.js
import axiosInstance from "./axiosInstance";

const unwrap = (r) => r.data?.data ?? r.data;

const campaignApi = {
  // GET /campaigns — aktiv kampaniyalar (public)
  getActive: () =>
    axiosInstance.get("/campaigns").then(unwrap),

  // GET /campaigns/:id — tək kampaniya
  getById: (id) =>
    axiosInstance.get(`/campaigns/${id}`).then(unwrap),
};

export default campaignApi;
