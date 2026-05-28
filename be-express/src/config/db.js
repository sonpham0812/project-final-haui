const mysql2 = require('mysql2/promise');
require('dotenv').config();

const pool = mysql2.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  port:              parseInt(process.env.DB_PORT || '3306'),
  user:              process.env.DB_USER     || 'root',
  password:          process.env.DB_PASSWORD || '',
  database:          process.env.DB_NAME     || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit:   10,
  queueLimit:        0,
  charset:           'utf8mb4',
  // Đảm bảo mỗi connection đều dùng utf8mb4 - quan trọng cho tiếng Việt
  // Đặc biệt cần thiết khi deploy trên Railway
});

// Chạy SET NAMES ngay khi mỗi connection mới được tạo
// Đây là cách chắc chắn nhất để đảm bảo charset đúng với mysql2
pool.pool.on('connection', (connection) => {
  connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
});

module.exports = pool;
