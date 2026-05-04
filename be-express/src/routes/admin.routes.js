const router = require("express").Router();
const productController = require("../controllers/product.controller");
const categoryController = require("../controllers/category.controller");
const orderController = require("../controllers/order.controller");
const userController = require("../controllers/user.controller");
const dashboardController = require("../controllers/dashboard.controller");
const {
  uploadProduct,
  uploadCategory,
} = require("../middlewares/upload.middleware");

// ── Dashboard ─────────────────────────────────────────────────────
router.get("/dashboard", dashboardController.getDashboard);

// ── Products ──────────────────────────────────────────────────────
router.get("/products", productController.adminGetProducts);
router.get("/products/:id", productController.adminGetProductById);
router.post(
  "/products",
  uploadProduct.single("image"),
  productController.createProduct,
);
router.put(
  "/products/:id",
  uploadProduct.single("image"),
  productController.updateProduct,
);
router.delete("/products/:id", productController.deleteProduct);

// ── Categories ────────────────────────────────────────────────────
router.get("/categories", categoryController.adminGetCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.post(
  "/categories",
  uploadCategory.single("image"),
  categoryController.createCategory,
);
router.put(
  "/categories/:id",
  uploadCategory.single("image"),
  categoryController.updateCategory,
);
router.delete("/categories/:id", categoryController.deleteCategory);

// ── Orders ────────────────────────────────────────────────────────
router.get("/orders", orderController.adminGetOrders);
router.get("/orders/:id", orderController.adminGetOrderById);
router.put("/orders/:id/status", orderController.adminUpdateStatus);

// ── Users ─────────────────────────────────────────────────────────
router.get("/users", userController.getUsers);
router.put("/users/:id/status", userController.updateUserStatus);

module.exports = router;
