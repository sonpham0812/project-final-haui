const db = require("../config/db");
const AppError = require("../utils/AppError");
const { calculateShippingFee } = require("../utils/shipping");

// ----------------------------------------------------------------
// Generate unique order_code: VN + 6 random digits
// ----------------------------------------------------------------
const generateOrderCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    const digits = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
    code = `VN${digits}`;
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) AS count FROM orders WHERE order_code = ?",
      [code],
    );
    exists = count > 0;
  }
  return code;
};

// ----------------------------------------------------------------
// Create order from current cart
// ----------------------------------------------------------------
const createOrder = async (
  userId,
  { address, phone, name, selectedItemIds },
) => {
  if (!selectedItemIds || selectedItemIds.length === 0) {
    throw new AppError("No items selected", 400);
  }

  // 1. Lấy cart_id của user (tạo nếu chưa có)
  let [cartRows] = await db.query("SELECT id FROM cart WHERE user_id = ?", [
    userId,
  ]);
  if (cartRows.length === 0) {
    const [inserted] = await db.query("INSERT INTO cart (user_id) VALUES (?)", [
      userId,
    ]);
    cartRows = [{ id: inserted.insertId }];
  }
  const cartId = cartRows[0].id;

  // 2. Lấy các items được chọn từ cart của user
  const placeholders = selectedItemIds.map(() => "?").join(", ");
  const [items] = await db.query(
    `SELECT ci.product_id, ci.quantity, p.price, p.stock, p.status, p.name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ? AND ci.product_id IN (${placeholders})`,
    [cartId, ...selectedItemIds],
  );

  if (items.length === 0) {
    throw new AppError("Không tìm thấy sản phẩm trong giỏ hàng", 400);
  }
  if (items.length !== selectedItemIds.length) {
    throw new AppError(
      "Một số sản phẩm không hợp lệ hoặc đã bị xóa khỏi giỏ hàng",
      400,
    );
  }

  // 3. Calculate amounts
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = calculateShippingFee(subtotal);
  const totalAmount = subtotal + shippingFee;
  const orderCode = await generateOrderCode();

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
      `INSERT INTO orders (order_code, user_id, name, total_amount, shipping_fee, address, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [orderCode, userId, name, totalAmount, shippingFee, address, phone],
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price],
      );
      await conn.query(
        "UPDATE products SET stock = stock - ?, sold_count = sold_count + ? WHERE id = ?",
        [item.quantity, item.quantity, item.product_id],
      );
    }

    // 5. Clear cart
    const delPlaceholders = selectedItemIds.map(() => "?").join(", ");
    await conn.query(
      `DELETE FROM cart_items WHERE cart_id = ? AND product_id IN (${delPlaceholders})`,
      [cartId, ...selectedItemIds],
    );

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
// User: count orders grouped by status
// ----------------------------------------------------------------
const getUserOrderCounts = async (userId) => {
  const [rows] = await db.query(
    `SELECT status, COUNT(*) AS count
       FROM orders
      WHERE user_id = ?
      GROUP BY status`,
    [userId],
  );

  const result = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELED: 0 };
  rows.forEach(({ status, count }) => {
    if (result[status] !== undefined) result[status] = Number(count);
  });
  return result;
};

// ----------------------------------------------------------------
// User: list own orders
// ----------------------------------------------------------------
const getUserOrders = async (userId, { status, page = 1, limit = 5 } = {}) => {
  const offset = (page - 1) * Number(limit);
  const params = [userId];
  let where = "WHERE o.user_id = ?";

  if (status) {
    where += " AND o.status = ?";
    params.push(status);
  }

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM orders o ${where}`,
    params,
  );

  const [rows] = await db.query(
    `SELECT o.* FROM orders o ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset],
  );

  if (rows.length > 0) {
    const orderIds = rows.map((r) => r.id);
    const itemPlaceholders = orderIds.map(() => "?").join(", ");
    const [items] = await db.query(
      `SELECT oi.*, p.name, p.thumbnail_image
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id IN (${itemPlaceholders})`,
      orderIds,
    );
    const itemsByOrder = {};
    items.forEach((item) => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    });
    rows.forEach((row) => {
      row.items = itemsByOrder[row.id] || [];
    });
  }

  return {
    data: rows,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  };
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
    `SELECT oi.*, p.name, p.thumbnail_image, p.brand
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
  getUserOrderCounts,
  getOrderById,
  cancelOrder,
  adminGetOrders,
  adminUpdateStatus,
};
