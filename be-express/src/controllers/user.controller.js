const userService = require("../services/user.service");
const catchAsync = require("../utils/catchAsync");

const getUsers = catchAsync(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await userService.getUsers({ page, limit, status });
  res.json(result);
});

const updateUserStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!status)
    return res
      .status(400)
      .json({ success: false, message: "status is required" });
  const user = await userService.updateUserStatus(req.params.id, status);
  res.json(user);
});

const getMe = catchAsync(async (req, res) => {
  const user = await userService.getMe(req.user.id);
  res.json(user);
});

const updateMe = catchAsync(async (req, res) => {
  const { name, avatar: avatarBody } = req.body;
  // req.file có khi gửi multipart trực tiếp; avatarBody có khi FE đã upload riêng rồi truyền url
  let avatar;
  if (req.file) {
    avatar = `avatars/${req.file.filename}`;
  } else if (avatarBody !== undefined) {
    avatar = avatarBody;
  }
  const user = await userService.updateMe(req.user.id, { name, avatar });
  res.json(user);
});

const changePassword = catchAsync(async (req, res) => {
  const result = await userService.changePassword(req.user.id, req.body);
  res.json(result);
});

module.exports = {
  getUsers,
  updateUserStatus,
  getMe,
  updateMe,
  changePassword,
};
