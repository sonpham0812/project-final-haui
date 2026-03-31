const db       = require('../config/db');
const AppError = require('../utils/AppError');

const getCategories = async () => {
  const [rows] = await db.query('SELECT * FROM categories ORDER BY id ASC');
  return rows;
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
