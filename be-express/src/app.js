require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("node:path");

const { authenticate, authorize } = require("./middlewares/auth.middleware");
const errorHandler = require("./middlewares/error.middleware");

// Route modules
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");
const uploadRoutes = require("./routes/upload.routes");
const reviewRoutes = require("./routes/review.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// ── Global middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static files: serve uploaded images ──────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Public routes ─────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);

// ── Upload route (authenticated) ─────────────────────────────────
app.use("/upload", authenticate, uploadRoutes);

// ── Authenticated USER routes ─────────────────────────────────────
app.use("/cart", authenticate, cartRoutes);
app.use("/orders", authenticate, orderRoutes);
app.use("/me", authenticate, userRoutes);

// ── Review routes ─────────────────────────────────────────────────
app.use("/", reviewRoutes);

// ── Authenticated ADMIN routes ────────────────────────────────────
app.use("/admin", authenticate, authorize("ADMIN"), adminRoutes);

// ── Health check ──────────────────────────────────────────────────
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
