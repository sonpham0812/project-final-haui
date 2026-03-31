const router              = require('express').Router();
const productController   = require('../controllers/product.controller');
const categoryController  = require('../controllers/category.controller');
const orderController     = require('../controllers/order.controller');
const userController      = require('../controllers/user.controller');
const dashboardController = require('../controllers/dashboard.controller');
const upload              = require('../middlewares/upload.middleware');

// ── Dashboard ─────────────────────────────────────────────────────
router.get('/dashboard', dashboardController.getDashboard);

// ── Products ──────────────────────────────────────────────────────
router.get('/products',        productController.adminGetProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products',       upload.single('image'), productController.createProduct);
router.put('/products/:id',    upload.single('image'), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// ── Categories ────────────────────────────────────────────────────
router.get('/categories',      categoryController.getCategories);
router.get('/categories/:id', categoryController.getCategoryById)
router.post('/categories',     categoryController.createCategory);
router.put('/categories/:id',  categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// ── Orders ────────────────────────────────────────────────────────
router.get('/orders',               orderController.adminGetOrders);
router.get('/orders/:id',           orderController.adminGetOrderById);
router.put('/orders/:id/status',    orderController.adminUpdateStatus);

// ── Users ─────────────────────────────────────────────────────────
router.get('/users',                userController.getUsers);
router.put('/users/:id/status',     userController.updateUserStatus);

module.exports = router;
