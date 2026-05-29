const multer            = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary        = require('../config/cloudinary');
const AppError          = require('../utils/AppError');

// ── File filter: images only ──────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const mimeOk  = allowed.test(file.mimetype);
  if (mimeOk) cb(null, true);
  else cb(new AppError('Only image files (jpeg, jpg, png, gif, webp) are allowed', 400), false);
};

// ── Factory: create upload middleware for a specific Cloudinary folder ──
const createUpload = (folder = 'uploads') => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });
  return multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
};

// ── Pre-built instances ───────────────────────────────────────────
const uploadProduct  = createUpload('ecommerce/products');
const uploadCategory = createUpload('ecommerce/categories');
const uploadAvatar   = createUpload('ecommerce/avatars');

// Legacy default (backward compat)
const upload = createUpload('ecommerce/uploads');

module.exports = { upload, uploadProduct, uploadCategory, uploadAvatar, createUpload };
