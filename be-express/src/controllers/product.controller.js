const productService = require('../services/product.service');
const catchAsync     = require('../utils/catchAsync');

// ── Public ────────────────────────────────────────────────────────
const getProducts = catchAsync(async (req, res) => {
  const { page, limit, category_id, search, min_price, max_price, min_discount, sort_by } = req.query;
  const result = await productService.getProducts({
    page,
    limit,
    category_id,
    search,
    min_price,
    max_price,
    min_discount,
    sort_by,
  });
  res.json(result);
});

const getProductById = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json(product);
});

// ── Admin ─────────────────────────────────────────────────────────
const adminGetProducts = catchAsync(async (req, res) => {
  const { page, limit, category_id, search, min_price, max_price, min_discount, status, sort_by } = req.query;
  const result = await productService.adminGetProducts({
    page,
    limit,
    category_id,
    search,
    min_price,
    max_price,
    min_discount,
    status,
    sort_by,
  });
  res.json(result);
});

const adminGetProductById = catchAsync(async (req, res) => {
  const product = await productService.adminGetProductById(req.params.id);
  res.json(product);
});

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(product);
});

const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json(product);
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Product has been deactivated' });
});

module.exports = {
  getProducts,
  adminGetProducts,
  getProductById,
  adminGetProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
