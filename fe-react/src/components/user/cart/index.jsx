import { Badge, Popover } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import CartPopover from "./CartPopover";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

const CartIcon = () => {
  const { cartItems, cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <Popover
      placement="bottomRight"
      trigger="hover"
      overlayClassName="cart-popover"
      content={
        <CartPopover
          cartItems={cartItems}
          onViewCart={() => navigate("/cart")}
        />
      }
    >
      <div style={{ cursor: "pointer" }} onClick={() => navigate("/cart")}>
        <Badge count={cartCount} showZero>
          <ShoppingCartOutlined style={{ fontSize: 26, color: "#fff" }} />
        </Badge>
      </div>
    </Popover>
  );
};

export default CartIcon;
