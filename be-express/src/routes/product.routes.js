const router            = require('express').Router();
const productController = require('../controllers/product.controller');

// Public product routes (no auth required)
router.get('/',    productController.getProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
