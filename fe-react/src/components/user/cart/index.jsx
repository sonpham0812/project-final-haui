import { Badge, Popover } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import CartPopover from "./CartPopover";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userCartServices } from "../../../api";

const CartIcon = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const getCartItems = async () => {
    const cart = await userCartServices.getCart();
    setCartItems(cart.items);
  };

  useEffect(() => {
    getCartItems();
  }, []);

  const handleGoToCart = () => {
    navigate("/cart");
  };

  return (
    <Popover
      placement="bottomRight"
      trigger="hover"
      overlayClassName="cart-popover"
      content={
        <CartPopover cartItems={cartItems} onViewCart={handleGoToCart} />
      }
    >
      <div style={{ cursor: "pointer" }} onClick={handleGoToCart}>
        <Badge count={cartItems?.length} showZero>
          <ShoppingCartOutlined style={{ fontSize: 26, color: "#fff" }} />
        </Badge>
      </div>
    </Popover>
  );
};

export default CartIcon;
