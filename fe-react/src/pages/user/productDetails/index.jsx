import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { publicProductServices, userCartServices } from "../../../api";
import useAuth from "../../../hooks/useAuth";
import ProductDetailContent from "../../../components/productDetail";
import { useCart } from "../../../context/CartContext";
import "./index.scss";

const ProductDetailUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicProductServices
      .getProductDetails(id)
      .then((res) => setProduct(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async (quantity) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/product-details/${id}` } });
      return;
    }
    try {
      await userCartServices.addToCart({ product_id: product.id, quantity });
      message.success("Đã thêm vào giỏ hàng!");
      await refreshCart();
    } catch {
      message.error("Thêm vào giỏ hàng thất bại!");
    }
  };

  const handleBuyNow = (quantity) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/product-details/${id}` } });
      return;
    }
    // Đi thẳng checkout với sản phẩm này, không qua giỏ hàng
    const checkoutItem = {
      product_id: product.id,
      name: product.name,
      price: product.price,
      discount_percentage: product.discount_percentage,
      thumbnail_image: product.thumbnail_image,
      quantity,
    };
    localStorage.setItem("checkout_items", JSON.stringify([checkoutItem]));
    localStorage.setItem("checkout_source", "buy_now");
    navigate("/checkout");
  };

  return (
    <div className="public-product-detail-page">
      <ProductDetailContent
        product={product}
        loading={loading}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
};

export default ProductDetailUser;
