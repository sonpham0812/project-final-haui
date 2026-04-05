import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Rate, Tag, InputNumber, Spin } from "antd";
import { ShoppingCartOutlined, HeartOutlined } from "@ant-design/icons";
import { adminProductServices } from "../../../../api";
import "./index.scss";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await adminProductServices.getProductById(id);
        setProduct(res);
        setMainImage(res.thumbnail || res.images?.[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);


  if (!product) return null;

  const finalPrice = (
    Number(product.price) *
    (1 - Number(product.discount_percentage) / 100)
  );

 return (
    <Spin
      tip="Loading product details..."
      size="large"
      spinning={loading}
    >
      <div className="product-wrapper">
        <div className="product-page">
          <div className="left">
            <div className="main-image">
              <img src={mainImage} alt="product" draggable={false} />
            </div>

            <div className="image-list">
              {product.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  className={`thumb ${mainImage === img ? "active" : ""}`}
                  onClick={() => setMainImage(img)}
                  alt="thumb"
                  draggable={false}
                />
              ))}
            </div>
          </div>

          <div className="right">
            <h2>{product.name}</h2>

            <p className="sub">{product.description}</p>

            <div className="info">
              <span>{`Rating: ${product.rating ?? 1}`}</span>
              {/* <span>{`Brand: ${product.brand}`}</span> */}
              <span>{`Category: ${product.category_name}`}</span>
            </div>

            <div className="price-box">
              <div className="line old">{product.price}</div>

              <div className="line">
                <span className="new">{Number(finalPrice)}</span>
                <span className="discount">{`${product.discount_percentage}% OFF`}</span>
              </div>
            </div>

            <div className="quantity-box">
              <span>{`Quantity: ${product.stock}`}</span>
            </div>

          </div>
        </div>
      </div>
    </Spin>
  );
};

export default ProductDetail;
