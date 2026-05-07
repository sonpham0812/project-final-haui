import { Button, Flex, Table, Spin, Empty, Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import { userCartServices } from "../../../api";

// Format VNĐ currency
const formatVND = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);
};

// Tính giá sau khi giảm
const getDiscountedPrice = (price, discountPercentage) => {
  if (!discountPercentage) return price;
  return Math.round(price * (1 - discountPercentage / 100));
};

const CartPage = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ----- Fetch cart items -----
  const getCartItems = async () => {
    try {
      setLoading(true);
      const response = await userCartServices.getCart();
      setCartItems(response?.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCartItems();
  }, []);

  // ----- Update quantity -----
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await userCartServices.updateCartItem({
        product_id: productId,
        quantity: newQuantity,
      });
      await getCartItems();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // ----- Remove item from cart -----
  const handleRemoveItem = async (productId) => {
    try {
      await userCartServices.removeFromCart(productId);
      setSelectedItems(selectedItems.filter((id) => id !== productId));
      await getCartItems();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // ----- Clear entire cart -----
  const handleClearCart = () => {
    Modal.confirm({
      title: "Xoá giỏ hàng",
      content:
        "Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng không?",
      okText: "Có",
      cancelText: "Không",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await userCartServices.clearCart();
          setSelectedItems([]);
          await getCartItems();
        } catch (error) {
          console.error("Error clearing cart:", error);
        }
      },
    });
  };

  // ----- Go to checkout -----
  const handleCheckout = () => {
    const selected = cartItems.filter((item) =>
      selectedItems.includes(item.product_id),
    );
    localStorage.setItem("checkout_items", JSON.stringify(selected));
    navigate("/checkout");
  };

  // ----- Select rows -----
  const rowSelection = {
    selectedRowKeys: selectedItems,
    onChange: (selectedRowKeys) => {
      setSelectedItems(selectedRowKeys);
    },
  };

  // ----- Table Columns -----
  const columns = [
    {
      title: "S.N.",
      dataIndex: "sn",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
    },
    {
      title: "Ảnh",
      dataIndex: "thumbnail_image",
      render: (thumbnail_image, record) => {
        return (
          <img
            src={thumbnail_image}
            alt={record.name}
            style={{ height: 50, objectFit: "cover" }}
          />
        );
      },
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      render: (price, record) =>
        formatVND(getDiscountedPrice(price, record.discount_percentage)),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (quantity, record) => (
        <Flex align="center" gap={10}>
          <Button
            size="small"
            onClick={() =>
              handleUpdateQuantity(record.product_id, quantity - 1)
            }
          >
            -
          </Button>
          <span>{quantity}</span>
          <Button
            size="small"
            onClick={() =>
              handleUpdateQuantity(record.product_id, quantity + 1)
            }
          >
            +
          </Button>
        </Flex>
      ),
    },
    {
      title: "Tổng giá",
      render: (_, record) =>
        formatVND(
          getDiscountedPrice(record.price, record.discount_percentage) *
            record.quantity,
        ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Button
          type="link"
          danger
          onClick={() => handleRemoveItem(record.product_id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  // ----- Total Amount -----
  const totalAmount = cartItems
    .filter((item) => selectedItems.includes(item.product_id))
    .reduce(
      (sum, item) =>
        sum +
        getDiscountedPrice(item.price, item.discount_percentage) *
          item.quantity,
      0,
    );

  if (loading) return <Spin />;
  if (cartItems.length === 0)
    return <Empty description="Không có sản phẩm nào trong giỏ hàng" />;

  return (
    <div className="cart-page">
      <div className="cart-box">
        <Table
          rowKey="product_id"
          dataSource={cartItems}
          columns={columns}
          pagination={false}
          rowSelection={rowSelection}
        />

        <div className="cart-bottom">
          <Button danger onClick={handleClearCart}>
            🗑 Xóa tất cả sản phẩm
          </Button>

          <div className="total-section">
            Tổng ({selectedItems.length} đã chọn):{" "}
            <span className="total-price">{formatVND(totalAmount)}</span>
            <Button
              type="primary"
              size="large"
              className="checkout-btn"
              disabled={selectedItems.length === 0}
              onClick={handleCheckout}
            >
              Mua Ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
