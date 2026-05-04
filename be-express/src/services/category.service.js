const db = require("../config/db");
const AppError = require("../utils/AppError");

const getCategories = async ({
  page = 1,
  limit = 10,
  search = "",
  onlyActive = false,
} = {}) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (onlyActive) {
    conditions.push("status = 'ACTIVE'");
  }
  if (search) {
    conditions.push("name LIKE ?");
    params.push(`%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM categories ${where} ORDER BY id ASC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await db.query(query, params);

  const countParams = [];
  const countConditions = [];
  if (onlyActive) countConditions.push("status = 'ACTIVE'");
  if (search) {
    countConditions.push("name LIKE ?");
    countParams.push(`%${search}%`);
  }
  const countWhere = countConditions.length
    ? `WHERE ${countConditions.join(" AND ")}`
    : "";
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) as total FROM categories ${countWhere}`,
    countParams,
  );

  return {
    items: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getCategoryById = async (id) => {
  const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
  if (rows.length === 0) throw new AppError("Category not found", 404);
  return rows[0];
};

const createCategory = async ({ name, image = null, status = "ACTIVE" }) => {
  const [result] = await db.query(
    "INSERT INTO categories (name, image, status) VALUES (?, ?, ?)",
    [name, image, status],
  );
  return getCategoryById(result.insertId);
};

const updateCategory = async (id, { name, image, status }) => {
  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
  }
  if (image !== undefined) {
    fields.push("image = ?");
    values.push(image);
  }
  if (status !== undefined) {
    fields.push("status = ?");
    values.push(status);
  }

  if (fields.length === 0) throw new AppError("No fields to update", 400);

  values.push(id);
  await db.query(
    `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
  return getCategoryById(id);
};

const deleteCategory = async (id) => {
  await getCategoryById(id);
  await db.query("UPDATE categories SET status = 'INACTIVE' WHERE id = ?", [
    id,
  ]);
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
