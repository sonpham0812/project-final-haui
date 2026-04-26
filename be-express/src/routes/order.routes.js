const router = require("express").Router();
const orderController = require("../controllers/order.controller");

// All order routes require authentication (applied in app.js)
router.post("/", orderController.createOrder);
router.get("/counts", orderController.getUserOrderCounts);
router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
router.post("/:id/cancel", orderController.cancelOrder);

module.exports = router;
