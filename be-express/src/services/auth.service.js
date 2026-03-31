const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/db');
const AppError = require('../utils/AppError');

// ----------------------------------------------------------------
// Register
// ----------------------------------------------------------------
const register = async ({ name, email, password }) => {
  const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (rows.length > 0) throw new AppError('Email already in use', 409);

  const hashed = await bcrypt.hash(password, 12);

  const [result] = await db.query(
    'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashed, 'USER', 'ACTIVE']
  );

  return { id: result.insertId, name, email, role: 'USER' };
};

// ----------------------------------------------------------------
// Login
// ----------------------------------------------------------------
const login = async ({ email, password }) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) throw new AppError('Invalid credentials', 401);

  const user = rows[0];
  if (user.status === 'BLOCKED') throw new AppError('Account is blocked', 403);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const payload = { id: user.id, email: user.email, role: user.role };
  const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return { access_token };
};

module.exports = { register, login };
