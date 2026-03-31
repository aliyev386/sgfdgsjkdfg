// src/api/cartApi.js  — backend CartController-ə uyğun
import axiosInstance from "./axiosInstance";

const cartApi = {
  // GET /cart  →  CartDto { id, items, grandTotal, itemCount }
  get: () => axiosInstance.get("/cart").then(r => r.data?.data ?? r.data),

  // POST /cart/items  →  body: AddToCartDto
  addItem: ({ productId, collectionId, selectedColor, selectedSize, quantity = 1 }) =>
    axiosInstance.post("/cart/items", {
      productId:     productId     || undefined,
      collectionId:  collectionId  || undefined,
      selectedColor: selectedColor || undefined,
      selectedSize:  selectedSize  || undefined,
      quantity,
    }).then(r => r.data?.data ?? r.data),

  // PUT /cart/items/:id  →  body: { quantity }
  updateItem: (cartItemId, quantity) =>
    axiosInstance.put(`/cart/items/${cartItemId}`, { quantity }).then(r => r.data),

  // DELETE /cart/items/:id
  removeItem: (cartItemId) =>
    axiosInstance.delete(`/cart/items/${cartItemId}`).then(r => r.data),

  // DELETE /cart
  clear: () => axiosInstance.delete("/cart").then(r => r.data),
};

export default cartApi;
