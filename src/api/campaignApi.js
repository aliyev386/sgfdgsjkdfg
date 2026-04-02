// src/api/campaignApi.js
import axiosInstance from "./axiosInstance";

const campaignApi = {
  // GET /campaigns  →  CampaignDto[] (active only, translated)
  getActive: () =>
    axiosInstance.get("/campaigns").then(r => r.data?.data ?? r.data),
};

export default campaignApi;
