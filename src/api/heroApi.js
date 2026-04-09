import axiosInstance from "./axiosInstance";

const heroApi = {
  getActive: () =>
    axiosInstance.get("/hero-sections").then(r => r.data?.data ?? r.data),
};

export default heroApi;
