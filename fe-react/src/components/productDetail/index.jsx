import { useEffect, useState } from "react";
import { Button, Flex, InputNumber, Spin, Tag } from "antd";
import { ShoppingCartOutlined, ThunderboltOutlined } from "@ant-design/icons";
import "./index.scss";

const formatVND = (v) => `${Number(v).toLocaleString("vi-VN")}₫`;

const ProductDetailContent = ({
  product,
  loading = false,
  actions,
  onAddToCart,
  onBuyNow,
}) => {
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setMainImage(product.thumbnail_image || product.images?.[0] || "");
    }
  }, [product]);
  if (!product) return null;

  const finalPrice =
    Number(product.price) *
    (1 - Number(product.discount_percentage || 0) / 100);

  const images = [
    ...(product.thumbnail_image ? [product.thumbnail_image] : []),
    ...(product.images || []).filter((img) => img !== product.thumbnail_image),
  ];

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => q + 1);

  const hasActions = onAddToCart || onBuyNow || actions;

  return (
    <Spin tip="Đang tải..." size="large" spinning={loading}>
      <div className="pd-wrapper">
        <div className="pd-page">
          {/* ── LEFT: Images ── */}
          <div className="pd-left">
            <div className="pd-main-image">
              <img src={mainImage} alt={product.name} draggable={false} />
            </div>
            {images.length > 1 && (
              <div className="pd-image-list">
                {images.map((img) => (
                  <img
                    key={img}
                    src={img}
                    className={`pd-thumb${mainImage === img ? " active" : ""}`}
                    onClick={() => setMainImage(img)}
                    alt="thumb"
                    draggable={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="pd-right">
            <h2 className="pd-name">{product.name}</h2>

            {product.description && (
              <p className="pd-description">{product.description}</p>
            )}

            <div className="pd-meta">
              {product.brand && (
                <span className="pd-meta__item">
                  Thương hiệu: <strong>{product.brand}</strong>
                </span>
              )}
              {product.category_name && (
                <Tag color="blue" className="pd-meta__item">
                  {product.category_name}
                </Tag>
              )}
            </div>

            {/* Price */}
            <div className="pd-price-box">
              <span className="pd-price-final">{formatVND(finalPrice)}</span>
              {product.discount_percentage > 0 && (
                <span className="pd-price-original">
                  {formatVND(product.price)}
                </span>
              )}
              {product.discount_percentage > 0 && (
                <Tag color="red" className="pd-discount-tag">
                  -{product.discount_percentage}%
                </Tag>
              )}
            </div>

            {/* Stock */}
            <p className="pd-stock">
              Kho: <strong>{product.stock}</strong>
            </p>

            {/* Quantity — only show when there are actions */}
            {hasActions && (
              <div className="pd-quantity-box">
                <span className="pd-quantity-label">Số lượng:</span>
                <Flex align="center" gap={8}>
                  <Button size="small" onClick={decrease}>
                    −
                  </Button>
                  <InputNumber
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(v) => setQuantity(v || 1)}
                    className="pd-quantity-input"
                    controls={false}
                  />
                  <Button size="small" onClick={increase}>
                    +
                  </Button>
                </Flex>
              </div>
            )}

            {/* Actions slot */}
            {actions && <div className="pd-actions">{actions}</div>}

            {/* Built-in action buttons (user mode) */}
            {(onAddToCart || onBuyNow) && (
              <div className="pd-actions">
                {onAddToCart && (
                  <Button
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    className="pd-btn-add"
                    onClick={() => onAddToCart(quantity)}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                )}
                {onBuyNow && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<ThunderboltOutlined />}
                    className="pd-btn-buy"
                    onClick={() => onBuyNow(quantity)}
                    danger
                  >
                    Mua ngay
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default ProductDetailContent;
