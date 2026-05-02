import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { adminProductServices } from "../../../../api";
import ProductDetailContent from "../../../../components/productDetail";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminProductServices
      .getProductById(id)
      .then((res) => setProduct(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Admin view: no cart/buy actions
  return <ProductDetailContent product={product} loading={loading} />;
};

export default ProductDetail;
