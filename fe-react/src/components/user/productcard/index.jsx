import { Card } from "antd";
import "./Product.scss";
import { useNavigate } from "react-router-dom";

const Product = (props) => {
  const { category, image, brand, name, price, discount, id } = props;
  const realPrice = (price * (100 - discount)) / 100;
  const navigate = useNavigate();
  const onClick = () => {
    navigate(`/product/${id}`);
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
        Brand: <span>{brand}</span>
      </div>

      <div className="title">{name}</div>

      <div className="price">
        <span className="old-price">{price}</span>
        <span className="new-price">{realPrice.toFixed(2)}</span>
        <span className="discount">{`(${discount})`}</span>
      </div>
    </Card>
  );
};

export default Product;