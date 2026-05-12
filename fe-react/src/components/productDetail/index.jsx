import { useEffect, useState } from "react";
import {
  Button,
  Flex,
  InputNumber,
  Spin,
  Tag,
  Rate,
  List,
  Typography,
  Skeleton,
} from "antd";
import { ShoppingCartOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { userReviewServices } from "../../api";
import "./index.scss";

const formatVND = (v) => `${Number(v).toLocaleString("vi-VN")}₫`;

const FILTER_OPTIONS = [
  { label: "Tất Cả", value: 0 },
  { label: "5 Sao", value: 5 },
  { label: "4 Sao", value: 4 },
  { label: "3 Sao", value: 3 },
  { label: "2 Sao", value: 2 },
  { label: "1 Sao", value: 1 },
];

const ProductDetailContent = ({
  product,
  loading = false,
  actions,
  onAddToCart,
  onBuyNow,
}) => {
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState({
    average_rating: 0,
    review_count: 0,
  });
  const [filterStar, setFilterStar] = useState(0);
  const [starCounts, setStarCounts] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  const fetchReviews = (productId, star) => {
    setReviewLoading(true);
    userReviewServices
      .getProductReviews(productId, { rating: star || undefined })
      .then((res) => {
        const list = res.reviews || [];
        setReviews(list);
        if (!star) {
          setReviewStats({
            average_rating: res.average_rating || 0,
            review_count: res.review_count || 0,
          });
          // Tính counts theo từng sao từ danh sách đầy đủ, lưu riêng
          const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          list.forEach((r) => {
            if (counts[r.rating] !== undefined) counts[r.rating]++;
          });
          setStarCounts(counts);
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setReviewLoading(false));
  };

  useEffect(() => {
    if (product) {
      setMainImage(product.thumbnail_image || product.images?.[0] || "");
      setReviewStats({
        average_rating: product.average_rating || 0,
        review_count: product.review_count || 0,
      });
      setFilterStar(0);
      fetchReviews(product.id, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const countByStar = (star) => starCounts[star] ?? 0;

  const handleFilterStar = (star) => {
    setFilterStar(star);
    fetchReviews(product.id, star);
  };

  return (
    <Spin tip="Đang tải..." size="large" spinning={loading}>
      <div className="pd-wrapper">
        {/* ── TOP CARD: Image + Info ── */}
        <div className="pd-page">
          {/* LEFT: Images */}
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
                    alt="ảnh thu nhỏ"
                    draggable={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info */}
          <div className="pd-right">
            <h2 className="pd-name">{product.name}</h2>

            {/* Rating summary — right below name */}
            <div className="pd-rating-inline">
              <span className="pd-rating-score">
                {Number(reviewStats.average_rating).toFixed(1)}
              </span>
              <Rate
                disabled
                allowHalf
                value={Number(reviewStats.average_rating)}
                style={{ fontSize: 15 }}
              />
              <span className="pd-rating-count">
                {reviewStats.review_count} Đánh Giá
              </span>
            </div>

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

            {/* Quantity */}
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

            {/* Built-in action buttons */}
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

        {/* ── REVIEW SECTION ── */}
        <div className="pd-review-section">
          <h3 className="pd-review-section__title">ĐÁNH GIÁ SẢN PHẨM</h3>

          {/* Overview box */}
          <div className="pd-review-overview">
            <div className="pd-review-overview__score">
              <span className="pd-review-overview__number">
                {Number(reviewStats.average_rating).toFixed(1)}
              </span>
              <span className="pd-review-overview__max"> trên 5</span>
              <Rate
                disabled
                allowHalf
                value={Number(reviewStats.average_rating)}
                style={{ fontSize: 22, color: "#ee4d2d" }}
              />
            </div>

            {/* Filter tabs */}
            <div className="pd-review-filters">
              {FILTER_OPTIONS.map((opt) => {
                const count =
                  opt.value === 0
                    ? reviewStats.review_count
                    : countByStar(opt.value);
                return (
                  <button
                    key={opt.value}
                    className={`pd-review-filter-btn${filterStar === opt.value ? " active" : ""}`}
                    onClick={() => handleFilterStar(opt.value)}
                    type="button"
                  >
                    {opt.label}
                    {opt.value !== 0 && ` (${count})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review list */}
          {reviewLoading ? (
            <Skeleton
              active
              paragraph={{ rows: 4 }}
              style={{ padding: "16px 0" }}
            />
          ) : (
            <List
              dataSource={reviews}
              locale={{ emptyText: "Chưa có đánh giá nào" }}
              renderItem={(item) => (
                <List.Item className="pd-review-item">
                  <div className="pd-review-item__avatar">
                    {(item.user_name || "A")[0].toUpperCase()}
                  </div>
                  <div className="pd-review-item__body">
                    <Typography.Text strong className="pd-review-item__name">
                      {item.user_name}
                    </Typography.Text>
                    <Rate
                      disabled
                      value={item.rating}
                      style={{ fontSize: 13, color: "#ee4d2d" }}
                    />
                    <Typography.Text
                      type="secondary"
                      className="pd-review-item__date"
                    >
                      {item.created_at?.slice(0, 10)}
                    </Typography.Text>
                    <Typography.Paragraph className="pd-review-item__comment">
                      {item.comment}
                    </Typography.Paragraph>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </Spin>
  );
};

export default ProductDetailContent;
