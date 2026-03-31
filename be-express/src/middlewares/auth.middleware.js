const jwt     = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * Verify JWT from Authorization: Bearer <token>
 * Attaches decoded payload to req.user
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }
};

/**
 * Role-based authorization middleware factory.
 * Usage: authorize('ADMIN') or authorize('USER', 'ADMIN')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

module.exports = { authenticate, authorize };
