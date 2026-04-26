import { Divider, Tag } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  TruckOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./index.scss";
import {
  STATUS_META,
  STATUS_STEPS,
  formatDate,
  formatPrice,
} from "../constant";

const getTimeLabel = (status) => {
  switch (status) {
    case "CONFIRMED":
      return { label: "Thời gian xác nhận", field: "updated_at" };
    case "COMPLETED":
      return { label: "Thời gian hoàn thành", field: "updated_at" };
    case "CANCELED":
      return { label: "Thời gian hủy đơn", field: "updated_at" };
    default:
      return null;
  }
};

// ─── Progress steps ───────────────────────────────────────────────
const OrderProgress = ({ status }) => {
  if (status === "CANCELED") return null;
  const currentIndex = STATUS_STEPS.indexOf(status);
  const stepLabels = ["Đặt hàng", "Xác nhận", "Giao hàng"];

  return (
    <div className="order-progress">
      {STATUS_STEPS.map((s, idx) => (
        <div
          key={s}
          className={`order-progress__step ${idx <= currentIndex ? "active" : ""}`}
        >
          <div className="order-progress__dot">
            {idx < currentIndex ? "✓" : idx + 1}
          </div>
          <span className="order-progress__label">{stepLabels[idx]}</span>
          {idx < STATUS_STEPS.length - 1 && (
            <div
              className={`order-progress__line ${idx < currentIndex ? "active" : ""}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Main shared component ────────────────────────────────────────
// Props:
//   order   — order object with items[]
//   actions — optional ReactNode rendered at bottom (e.g. cancel button)
const OrderDetailContent = ({ order, actions }) => {
  const meta = STATUS_META[order.status] || {};
  const extraTime = getTimeLabel(order.status);
  const subtotal = (order.items || []).reduce(
    (s, i) => s + i.price * i.quantity,
    0,
  );

  return (
    <div className="order-detail__body">
      {/* ── Status card ── */}
      <div className="order-detail__card order-detail__status-card">
        <div className="order-detail__status-row">
          <span className="order-detail__code">
            Mã đơn: <strong>#{order.order_code}</strong>
          </span>
          <Tag
            color={meta.color}
            style={{ fontSize: 13, padding: "3px 12px", borderRadius: 20 }}
          >
            {meta.icon} {meta.text}
          </Tag>
        </div>
        <OrderProgress status={order.status} />
      </div>

      {/* ── Time info ── */}
      <div className="order-detail__card order-detail__time-card">
        <div className="order-detail__info-row">
          <CalendarOutlined className="order-detail__info-icon" />
          <span className="order-detail__info-label">Thời gian đặt hàng:</span>
          <span className="order-detail__info-value">
            {formatDate(order.created_at)}
          </span>
        </div>
        {extraTime && (
          <div className="order-detail__info-row">
            <CalendarOutlined className="order-detail__info-icon" />
            <span className="order-detail__info-label">{extraTime.label}:</span>
            <span className="order-detail__info-value">
              {formatDate(order[extraTime.field])}
            </span>
          </div>
        )}
      </div>

      {/* ── Recipient info ── */}
      <div className="order-detail__card">
        <h4 className="order-detail__card-title">Thông tin giao hàng</h4>
        <div className="order-detail__info-row">
          <UserOutlined className="order-detail__info-icon" />
          <span className="order-detail__info-label">Người nhận:</span>
          <span className="order-detail__info-value">{order.name}</span>
        </div>
        <div className="order-detail__info-row">
          <PhoneOutlined className="order-detail__info-icon" />
          <span className="order-detail__info-label">Số điện thoại:</span>
          <span className="order-detail__info-value">{order.phone}</span>
        </div>
        <div className="order-detail__info-row">
          <EnvironmentOutlined className="order-detail__info-icon" />
          <span className="order-detail__info-label">Địa chỉ:</span>
          <span className="order-detail__info-value">{order.address}</span>
        </div>
      </div>

      {/* ── Products ── */}
      <div className="order-detail__card">
        <h4 className="order-detail__card-title">Sản phẩm đã đặt</h4>
        <div className="order-detail__items">
          {(order.items || []).map((item) => (
            <div key={item.product_id} className="order-detail__item">
              <img
                src={item.thumbnail_image || "/placeholder.png"}
                alt={item.name}
                className="order-detail__item-img"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/100x100?text=No+Image";
                }}
              />
              <div className="order-detail__item-info">
                <p className="order-detail__item-name">{item.name}</p>
                <p className="order-detail__item-qty">
                  Số lượng: x{item.quantity}
                </p>
              </div>
              <div className="order-detail__item-price">
                <span className="order-detail__item-unit">
                  {formatPrice(item.price)}
                </span>
                <span className="order-detail__item-subtotal">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="order-detail__card order-detail__summary-card">
        <h4 className="order-detail__card-title">Tổng kết đơn hàng</h4>
        <div className="order-detail__summary-rows">
          <div className="order-detail__summary-row">
            <span>Tạm tính ({(order.items || []).length} sản phẩm)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="order-detail__summary-row">
            <span>Phí vận chuyển</span>
            <span>{formatPrice(order.shipping_fee || 0)}</span>
          </div>
          <Divider style={{ margin: "10px 0" }} />
          <div className="order-detail__summary-row order-detail__summary-total">
            <span>Tổng thanh toán</span>
            <span className="order-detail__total-amount">
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Slot for extra actions ── */}
      {actions && <div className="order-detail__actions">{actions}</div>}
    </div>
  );
};

export default OrderDetailContent;
