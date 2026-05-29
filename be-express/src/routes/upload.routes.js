const router   = require('express').Router();
const { uploadProduct, uploadCategory, uploadAvatar } = require('../middlewares/upload.middleware');
const AppError = require('../utils/AppError');

const handleUpload = (req, res, next) => {
  if (!req.file) return next(new AppError('No image file provided', 400));
  // req.file.path là URL Cloudinary trả về
  res.status(201).json({ imageUrl: req.file.path });
};

router.post('/image',    uploadAvatar.single('image'),   handleUpload);
router.post('/product',  uploadProduct.single('image'),  handleUpload);
router.post('/category', uploadCategory.single('image'), handleUpload);
router.post('/avatar',   uploadAvatar.single('image'),   handleUpload);

module.exports = router;

