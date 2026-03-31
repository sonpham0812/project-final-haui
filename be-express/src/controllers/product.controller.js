const productService = require('../services/product.service');
const catchAsync     = require('../utils/catchAsync');

// ── Public ────────────────────────────────────────────────────────
const getProducts = catchAsync(async (req, res) => {
  const { page, limit, category_id, search } = req.query;
  const result = await productService.getProducts({ page, limit, category_id, search });
  res.json({ success: true, data: result });
});

const getProductById = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });
});

// ── Admin ─────────────────────────────────────────────────────────
const adminGetProducts = catchAsync(async (req, res) => {
  const { page, limit, category_id, search } = req.query;
  const result = await productService.adminGetProducts({ page, limit, category_id, search });
  res.json({ success: true, data: result });
});

const createProduct = catchAsync(async (req, res) => {
  // If a file was uploaded, override the image field with its path
  const data = { ...req.body };
  if (req.file) {
    data.image = `/uploads/${req.file.filename}`;
  }

  const product = await productService.createProduct(data);
  res.status(201).json({ success: true, data: product });
});

const updateProduct = catchAsync(async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    data.image = `/uploads/${req.file.filename}`;
  }

  const product = await productService.updateProduct(req.params.id, data);
  res.json({ success: true, data: product });
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Product has been deactivated' });
});

module.exports = {
  getProducts,
  getProductById,
  adminGetProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
