const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");
const AppError = require("../utils/AppError");

// ── File filter: images only ──────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) cb(null, true);
  else
    cb(
      new AppError(
        "Only image files (jpeg, jpg, png, gif, webp) are allowed",
        400,
      ),
      false,
    );
};

// ── Factory: create upload middleware for a specific subfolder ────
const createUpload = (subfolder = "") => {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(__dirname, "../../uploads", subfolder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname.replaceAll(" ", "_")}`;
      cb(null, uniqueName);
    },
  });
  return multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
};

// ── Pre-built instances ───────────────────────────────────────────
const uploadProduct = createUpload("products");
const uploadCategory = createUpload("categories");
const uploadAvatar = createUpload("avatars");

// Legacy default (backward compat — existing product upload in admin.routes still works)
const upload = createUpload("");

module.exports = {
  upload,
  uploadProduct,
  uploadCategory,
  uploadAvatar,
  createUpload,
};
