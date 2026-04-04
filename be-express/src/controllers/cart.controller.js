const cartService = require("../services/cart.service");
const catchAsync = require("../utils/catchAsync");

const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.json({ success: true, data: cart });
});

const addToCart = catchAsync(async (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || !quantity) {
    return res
      .status(400)
      .json({
        success: false,
        message: "product_id and quantity are required",
      });
  }
  const cart = await cartService.addToCart(req.user.id, {
    product_id,
    quantity,
  });
  res.json({ success: true, data: cart });
});

const updateCartItem = catchAsync(async (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || quantity === undefined) {
    return res
      .status(400)
      .json({
        success: false,
        message: "product_id and quantity are required",
      });
  }
  const cart = await cartService.updateCartItem(req.user.id, {
    product_id,
    quantity,
  });
  res.json({ success: true, data: cart });
});

const removeFromCart = catchAsync(async (req, res) => {
  const cart = await cartService.removeFromCart(
    req.user.id,
    req.params.product_id,
  );
  res.json({ success: true, data: cart });
});

const clearCart = catchAsync(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  res.json({ success: true, data: cart, message: "Cart cleared successfully" });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
