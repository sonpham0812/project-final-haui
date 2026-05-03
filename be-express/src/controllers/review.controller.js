const reviewService = require("../services/review.service");
const catchAsync = require("../utils/catchAsync");

const createReview = catchAsync(async (req, res) => {
  await reviewService.createReview(req.user.id, req.body);
  res.json({ message: "Đánh giá thành công" });
});

const getProductReviews = catchAsync(async (req, res) => {
  const { rating } = req.query;
  const result = await reviewService.getProductReviews(req.params.id, {
    rating,
  });
  res.json(result);
});

module.exports = { createReview, getProductReviews };
