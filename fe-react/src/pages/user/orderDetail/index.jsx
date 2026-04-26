import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Divider, Modal, Spin, Tag, message } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  TruckOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { userOrderServices } from "../../../api";
import "./index.scss";

const STATUS_META = {
  PENDING: {
    color: "warning",
    text: "Chờ xác nhận",
    icon: <ClockCircleOutlined style={{ color: "#faad14" }} />,
  },
  CONFIRMED: {
    color: "processing",
    text: "Chờ giao hàng",
    icon: <TruckOutlined style={{ color: "#1890ff" }} />,
  },
  COMPLETED: {
    color: "success",
    text: "Đã giao hàng",
    icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
  },
  CANCELED: {
    color: "error",
    text: "Đã hủy",
    icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
  },
};

const STATUS_STEPS = ["PENDING", "CONFIRMED", "COMPLETED"];

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price,
  );

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimeLabel = (status) => {
  switch (status) {
    case "PENDING":
      return { label: "Thời gian đặt hàng", field: "created_at" };
    case "CONFIRMED":
      return { label: "Thời gian xác nhận", field: "updated_at" };
    case "COMPLETED":
      return { label: "Thời gian hoàn thành", field: "updated_at" };
    case "CANCELED":
      return { label: "Thời gian hủy đơn", field: "updated_at" };
    default:
      return { label: "Thời gian", field: "created_at" };
  }
};

// ─── Progress steps (only for non-cancelled) ─────────────────────
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

// ─── Main OrderDetail Page ────────────────────────────────────────
const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await userOrderServices.getOrderById(id);
      setOrder(data);
    } catch {
      message.error("Không tìm thấy đơn hàng");
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = () => {
    Modal.confirm({
      title: "Xác nhận hủy đơn",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn hủy đơn hàng{" "}
            <strong>#{order?.order_code}</strong> không?
          </p>
          <p style={{ color: "#666", fontSize: 13 }}>
            Hành động này không thể hoàn tác.
          </p>
        </div>
      ),
      okText: "Hủy đơn hàng",
      okType: "danger",
      cancelText: "Giữ lại",
      centered: true,
      onOk: async () => {
        setCancelling(true);
        try {
          await userOrderServices.cancelOrder(id);
          message.success("Đã hủy đơn hàng thành công");
          navigate("/profile?tab=CANCELED");
        } catch (err) {
          message.error(
            err?.response?.data?.message || "Hủy đơn hàng thất bại",
          );
        } finally {
          setCancelling(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="order-detail-loading">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!order) return null;

  const meta = STATUS_META[order.status] || {};
  const timeInfo = getTimeLabel(order.status);
  const subtotal = (order.items || []).reduce(
    (s, i) => s + i.price * i.quantity,
    0,
  );

  return (
    <div className="order-detail-page">
      {/* ── Top bar ── */}
      <div className="order-detail__topbar">
        <button className="order-detail__back" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Quay lại
        </button>
        <span className="order-detail__topbar-title">Chi tiết đơn hàng</span>
        <div />
      </div>

      <div className="order-detail__body">
        {/* ── Order status card ── */}
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
            <span className="order-detail__info-label">
              Thời gian đặt hàng:
            </span>
            <span className="order-detail__info-value">
              {formatDate(order.created_at)}
            </span>
          </div>
          {order.status !== "PENDING" && (
            <div className="order-detail__info-row">
              <CalendarOutlined className="order-detail__info-icon" />
              <span className="order-detail__info-label">
                {timeInfo.label}:
              </span>
              <span className="order-detail__info-value">
                {formatDate(order[timeInfo.field])}
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
                  src={item.thumbnail_image}
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

        {/* ── Price summary ── */}
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

        {/* ── Actions ── */}
        {order.status === "PENDING" && (
          <div className="order-detail__actions">
            <Button
              danger
              size="large"
              loading={cancelling}
              onClick={handleCancel}
              className="order-detail__cancel-btn"
            >
              Hủy đơn hàng
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
