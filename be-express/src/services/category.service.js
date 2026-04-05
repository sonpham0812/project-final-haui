const db       = require('../config/db');
const AppError = require('../utils/AppError');

const getCategories = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM categories';
  let params = [];

  if (search) {
    query += ' WHERE name LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY id ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await db.query(query, params);

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as total FROM categories';
  let countParams = [];
  if (search) {
    countQuery += ' WHERE name LIKE ?';
    countParams.push(`%${search}%`);
  }
  const [countRows] = await db.query(countQuery, countParams);
  const total = countRows[0].total;

  return {
    items: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getCategoryById = async (id) => {
  const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
  if (rows.length === 0) throw new AppError('Category not found', 404);
  return rows[0];
};

const createCategory = async ({ name, status = 'ACTIVE' }) => {
  const [result] = await db.query(
    'INSERT INTO categories (name, status) VALUES (?, ?)',
    [name, status]
  );
  return getCategoryById(result.insertId);
};

const updateCategory = async (id, { name, status }) => {
  const fields = [];
  const values = [];

  if (name   !== undefined) { fields.push('name = ?');   values.push(name);   }
  if (status !== undefined) { fields.push('status = ?'); values.push(status); }

  if (fields.length === 0) throw new AppError('No fields to update', 400);

  values.push(id);
  await db.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);
  return getCategoryById(id);
};

const deleteCategory = async (id) => {
  await getCategoryById(id);
  await db.query("UPDATE categories SET status = 'INACTIVE' WHERE id = ?", [id]);
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
