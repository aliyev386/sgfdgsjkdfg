import axiosInstance from "./axiosInstance";

const cartApi = {
  get: () => axiosInstance.get("/cart").then(r => r.data?.data ?? r.data),

  addItem: ({ productId, collectionId, selectedColor, selectedSize, quantity = 1 }) =>
    axiosInstance.post("/cart/items", {
      productId:     productId     || undefined,
      collectionId:  collectionId  || undefined,
      selectedColor: selectedColor || undefined,
      selectedSize:  selectedSize  || undefined,
      quantity,
    }).then(r => r.data?.data ?? r.data),

  updateItem: (cartItemId, quantity) =>
    axiosInstance.put(`/cart/items/${cartItemId}`, { quantity }).then(r => r.data),

  removeItem: (cartItemId) =>
    axiosInstance.delete(`/cart/items/${cartItemId}`).then(r => r.data),

  clear: () => axiosInstance.delete("/cart").then(r => r.data),
};

export default cartApi;
