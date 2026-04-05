const router   = require('express').Router();
const upload   = require('../middlewares/upload.middleware');
const AppError = require('../utils/AppError');

/**
 * POST /upload/image
 * Accepts: multipart/form-data with field name "image"
 * Returns: { imageUrl: "/uploads/<filename>" }
 */
router.post('/image', upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No image file provided', 400));
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ imageUrl });
});

module.exports = router;
