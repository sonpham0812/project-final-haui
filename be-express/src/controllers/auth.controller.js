const authService  = require('../services/auth.service');
const catchAsync   = require('../utils/catchAsync');

const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'name, email and password are required' });
  }

  const user = await authService.register({ name, email, password });
  res.status(201).json({ success: true, data: user });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'email and password are required' });
  }

  const result = await authService.login({ email, password });
  res.status(200).json({ success: true, data: result });
});

module.exports = { register, login };
