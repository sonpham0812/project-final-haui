import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Rate, Tag, InputNumber, Spin } from "antd";
import { ShoppingCartOutlined, HeartOutlined } from "@ant-design/icons";
import { productServices } from "../../api/products";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productServices.getProductDetails(id);
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );

  if (!product) return null;

  const finalPrice = (
    product.price *
    (1 - product.discountPercentage / 100)
  ).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT - IMAGE GALLERY */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {(product.images?.length
              ? product.images
              : [product.thumbnail]
            ).map((img, index) => (
              <div
                key={index}
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 border rounded-md cursor-pointer flex items-center justify-center
                  ${mainImage === img ? "border-blue-500" : "border-gray-200"}`}
              >
                <img
                  src={img}
                  alt=""
                  className="object-contain w-full h-full"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 border rounded-lg p-4 flex items-center justify-center">
            <img
              src={mainImage}
              alt={product.title}
              className="max-h-[420px] object-contain"
            />
          </div>
        </div>

        {/* RIGHT - PRODUCT INFO */}
        <div>
          <h1 className="text-left text-2xl font-semibold mb-2">
            {product.title}
          </h1>

          <div className="flex items-center gap-3 mb-3">
            <Rate allowHalf disabled value={product.rating} />
            <span className="text-gray-500 text-sm">{product.rating} / 5</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">
              ${finalPrice}
            </span>
            {product.discountPercentage > 0 && (
              <>
                <span className="line-through text-gray-400">
                  ${product.price}
                </span>
                <Tag color="orange">{product.discountPercentage}% OFF</Tag>
              </>
            )}
          </div>

          <p className="text-left text-green-600 font-medium mb-4">
            {product.availabilityStatus}
          </p>

          <p className="text-left text-gray-400 mb-6">{product.description}</p>

          {/* Extra Info */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Tag>{product.brand}</Tag>
            <Tag>{product.category}</Tag>
            <Tag>Stock: {product.stock}</Tag>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-medium">Quantity:</span>
            <InputNumber
              min={1}
              max={product.stock}
              value={qty}
              onChange={setQty}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Add to cart
            </Button>

            <Button size="large" icon={<HeartOutlined />}>
              Wishlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
