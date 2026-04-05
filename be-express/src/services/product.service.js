const db       = require('../config/db');
const AppError = require('../utils/AppError');

// ----------------------------------------------------------------
// Public: list products (paginated + filters)
// ----------------------------------------------------------------
const getProducts = async ({
  page = 1,
  limit = 12,
  category_id,
  search,
  min_price,
  max_price,
  min_discount,
  sort_by = 'newest',
}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "WHERE p.status = 'ACTIVE'";

  if (category_id) {
    where += ' AND p.category_id = ?';
    params.push(category_id);
  }

  if (search) {
    where += ' AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (min_price) {
    where += ' AND p.price >= ?';
    params.push(Number(min_price));
  }

  if (max_price) {
    where += ' AND p.price <= ?';
    params.push(Number(max_price));
  }

  if (min_discount) {
    where += ' AND p.discount_percentage >= ?';
    params.push(Number(min_discount));
  }

  // Sort options
  let orderBy = 'p.created_at DESC';
  if (sort_by === 'price-asc') {
    orderBy = 'p.price ASC';
  } else if (sort_by === 'price-desc') {
    orderBy = 'p.price DESC';
  } else if (sort_by === 'discount') {
    orderBy = 'p.discount_percentage DESC';
  } else if (sort_by === 'name') {
    orderBy = 'p.name ASC';
  }

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM products p ${where}`,
    params
  );

  const [rows] = await db.query(
    `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
     ${where}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  return { total, page: Number(page), limit: Number(limit), data: rows };
};

// ----------------------------------------------------------------
// Public: product detail
// ----------------------------------------------------------------
const getProductById = async (id) => {
  const [rows] = await db.query(
    `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ? AND p.status = 'ACTIVE'`,
    [id]
  );
  if (rows.length === 0) throw new AppError('Product not found', 404);
  return rows[0];
};

// ----------------------------------------------------------------
// Admin: list ALL products (including inactive)
// ----------------------------------------------------------------
const adminGetProducts = async ({
  page = 1,
  limit = 12,
  category_id,
  search,
  min_price,
  max_price,
  min_discount,
  status,
  sort_by = 'newest',
}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (category_id) {
    where += ' AND p.category_id = ?';
    params.push(category_id);
  }

  if (search) {
    where += ' AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (min_price) {
    where += ' AND p.price >= ?';
    params.push(Number(min_price));
  }

  if (max_price) {
    where += ' AND p.price <= ?';
    params.push(Number(max_price));
  }

  if (min_discount) {
    where += ' AND p.discount_percentage >= ?';
    params.push(Number(min_discount));
  }

  if (status) {
    where += ' AND p.status = ?';
    params.push(status.toUpperCase());
  }

  // Sort options
  let orderBy = 'p.created_at DESC';
  if (sort_by === 'price-asc') {
    orderBy = 'p.price ASC';
  } else if (sort_by === 'price-desc') {
    orderBy = 'p.price DESC';
  } else if (sort_by === 'discount') {
    orderBy = 'p.discount_percentage DESC';
  } else if (sort_by === 'name') {
    orderBy = 'p.name ASC';
  }

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM products p ${where}`,
    params
  );

  const [rows] = await db.query(
    `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
     ${where}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  return { total, page: Number(page), limit: Number(limit), data: rows };
};

// ----------------------------------------------------------------
// Admin: create product
// ----------------------------------------------------------------
const createProduct = async (data) => {
  const {
    name, brand, price, description, thumbnail_image, images,
    discount_percentage = 0, category_id, stock = 0, status = 'ACTIVE',
  } = data;

  const imagesJson = Array.isArray(images) ? JSON.stringify(images) : null;

  const [result] = await db.query(
    `INSERT INTO products
       (name, brand, price, description, thumbnail_image, images,
        discount_percentage, category_id, stock, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, brand, price, description, thumbnail_image, imagesJson,
     discount_percentage, category_id, stock, status]
  );

  return getProductById(result.insertId).catch(() =>
    adminGetProductById(result.insertId)
  );
};

const adminGetProductById = async (id) => {
  const [rows] = await db.query(
    `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?`,
    [id]
  );
  if (rows.length === 0) throw new AppError('Product not found', 404);
  return rows[0];
};

// ----------------------------------------------------------------
// Admin: update product
// ----------------------------------------------------------------
const updateProduct = async (id, data) => {
  const fields = [];
  const values = [];

  const allowed = [
    'name', 'brand', 'price', 'description', 'thumbnail_image', 'images',
    'discount_percentage', 'category_id', 'stock', 'status',
  ];

  allowed.forEach((key) => {
    if (data[key] !== undefined) {
      let value = data[key];
      // Convert images array to JSON string
      if (key === 'images' && Array.isArray(value)) {
        value = JSON.stringify(value);
      }
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) throw new AppError('No fields to update', 400);

  values.push(id);
  await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
  return adminGetProductById(id);
};

// ----------------------------------------------------------------
// Admin: soft-delete (set INACTIVE) or hard delete
// ----------------------------------------------------------------
const deleteProduct = async (id) => {
  await db.query("UPDATE products SET status = 'INACTIVE' WHERE id = ?", [id]);
};

module.exports = {
  getProducts,
  getProductById,
  adminGetProducts,
  adminGetProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
