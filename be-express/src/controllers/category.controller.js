const categoryService = require('../services/category.service');
const catchAsync      = require('../utils/catchAsync');

const getCategories = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const categories = await categoryService.getCategories({
    page: parseInt(page),
    limit: parseInt(limit),
    search
  });
  res.json(categories);
});

const createCategory = catchAsync(async (req, res) => {
  const { name, status } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'name is required' });
  }
  const category = await categoryService.createCategory({ name, status });
  res.status(201).json(category);
});

const getCategoryById = catchAsync(async(req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.json(category);
})

const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.json(category);
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.json({ success: true, message: 'Category has been deactivated' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, getCategoryById };
