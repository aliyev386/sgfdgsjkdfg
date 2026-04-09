import axiosInstance from "./axiosInstance";

const wishlistApi = {
  get: () =>
    axiosInstance.get("/wishlist").then(r => r.data?.data ?? r.data),

  addItem: ({ productId, collectionId }) =>
    axiosInstance.post("/wishlist/items", null, {
      params: {
        productId:    productId    || undefined,
        collectionId: collectionId || undefined,
      },
    }).then(r => r.data),

  removeItem: (wishlistItemId) =>
    axiosInstance.delete(`/wishlist/items/${wishlistItemId}`).then(r => r.data),

  check: ({ productId, collectionId }) =>
    axiosInstance.get("/wishlist/check", {
      params: {
        productId:    productId    || undefined,
        collectionId: collectionId || undefined,
      },
    }).then(r => r.data?.data ?? r.data),

  checkProduct: (productId) =>
    axiosInstance.get(`/wishlist/check/${productId}`)
      .then(r => r.data?.data?.isInWishlist ?? false),
};

export default wishlistApi;
