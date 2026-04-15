import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, InputNumber, Spin, message } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import "./index.scss";
import { publicProductServices, userCartServices } from "../../../api";
import useAuth from "../../../hooks/useAuth";

const ProductDetailUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await publicProductServices.getProductDetails(id);
        setProduct(res);
        const defaultImg = res.thumbnail_image || res.images?.[0] || "";
        setMainImage(defaultImg);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return null;

  const finalPrice =
    Number(product.price) * (1 - Number(product.discount_percentage) / 100);

  const images = [
    ...(product.thumbnail_image ? [product.thumbnail_image] : []),
    ...(product.images || []).filter((img) => img !== product.thumbnail_image),
  ];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: `/product-details/${id}` }, // ✅ NEW
      });
      return;
    }

    try {
      await userCartServices.addToCart({
        product_id: product.id,
        quantity: quantity,
      });

      message.success("Đã thêm vào giỏ hàng!");

      // ✅ trigger cho CartIcon reload
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Add to cart failed:", error);
      message.error("Thêm vào giỏ hàng thất bại!");
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: `/product-details/${id}` },
      });
      return;
    }

    await handleAddToCart();
    navigate("/cart"); // 👉 sửa nếu route khác
  };

  return (
    <Spin tip="Loading product details..." size="large" spinning={loading}>
      <div className="product-wrapper">
        <div className="product-page">
          {/* LEFT */}
          <div className="left">
            <div className="main-image">
              <img src={mainImage} alt="product" draggable={false} />
            </div>

            <div className="image-list">
              {images?.map((img, index) => (
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

          {/* RIGHT */}
          <div className="right">
            <h2>{product.name}</h2>

            <p className="sub">{product.description}</p>

            <div className="info">
              <span>{`Rating: ${product.rating ?? 1}`}</span>
              <span>{`Category: ${product.category_name}`}</span>
            </div>

            <div className="price-box">
              <div className="line old">
                {Number(product.price).toLocaleString("vi-VN")}₫
              </div>

              <div className="line">
                <span className="new">
                  {Number(finalPrice).toLocaleString("vi-VN")}₫
                </span>
                <span className="discount">
                  {`${product.discount_percentage}% OFF`}
                </span>
              </div>
            </div>

            <div className="quantity-box">
              <span>{`Stock: ${product.stock}`}</span>

              <InputNumber
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)} // ✅ fix bug null
              />
            </div>

            <div className="btn-group">
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>

              <Button type="default" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default ProductDetailUser;
