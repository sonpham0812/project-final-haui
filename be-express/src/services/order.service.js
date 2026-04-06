const db = require("../config/db");
const AppError = require("../utils/AppError");
const { calculateShippingFee } = require("../utils/shipping");

// ----------------------------------------------------------------
// Create order from current cart
// ----------------------------------------------------------------
const createOrder = async (userId, { address, phone, selectedItemIds }) => {
  if (!selectedItemIds || selectedItemIds.length === 0) {
    throw new AppError("No items selected", 400);
  }
  // 1. Get cart items
  const [cartRows] = await db.query("SELECT id FROM cart WHERE user_id = ?", [
    userId,
  ]);
  if (cartRows.length === 0) throw new AppError("Cart is empty", 400);

  const cartId = cartRows[0].id;

  const [items] = await db.query(
    `SELECT ci.id, ci.product_id, ci.quantity, p.price, p.stock, p.status, p.name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ? AND ci.id IN (?)`,
    [cartId, selectedItemIds],
  );

  if (items.length === 0) throw new AppError("Cart is empty", 400);
  if (items.length !== selectedItemIds.length) {
    throw new AppError("Some items are invalid", 400);
  }

  // 3. Calculate amounts
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = calculateShippingFee(subtotal);
  const totalAmount = subtotal + shippingFee;

  // 4. Persist inside a transaction
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const item of items) {
      const [[product]] = await conn.query(
        "SELECT stock, status FROM products WHERE id = ? FOR UPDATE",
        [item.product_id],
      );

      if (product.status === "INACTIVE") {
        throw new AppError(
          `Product "${item.name}" is no longer available`,
          400,
        );
      }

      if (item.quantity > product.stock) {
        throw new AppError(`Insufficient stock for "${item.name}"`, 400);
      }
    }
    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, total_amount, shipping_fee, address, phone, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [userId, totalAmount, shippingFee, address, phone],
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price],
      );
      await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [
        item.quantity,
        item.product_id,
      ]);
    }

    // 5. Clear cart
    await conn.query("DELETE FROM cart_items WHERE cart_id = ? AND id IN (?)", [
      cartId,
      selectedItemIds,
    ]);

    await conn.commit();
    return getOrderById(orderId, userId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// ----------------------------------------------------------------
// User: list own orders
// ----------------------------------------------------------------
const getUserOrders = async (userId, { status, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const params = [userId];
  let where = "WHERE user_id = ?";

  if (status) {
    where += " AND status = ?";
    params.push(status);
  }

  const [rows] = await db.query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset],
  );
  return rows;
};

// ----------------------------------------------------------------
// Get single order (with items) — enforces ownership for users
// ----------------------------------------------------------------
const getOrderById = async (orderId, userId = null) => {
  const params = [orderId];
  let sql = "SELECT * FROM orders WHERE id = ?";
  if (userId) {
    sql += " AND user_id = ?";
    params.push(userId);
  }

  const [orders] = await db.query(sql, params);
  if (orders.length === 0) throw new AppError("Order not found", 404);

  const [items] = await db.query(
    `SELECT oi.*, p.name, p.image, p.thumbnail_image, p.brand
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?`,
    [orderId],
  );

  return { ...orders[0], items };
};

// ----------------------------------------------------------------
// User: cancel order (only PENDING allowed)
// ----------------------------------------------------------------
const cancelOrder = async (orderId, userId) => {
  const [rows] = await db.query(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [orderId, userId],
  );
  if (rows.length === 0) throw new AppError("Order not found", 404);

  const order = rows[0];
  if (order.status !== "PENDING") {
    throw new AppError("Only PENDING orders can be cancelled", 400);
  }

  // Restore stock
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("UPDATE orders SET status = 'CANCELED' WHERE id = ?", [
      orderId,
    ]);

    const [items] = await conn.query(
      "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
      [orderId],
    );
    for (const item of items) {
      await conn.query("UPDATE products SET stock = stock + ? WHERE id = ?", [
        item.quantity,
        item.product_id,
      ]);
    }

    await conn.commit();
    return getOrderById(orderId, userId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// ----------------------------------------------------------------
// Admin: list all orders (with optional status filter)
// ----------------------------------------------------------------
const adminGetOrders = async ({ page = 1, limit = 20, status }) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "WHERE 1=1";

  if (status) {
    where += " AND o.status = ?";
    params.push(status);
  }

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM orders o ${where}`,
    params,
  );

  const [rows] = await db.query(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset],
  );

  return { total, page: Number(page), limit: Number(limit), data: rows };
};

// ----------------------------------------------------------------
// Admin: update order status with valid transitions
// ----------------------------------------------------------------
const VALID_TRANSITIONS = {
  PENDING: ["CONFIRMED"],
  CONFIRMED: ["COMPLETED"],
};

const adminUpdateStatus = async (orderId, newStatus) => {
  const [rows] = await db.query("SELECT * FROM orders WHERE id = ?", [orderId]);
  if (rows.length === 0) throw new AppError("Order not found", 404);

  const current = rows[0].status;
  const allowed = VALID_TRANSITIONS[current] || [];

  if (!allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot transition from ${current} to ${newStatus}. Allowed: ${allowed.join(", ") || "none"}`,
      400,
    );
  }

  await db.query("UPDATE orders SET status = ? WHERE id = ?", [
    newStatus,
    orderId,
  ]);
  return getOrderById(orderId);
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  adminGetOrders,
  adminUpdateStatus,
};
