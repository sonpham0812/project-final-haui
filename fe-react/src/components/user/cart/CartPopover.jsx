import { Button } from "antd";
import "./index.scss";

const CartPopover = ({ onViewCart, cartItems }) => {
  const items = cartItems?.slice(0, 10) ?? [];

  return (
    <div className="cart-modal">
      {items?.length === 0 ? (
        <p className="empty">Giỏ hàng của bạn đang trống.</p>
      ) : (
        <div>
          <h4 className="title">Sản Phẩm Mới Thêm</h4>

          <div className="items">
            {items?.map((item, index) => (
              <div className="item" key={index}>
                <img src={item.image} alt={item.name} className="item-img" />
                <div className="info">
                  <p className="name">{item.name}</p>
                  <p className="price">
                    {item.price.toLocaleString("vi-VN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                    ₫
                  </p>
                </div>
              </div>
            ))}
          </div>

          {cartItems?.length > 10 && (
            <p className="more">và {cartItems.length - 10} sản phẩm khác...</p>
          )}

          <Button
            type="primary"
            block
            style={{ marginTop: 10 }}
            onClick={onViewCart}
          >
            Xem Giỏ Hàng
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPopover;
