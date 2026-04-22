const orderService = require("../services/order.service");
const catchAsync = require("../utils/catchAsync");

// ── User controllers ──────────────────────────────────────────────
const createOrder = catchAsync(async (req, res) => {
  const { address, phone, selectedItemIds } = req.body;
  if (!address || !phone || !selectedItemIds) {
    return res
      .status(400)
      .json({
        success: false,
        message: "address, phone, and selectedItemIds are required",
      });
  }
  const order = await orderService.createOrder(req.user.id, {
    address,
    phone,
    selectedItemIds,
  });
  res.status(201).json(order);
});

const getUserOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id);
  res.json(orders);
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.id);
  res.json(order);
});

const cancelOrder = catchAsync(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user.id);
  res.json(order);
});

// ── Admin controllers ─────────────────────────────────────────────
const adminGetOrders = catchAsync(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await orderService.adminGetOrders({ page, limit, status });
  res.json(result);
});

const adminGetOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json(order);
});

const adminUpdateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res
      .status(400)
      .json({ success: false, message: "status is required" });
  }
  const order = await orderService.adminUpdateStatus(req.params.id, status);
  res.json(order);
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  adminGetOrders,
  adminGetOrderById,
  adminUpdateStatus,
};
