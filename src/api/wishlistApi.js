import axiosInstance from "./axiosInstance";

const wishlistApi = {
  // GET /wishlist → WishlistDto (items ilə)
  get: () =>
    axiosInstance.get("/wishlist").then(r => r.data?.data ?? r.data),

  // POST /wishlist/items?productId=X  və ya  ?collectionId=Y
  addItem: ({ productId, collectionId }) =>
    axiosInstance.post("/wishlist/items", null, {
      params: {
        productId:    productId    || undefined,
        collectionId: collectionId || undefined,
      },
    }).then(r => r.data),

  // DELETE /wishlist/items/:wishlistItemId
  removeItem: (wishlistItemId) =>
    axiosInstance.delete(`/wishlist/items/${wishlistItemId}`).then(r => r.data),

  // GET /wishlist/check?productId=X  → { isInWishlist: bool }
  check: ({ productId, collectionId }) =>
    axiosInstance.get("/wishlist/check", {
      params: {
        productId:    productId    || undefined,
        collectionId: collectionId || undefined,
      },
    }).then(r => r.data?.data ?? r.data),

  // GET /wishlist/check/:productId
  checkProduct: (productId) =>
    axiosInstance.get(`/wishlist/check/${productId}`)
      .then(r => r.data?.data?.isInWishlist ?? false),
};

export default wishlistApi;
