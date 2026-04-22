import { Button, Flex, Table, Spin, Empty, Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import { userCartServices } from "../../../api";

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
      title: "Clear Cart",
      content: "Are you sure you want to clear your entire cart?",
      okText: "Yes",
      cancelText: "No",
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
      selectedItems.includes(item.product_id)
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
      title: "Product",
      dataIndex: "name",
    },
    {
      title: "Image",
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
      title: "Unit Price",
      dataIndex: "price",
      render: (price) => `$${price}`,
    },
    {
      title: "Quantity",
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
      title: "Total Price",
      render: (_, record) => `$${record.price * record.quantity}`,
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Button
          type="link"
          danger
          onClick={() => handleRemoveItem(record.product_id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  // ----- Total Amount -----
  const totalAmount = cartItems
    .filter((item) => selectedItems.includes(item.product_id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <Spin />;
  if (cartItems.length === 0) return <Empty description="Cart is empty" />;

  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>

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
            🗑 CLEAR CART
          </Button>

          <div className="total-section">
            Total ({selectedItems.length} selected):{" "}
            <span className="total-price">${totalAmount}</span>
            <Button
              type="primary"
              size="large"
              className="checkout-btn"
              disabled={selectedItems.length === 0}
              onClick={handleCheckout}
            >
              Check Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
