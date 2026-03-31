// src/api/heroApi.js
import axiosInstance from "./axiosInstance";

const heroApi = {
  // GET /hero-sections  →  HeroSectionDto[] (active only, translated)
  getActive: () =>
    axiosInstance.get("/hero-sections").then(r => r.data?.data ?? r.data),
};

export default heroApi;
