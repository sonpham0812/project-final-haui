const categoryService = require("../services/category.service");
const catchAsync = require("../utils/catchAsync");
const path = require("node:path");

// Public: chỉ trả về danh mục ACTIVE
const getCategories = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const categories = await categoryService.getCategories({
    page: Number.parseInt(page),
    limit: Number.parseInt(limit),
    search,
    onlyActive: true,
  });
  res.json(categories);
});

// Admin: trả về tất cả bao gồm cả INACTIVE
const adminGetCategories = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const categories = await categoryService.getCategories({
    page: Number.parseInt(page),
    limit: Number.parseInt(limit),
    search,
    onlyActive: false,
  });
  res.json(categories);
});

const createCategory = catchAsync(async (req, res) => {
  const { name, status, image: imageBody } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "name is required" });
  let image = null;
  if (req.file) {
    image = `${req.protocol}://${req.get("host")}/uploads/categories/${req.file.filename}`;
  } else if (imageBody) {
    image = imageBody;
  }
  const category = await categoryService.createCategory({
    name,
    image,
    status,
  });
  res.status(201).json(category);
});

const getCategoryById = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.json(category);
});

const updateCategory = catchAsync(async (req, res) => {
  const updates = { ...req.body };
  if (req.file) {
    updates.image = `${req.protocol}://${req.get("host")}/uploads/categories/${req.file.filename}`;
  }
  // nếu FE gửi image qua body (đã upload riêng), giữ nguyên updates.image
  const category = await categoryService.updateCategory(req.params.id, updates);
  res.json(category);
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.json({ success: true, message: "Category has been deactivated" });
});

module.exports = {
  getCategories,
  adminGetCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
};
