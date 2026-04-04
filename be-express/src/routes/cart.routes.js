const router = require("express").Router();
const cartController = require("../controllers/cart.controller");

// All cart routes require authentication (applied in app.js)
router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.put("/update", cartController.updateCartItem);
router.delete("/remove/:product_id", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

module.exports = router;
