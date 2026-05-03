import axiosClient from "../axiosClient";

export const userReviewServices = {
  createReview: (data) => axiosClient.post("/reviews", data),
  getProductReviews: (productId, { rating } = {}) =>
    axiosClient.get(`/products/${productId}/reviews`, {
      params: rating ? { rating } : {},
    }),
};
