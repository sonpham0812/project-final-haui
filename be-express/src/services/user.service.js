const db       = require('../config/db');
const AppError = require('../utils/AppError');

const getUsers = async ({ page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM users');
  const [rows] = await db.query(
    'SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [Number(limit), offset]
  );
  return { total, page: Number(page), limit: Number(limit), data: rows };
};

const updateUserStatus = async (id, status) => {
  const allowed = ['ACTIVE', 'BLOCKED'];
  if (!allowed.includes(status)) throw new AppError('Invalid status value', 400);

  const [rows] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
  if (rows.length === 0) throw new AppError('User not found', 404);

  await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
  const [updated] = await db.query(
    'SELECT id, name, email, role, status, created_at FROM users WHERE id = ?',
    [id]
  );
  return updated[0];
};

module.exports = { getUsers, updateUserStatus };
