const router = require("express").Router();
const path = require("node:path");
const {
  uploadProduct,
  uploadCategory,
  uploadAvatar,
} = require("../middlewares/upload.middleware");
const AppError = require("../utils/AppError");

const uploadsRoot = path.join(__dirname, "../../uploads");

const handleUpload = (req, res, next) => {
  if (!req.file) return next(new AppError("No image file provided", 400));
  const relative = path
    .relative(uploadsRoot, req.file.path)
    .split(path.sep)
    .join("/");
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${relative}`;
  res.status(201).json({ imageUrl });
};

router.post("/image", uploadAvatar.single("image"), handleUpload);
router.post("/product", uploadProduct.single("image"), handleUpload);
router.post("/category", uploadCategory.single("image"), handleUpload);
router.post("/avatar", uploadAvatar.single("image"), handleUpload);

module.exports = router;
