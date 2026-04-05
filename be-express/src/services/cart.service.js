const db = require("../config/db");
const AppError = require("../utils/AppError");

// ----------------------------------------------------------------
// Ensure a cart row exists for this user; return cart id
// ----------------------------------------------------------------
const ensureCart = async (userId) => {
  const [rows] = await db.query("SELECT id FROM cart WHERE user_id = ?", [
    userId,
  ]);
  if (rows.length > 0) return rows[0].id;

  const [result] = await db.query("INSERT INTO cart (user_id) VALUES (?)", [
    userId,
  ]);
  return result.insertId;
};

// ----------------------------------------------------------------
// Get full cart (with product details)
// ----------------------------------------------------------------
const getCart = async (userId) => {
  const cartId = await ensureCart(userId);

  const [items] = await db.query(
    `SELECT ci.product_id, ci.quantity,
            p.name, p.brand, p.price, p.discount_percentage,
            p.images, p.thumbnail_image, p.stock, p.status
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?`,
    [cartId],
  );

  return { cart_id: cartId, items };
};

// ----------------------------------------------------------------
// Add item to cart (or increase quantity)
// ----------------------------------------------------------------
const addToCart = async (userId, { product_id, quantity }) => {
  if (quantity < 1) throw new AppError("Quantity must be at least 1", 400);

  const [prod] = await db.query(
    "SELECT id, stock, status FROM products WHERE id = ?",
    [product_id],
  );
  if (prod.length === 0) throw new AppError("Product not found", 404);
  if (prod[0].status === "INACTIVE")
    throw new AppError("Product is unavailable", 400);

  const cartId = await ensureCart(userId);

  const [existing] = await db.query(
    "SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cartId, product_id],
  );

  if (existing.length > 0) {
    const newQty = existing[0].quantity + quantity;
    if (newQty > prod[0].stock)
      throw new AppError("Exceeds available stock", 400);
    await db.query(
      "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
      [newQty, cartId, product_id],
    );
  } else {
    if (quantity > prod[0].stock)
      throw new AppError("Exceeds available stock", 400);
    await db.query(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
      [cartId, product_id, quantity],
    );
  }

  return getCart(userId);
};

// ----------------------------------------------------------------
// Update quantity of an item in cart
// ----------------------------------------------------------------
const updateCartItem = async (userId, { product_id, quantity }) => {
  if (quantity < 1) throw new AppError("Quantity must be at least 1", 400);

  const cartId = await ensureCart(userId);

  const [existing] = await db.query(
    "SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cartId, product_id],
  );
  if (existing.length === 0) throw new AppError("Item not in cart", 404);

  const [prod] = await db.query("SELECT stock FROM products WHERE id = ?", [
    product_id,
  ]);
  if (quantity > prod[0].stock)
    throw new AppError("Exceeds available stock", 400);

  await db.query(
    "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
    [quantity, cartId, product_id],
  );

  return getCart(userId);
};

// ----------------------------------------------------------------
// Remove a single item from cart
// ----------------------------------------------------------------
const removeFromCart = async (userId, product_id) => {
  const cartId = await ensureCart(userId);
  await db.query(
    "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cartId, product_id],
  );
  return getCart(userId);
};

// ----------------------------------------------------------------
// Clear entire cart (remove all items)
// ----------------------------------------------------------------
const clearCart = async (userId) => {
  const cartId = await ensureCart(userId);
  await db.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
  return getCart(userId);
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
