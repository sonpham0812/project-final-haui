# 🛒 XÂY DỰNG NỀN TẢNG MUA SẮM TRỰC TUYẾN TÍCH HỢP HỆ THỐNG QUẢN TRỊ

---

## 1. Công nghệ

* Frontend: ReactJS
* Backend: NodeJS (Express)
* Database: MySQL

---

## 2. Phân quyền

* USER: Người dùng mua hàng
* ADMIN: Quản trị hệ thống

---

## 3. Database Design

### 3.1 users

* id
* name
* email
* password
* role (USER | ADMIN)
* status (ACTIVE | BLOCKED)
* created_at

---

### 3.2 categories

* id
* name
* status (ACTIVE | INACTIVE)

---

### 3.3 products

* id
* name
* brand
* price
* description
* image
* thumbnail_image
* discount_percentage
* category_id
* stock
* status
* created_at
* updated_at

---

### 3.4 orders

* id
* user_id
* total_amount
* shipping_fee
* address
* phone
* status (PENDING | CONFIRMED | COMPLETED | CANCELED)
* created_at

---

### 3.5 order_items

* id
* order_id
* product_id
* quantity
* price

---

### 3.6 addresses (optional)

* id
* user_id
* address
* phone

---

### 3.7 cart

* id
* user_id

---

### 3.8 cart_items

* cart_id
* product_id
* quantity

---

## 4. Business Logic

### 4.1 Authentication

* Sử dụng JWT
* Login trả về access token
* Middleware kiểm tra token
* Phân quyền theo role

---

### 4.2 Shipping Rule (Mô phỏng)

* Đơn < 500,000 → phí ship = 20,000
* Đơn ≥ 500,000 → freeship

---

### 4.3 Order Flow

1. User thêm sản phẩm vào cart
2. User đặt hàng → tạo order + order_items
3. Order có các trạng thái:

```txt
PENDING     // chờ xác nhận
CONFIRMED   // admin xác nhận
COMPLETED   // hoàn thành (mô phỏng)
CANCELED    // huỷ
```

---

### 4.4 Cancel Order

* USER chỉ được huỷ khi status = PENDING
* Khi huỷ → status = CANCELED

---

### 4.5 Order Processing (Mô phỏng)

* ADMIN cập nhật trạng thái:

  * PENDING → CONFIRMED
  * CONFIRMED → COMPLETED
* (Optional) Có thể tự động chuyển COMPLETED sau 30 phút

---

### 4.6 Revenue (Mô phỏng)

* Doanh thu = tổng `total_amount` của các order có status = COMPLETED

---

## 5. API Design

---

### 5.1 Auth

#### POST /auth/register

👉 Đăng ký

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

---

#### POST /auth/login

👉 Đăng nhập

```json
{
  "email": "string",
  "password": "string"
}
```

Response:

```json
{
  "access_token": "JWT_TOKEN"
}
```

---

## 5.2 User APIs

---

### Products

#### GET /products

👉 Lấy danh sách sản phẩm

Query params:

```txt
page
limit
category_id
search
```

---

#### GET /products/:id

👉 Chi tiết sản phẩm

---

### Cart

#### GET /cart

👉 Lấy giỏ hàng

---

#### POST /cart/add

👉 Thêm sản phẩm

```json
{
  "product_id": 1,
  "quantity": 2
}
```

---

#### PUT /cart/update

👉 Cập nhật số lượng

```json
{
  "product_id": 1,
  "quantity": 3
}
```

---

#### DELETE /cart/remove/:product_id

👉 Xoá sản phẩm

---

### Orders

#### POST /orders

👉 Tạo đơn hàng

```json
{
  "address": "string",
  "phone": "string"
}
```

---

#### GET /orders

👉 Danh sách đơn hàng của user

---

#### GET /orders/:id

👉 Chi tiết đơn hàng

---

#### POST /orders/:id/cancel

👉 Huỷ đơn (chỉ khi PENDING)

---

## 5.3 Admin APIs

---

### Products

#### GET /admin/products

👉 Lấy tất cả sản phẩm (bao gồm inactive)

---

#### POST /admin/products

👉 Tạo sản phẩm

---

#### PUT /admin/products/:id

👉 Cập nhật sản phẩm

---

#### DELETE /admin/products/:id

👉 Xoá / ẩn sản phẩm

---

### Categories

#### GET /admin/categories

👉 Lấy danh mục

---

#### POST /admin/categories

👉 Tạo danh mục

---

#### PUT /admin/categories/:id

👉 Cập nhật danh mục

---

#### DELETE /admin/categories/:id

👉 Xoá danh mục

---

### Orders

#### GET /admin/orders

👉 Lấy tất cả đơn hàng

---

#### GET /admin/orders/:id

👉 Chi tiết đơn

---

#### PUT /admin/orders/:id/status

👉 Cập nhật trạng thái

```json
{
  "status": "CONFIRMED"
}
```

---

### Users

#### GET /admin/users

👉 Danh sách user

---

#### PUT /admin/users/:id/status

👉 Khoá / mở user

---

## 5.4 Dashboard

#### GET /admin/dashboard

👉 Trả về dữ liệu để vẽ chart

```json
{
  "total_orders": 100,
  "total_revenue": 5000000,
  "total_users": 50,
  "total_products": 120,

  "orders_by_status": {
    "pending": 10,
    "confirmed": 20,
    "completed": 60,
    "canceled": 10
  },

  "revenue_by_month": [
    { "month": "2026-01", "revenue": 1000000 },
    { "month": "2026-02", "revenue": 2000000 }
  ],

  "top_selling_products": [
    {
      "product_id": 1,
      "name": "Áo thun",
      "total_sold": 120
    }
  ]
}
```

---

## 6. Dashboard (UI Suggestion)

### Cards:

* Tổng đơn hàng
* Tổng doanh thu
* Tổng user
* Tổng sản phẩm

---

### Charts:

* 📈 Doanh thu theo tháng (Line/Bar)
* 🥧 Đơn hàng theo trạng thái (Pie)
* 📊 Top sản phẩm bán chạy (Bar)

---

## 7. Notes

* Không tích hợp thanh toán thật (COD mô phỏng)
* Không tích hợp vận chuyển thực tế
* Tập trung vào nghiệp vụ chính
* Dashboard và doanh thu mang tính mô phỏng

---
