const db = require("../config/db");
const AppError = require("../utils/AppError");

// ----------------------------------------------------------------
// Check if a user has already reviewed a product in a given order
// ----------------------------------------------------------------
const hasUserReviewedProduct = async (userId, product_id, order_id) => {
  const [[existed]] = await db.query(
    "SELECT id FROM reviews WHERE user_id = ? AND product_id = ? AND order_id = ?",
    [userId, product_id, order_id],
  );
  return !!existed;
};

// ----------------------------------------------------------------
// Create a new review (user must have a COMPLETED order with that product)
// ----------------------------------------------------------------
const createReview = async (
  userId,
  { product_id, order_id, rating, comment },
) => {
  if (!product_id || !order_id)
    throw new AppError("product_id và order_id là bắt buộc", 400);
  if (!rating || rating < 1 || rating > 5)
    throw new AppError("rating phải là số nguyên từ 1 đến 5", 400);

  const [[order]] = await db.query(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [order_id, userId],
  );
  if (!order) throw new AppError("Order không hợp lệ", 400);
  if (order.status !== "COMPLETED")
    throw new AppError("Order chưa hoàn thành", 400);

  const [[orderProduct]] = await db.query(
    "SELECT * FROM order_items WHERE order_id = ? AND product_id = ?",
    [order_id, product_id],
  );
  if (!orderProduct) throw new AppError("Sản phẩm không thuộc order này", 400);

  const alreadyReviewed = await hasUserReviewedProduct(
    userId,
    product_id,
    order_id,
  );
  if (alreadyReviewed)
    throw new AppError("Bạn đã đánh giá sản phẩm này trong đơn hàng này", 400);

  await db.query(
    "INSERT INTO reviews (user_id, product_id, order_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
    [userId, product_id, order_id, rating, comment],
  );

  const [stats] = await db.query(
    "SELECT rating FROM reviews WHERE product_id = ?",
    [product_id],
  );
  const review_count = stats.length;
  const average_rating =
    review_count > 0
      ? stats.reduce((sum, r) => sum + r.rating, 0) / review_count
      : 0;
  await db.query(
    "UPDATE products SET average_rating = ?, review_count = ? WHERE id = ?",
    [average_rating, review_count, product_id],
  );

  return { success: true };
};

// ----------------------------------------------------------------
// Get all reviews for a product
// ----------------------------------------------------------------
const getProductReviews = async (product_id, { rating } = {}) => {
  const [[product]] = await db.query(
    "SELECT id, average_rating, review_count FROM products WHERE id = ?",
    [product_id],
  );
  if (!product) throw new AppError("Không tìm thấy sản phẩm", 404);

  let sql = `SELECT r.rating, r.comment, r.created_at, u.name AS user_name
       FROM reviews r
       LEFT JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ?`;
  const params = [product_id];

  if (rating) {
    sql += " AND r.rating = ?";
    params.push(Number(rating));
  }

  sql += " ORDER BY r.created_at DESC";

  const [reviews] = await db.query(sql, params);

  return {
    average_rating: Number(product.average_rating) || 0,
    review_count: Number(product.review_count) || 0,
    reviews: reviews.map((r) => ({
      user_name: r.user_name || "Ẩn danh",
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
    })),
  };
};

module.exports = { createReview, getProductReviews, hasUserReviewedProduct };
