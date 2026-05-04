const router = require("express").Router();
const userController = require("../controllers/user.controller");
const { uploadAvatar } = require("../middlewares/upload.middleware");

// GET  /me          — lấy thông tin bản thân
router.get("/", userController.getMe);
// PATCH /me          — cập nhật tên + avatar
router.patch("/", uploadAvatar.single("image"), userController.updateMe);
// PATCH /me/password — đổi mật khẩu
router.patch("/password", userController.changePassword);

module.exports = router;
