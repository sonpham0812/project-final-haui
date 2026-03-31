const dashboardService = require('../services/dashboard.service');
const catchAsync       = require('../utils/catchAsync');

const getDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getDashboard();
  res.json({ success: true, data });
});

module.exports = { getDashboard };
