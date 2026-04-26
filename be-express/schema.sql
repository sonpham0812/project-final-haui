-- ============================================================
-- Ecommerce Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecommerce_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecommerce_db;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  status      ENUM('ACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  name    VARCHAR(100) NOT NULL,
  status  ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE'
);

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(200)   NOT NULL,
  brand                VARCHAR(100)   NOT NULL,
  price                DECIMAL(15, 0) NOT NULL,
  description          TEXT,
  thumbnail_image      VARCHAR(500),
  images               JSON,
  discount_percentage  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  category_id          INT,
  stock                INT            NOT NULL DEFAULT 0,
  sold_count           INT            NOT NULL DEFAULT 0,
  status               ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_code    VARCHAR(20)    NOT NULL UNIQUE,
  user_id       INT            NOT NULL,
  name          VARCHAR(255)   NOT NULL,
  total_amount  DECIMAL(15, 0) NOT NULL,
  shipping_fee  DECIMAL(15, 0) NOT NULL DEFAULT 0,
  address       VARCHAR(500)   NOT NULL,
  phone         VARCHAR(20)    NOT NULL,
  status        ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- order_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT            NOT NULL,
  product_id  INT,
  quantity    INT            NOT NULL,
  price       DECIMAL(15, 0) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- addresses  (optional)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT          NOT NULL,
  address  VARCHAR(500) NOT NULL,
  phone    VARCHAR(20)  NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- cart
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT NOT NULL UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- cart_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  cart_id     INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  PRIMARY KEY (cart_id, product_id),
  FOREIGN KEY (cart_id)    REFERENCES cart(id)     ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
