const router = require("express").Router();
const categoryController = require("../controllers/category.controller");

// Public category routes (no auth required)
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);

module.exports = router;
