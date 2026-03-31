const userService = require('../services/user.service');
const catchAsync  = require('../utils/catchAsync');

const getUsers = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await userService.getUsers({ page, limit });
  res.json({ success: true, data: result });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'status is required' });
  }
  const user = await userService.updateUserStatus(req.params.id, status);
  res.json({ success: true, data: user });
});

module.exports = { getUsers, updateUserStatus };
