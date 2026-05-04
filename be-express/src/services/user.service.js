const db = require("../config/db");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");

const getUsers = async ({ page = 1, limit = 20, status } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "WHERE 1=1";
  if (status) {
    where += " AND status = ?";
    params.push(status);
  }

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM users ${where}`,
    params,
  );
  const [rows] = await db.query(
    `SELECT id, name, email, role, status, avatar, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset],
  );
  return { total, page: Number(page), limit: Number(limit), data: rows };
};

const updateUserStatus = async (id, status) => {
  const allowed = ["ACTIVE", "BLOCKED"];
  if (!allowed.includes(status))
    throw new AppError("Invalid status value", 400);
  const [rows] = await db.query("SELECT id FROM users WHERE id = ?", [id]);
  if (rows.length === 0) throw new AppError("User not found", 404);
  await db.query("UPDATE users SET status = ? WHERE id = ?", [status, id]);
  const [updated] = await db.query(
    "SELECT id, name, email, role, status, avatar, created_at FROM users WHERE id = ?",
    [id],
  );
  return updated[0];
};

const getMe = async (userId) => {
  const [rows] = await db.query(
    "SELECT id, name, email, role, status, avatar, created_at FROM users WHERE id = ?",
    [userId],
  );
  if (rows.length === 0) throw new AppError("User not found", 404);
  return rows[0];
};

const updateMe = async (userId, { name, avatar }) => {
  const fields = [];
  const values = [];
  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
  }
  if (avatar !== undefined) {
    fields.push("avatar = ?");
    values.push(avatar);
  }
  if (fields.length === 0) throw new AppError("No fields to update", 400);
  values.push(userId);
  await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
  return getMe(userId);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword)
    throw new AppError("currentPassword and newPassword are required", 400);
  if (newPassword.length < 6)
    throw new AppError("New password must be at least 6 characters", 400);
  const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [
    userId,
  ]);
  if (rows.length === 0) throw new AppError("User not found", 404);
  const valid = await bcrypt.compare(currentPassword, rows[0].password);
  if (!valid) throw new AppError("Mật khẩu hiện tại không đúng!", 400);
  const hashed = await bcrypt.hash(newPassword, 12);
  await db.query("UPDATE users SET password = ? WHERE id = ?", [
    hashed,
    userId,
  ]);
  return { success: true };
};

module.exports = {
  getUsers,
  updateUserStatus,
  getMe,
  updateMe,
  changePassword,
};
