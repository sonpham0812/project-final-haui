const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Tạo review
router.post("/reviews", authenticate, reviewController.createReview);
// Lấy danh sách review của sản phẩm
router.get("/products/:id/reviews", reviewController.getProductReviews);

module.exports = router;
