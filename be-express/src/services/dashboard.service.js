const db = require("../config/db");

const getDashboard = async () => {
  // ── Aggregate counts ──────────────────────────────────────────
  const [[{ total_orders }]] = await db.query(
    "SELECT COUNT(*) AS total_orders FROM orders",
  );
  const [[{ total_revenue }]] = await db.query(
    "SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status = 'COMPLETED'",
  );
  const [[{ total_users }]] = await db.query(
    "SELECT COUNT(*) AS total_users FROM users",
  );
  const [[{ total_products }]] = await db.query(
    "SELECT COUNT(*) AS total_products FROM products",
  );

  // ── Orders by status ──────────────────────────────────────────
  const [statusRows] = await db.query(
    `SELECT status, COUNT(*) AS cnt FROM orders GROUP BY status`,
  );
  const orders_by_status = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    canceled: 0,
  };
  statusRows.forEach(({ status, cnt }) => {
    orders_by_status[status.toLowerCase()] = cnt;
  });

  // ── Revenue by month (last 12 months) ─────────────────────────
  const [revenueRows] = await db.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
            SUM(total_amount) AS revenue
       FROM orders
      WHERE status = 'COMPLETED'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month ASC`,
  );
  const revenue_by_month = revenueRows.map(({ month, revenue }) => ({
    month,
    revenue: Number(revenue),
  }));

  // ── Top 10 selling products ────────────────────────────────────
  const [topRows] = await db.query(
    `SELECT
        oi.product_id,
        p.name,
        p.thumbnail_image,
        c.name AS category_name,
        SUM(oi.quantity)            AS total_sold,
        SUM(oi.quantity * oi.price) AS revenue
       FROM order_items oi
       JOIN orders   o ON o.id  = oi.order_id
       JOIN products p ON p.id  = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE o.status = 'COMPLETED'
      GROUP BY oi.product_id, p.name, p.thumbnail_image, c.name
      ORDER BY total_sold DESC
      LIMIT 10`,
  );
  const top_selling_products = topRows.map(
    ({
      product_id,
      name,
      thumbnail_image,
      category_name,
      total_sold,
      revenue,
    }) => ({
      product_id,
      name,
      thumbnail_image,
      category_name: category_name || "",
      total_sold: Number(total_sold),
      revenue: Number(revenue),
    }),
  );

  return {
    total_orders: Number(total_orders),
    total_revenue: Number(total_revenue),
    total_users: Number(total_users),
    total_products: Number(total_products),
    orders_by_status,
    revenue_by_month,
    top_selling_products,
  };
};

module.exports = { getDashboard };
