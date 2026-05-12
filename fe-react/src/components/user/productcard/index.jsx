import { Card } from "antd";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../constant";

const Product = (props) => {
  const { category, image, brand, name, price, discount, id, soldCount } =
    props;
  const realPrice = (price * (100 - discount)) / 100;
  const navigate = useNavigate();
  const onClick = () => {
    navigate(`/product-details/${id}`);
  };

  return (
    <Card
      hoverable
      className="product-card"
      cover={
        <div className="product-cover">
          <div className="product-tag">{category}</div>
          <img
            draggable={false}
            alt={name}
            src={image}
            className="product-image"
          />
        </div>
      }
      onClick={onClick}
    >
      <div className="brand">
        Thương hiệu: <span>{brand}</span>
      </div>

      <div className="title">{name}</div>

      <div className="price">
        <span className="old-price">{formatPrice(price)}</span>
        <span className="new-price">{formatPrice(realPrice)}</span>
        <span className="discount">{`(${discount}%)`}</span>
      </div>

      {soldCount !== undefined && (
        <div className="sold-count">
          Đã bán: {soldCount.toLocaleString("vi-VN")}
        </div>
      )}
    </Card>
  );
};

export default Product;
