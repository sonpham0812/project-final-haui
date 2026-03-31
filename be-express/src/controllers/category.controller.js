const categoryService = require('../services/category.service');
const catchAsync      = require('../utils/catchAsync');

const getCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getCategories();
  res.json({ success: true, data: categories });
});

const createCategory = catchAsync(async (req, res) => {
  const { name, status } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'name is required' });
  }
  const category = await categoryService.createCategory({ name, status });
  res.status(201).json({ success: true, data: category });
});

const getCategoryById = catchAsync(async(req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.json({success: true, data: category});
})

const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.json({ success: true, data: category });
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.json({ success: true, message: 'Category has been deactivated' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, getCategoryById };
