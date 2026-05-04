const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const db = require("../config/db");
const AppError = require("../utils/AppError");

// ----------------------------------------------------------------
// Register
// ----------------------------------------------------------------
const register = async ({ name, email, password }) => {
  const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  if (rows.length > 0) throw new AppError("Email already in use", 409);

  const hashed = await bcrypt.hash(password, 12);

  const [result] = await db.query(
    "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
    [name, email, hashed, "USER", "ACTIVE"],
  );

  return { id: result.insertId, name, email, role: "USER" };
};

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

const signRefreshToken = (userId) =>
  jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    },
  );

// ----------------------------------------------------------------
// Login
// ----------------------------------------------------------------
const login = async ({ email, password }) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) throw new AppError("Invalid credentials", 401);

  const user = rows[0];
  if (user.status === "BLOCKED") throw new AppError("Account is blocked", 403);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError("Invalid credentials", 401);

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const access_token = signAccessToken(payload);
  const refresh_token = signRefreshToken(user.id);

  // Lưu refresh token vào DB (hash để bảo mật)
  const tokenHash = crypto
    .createHash("sha256")
    .update(refresh_token)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), expires_at = VALUES(expires_at)`,
    [user.id, tokenHash, expiresAt],
  );

  return { access_token, refresh_token };
};

// ----------------------------------------------------------------
// Refresh
// ----------------------------------------------------------------
const refresh = async (refreshToken) => {
  if (!refreshToken) throw new AppError("Refresh token required", 401);

  // Xác minh chữ ký JWT
  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
    );
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // Kiểm tra token có trong DB không (chưa bị logout/revoke)
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const [rows] = await db.query(
    "SELECT * FROM refresh_tokens WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()",
    [decoded.id, tokenHash],
  );
  if (rows.length === 0)
    throw new AppError("Refresh token revoked or expired", 401);

  // Lấy thông tin user mới nhất
  const [[user]] = await db.query(
    "SELECT id, name, email, role, status FROM users WHERE id = ?",
    [decoded.id],
  );
  if (!user || user.status === "BLOCKED")
    throw new AppError("Account is blocked", 403);

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const access_token = signAccessToken(payload);

  return { access_token };
};

// ----------------------------------------------------------------
// Logout — revoke refresh token
// ----------------------------------------------------------------
const logout = async (refreshToken) => {
  if (!refreshToken) return;
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  await db.query("DELETE FROM refresh_tokens WHERE token_hash = ?", [
    tokenHash,
  ]);
};

module.exports = { register, login, refresh, logout };
