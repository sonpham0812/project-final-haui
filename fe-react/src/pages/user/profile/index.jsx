import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Avatar,
  Badge,
  Empty,
  Pagination,
  Spin,
  Tabs,
  Tag,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LogoutOutlined,
  RightOutlined,
  ShoppingOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { userOrderServices } from "../../../api";
import useAuth from "../../../hooks/useAuth";
import "./index.scss";

const TABS = [
  {
    key: "PENDING",
    label: "Chờ xác nhận",
    icon: <ClockCircleOutlined />,
    color: "#faad14",
  },
  {
    key: "CONFIRMED",
    label: "Chờ giao hàng",
    icon: <TruckOutlined />,
    color: "#1890ff",
  },
  {
    key: "COMPLETED",
    label: "Đã giao hàng",
    icon: <CheckCircleOutlined />,
    color: "#52c41a",
  },
  {
    key: "CANCELED",
    label: "Đã hủy",
    icon: <CloseCircleOutlined />,
    color: "#ff4d4f",
  },
];

const STATUS_TAG = {
  PENDING: { color: "warning", text: "Chờ xác nhận" },
  CONFIRMED: { color: "processing", text: "Chờ giao hàng" },
  COMPLETED: { color: "success", text: "Đã giao hàng" },
  CANCELED: { color: "error", text: "Đã hủy" },
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price,
  );

// ─── Single order card ────────────────────────────────────────────
const OrderCard = ({ order, onNavigate }) => {
  const [expanded, setExpanded] = useState(false);
  const items = order.items || [];
  const firstItem = items[0];
  const extraItems = items.slice(1);
  const hasMore = extraItems.length > 0;

  return (
    <div className="order-card" onClick={() => onNavigate(order.id)}>
      {/* Order header */}
      <div className="order-card__header">
        <span className="order-card__code">#{order.order_code}</span>
        <Tag color={STATUS_TAG[order.status]?.color}>
          {STATUS_TAG[order.status]?.text}
        </Tag>
      </div>

      {/* Items */}
      <div className="order-card__items">
        {firstItem && <OrderItemRow item={firstItem} />}
        {hasMore &&
          expanded &&
          extraItems.map((item) => (
            <OrderItemRow key={item.product_id} item={item} />
          ))}
        {hasMore && (
          <button
            className="order-card__expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded
              ? "Thu gọn ▲"
              : `Xem thêm ${extraItems.length} sản phẩm ▼`}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="order-card__footer">
        <span className="order-card__total-label">{items.length} sản phẩm</span>
        <span className="order-card__total">
          Tổng tiền: <strong>{formatPrice(order.total_amount)}</strong>
        </span>
        <span className="order-card__detail-link">
          Xem chi tiết <RightOutlined />
        </span>
      </div>
    </div>
  );
};

const OrderItemRow = ({ item }) => (
  <div className="order-item-row">
    <img
      src={item.thumbnail_image}
      alt={item.name}
      className="order-item-row__img"
      onError={(e) => {
        e.target.src = "https://via.placeholder.com/80x80?text=No+Image";
      }}
    />
    <div className="order-item-row__info">
      <p className="order-item-row__name">{item.name}</p>
      <p className="order-item-row__qty">x{item.quantity}</p>
    </div>
    <div className="order-item-row__price">
      <span className="order-item-row__unit">{formatPrice(item.price)}</span>
      <span className="order-item-row__subtotal">
        {formatPrice(item.price * item.quantity)}
      </span>
    </div>
  </div>
);

// ─── Tab content with pagination ─────────────────────────────────
const OrderTabContent = ({ status }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 5;

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    try {
      const res = await userOrderServices.getUserOrders({
        status,
        page: p,
        limit: PAGE_SIZE,
      });
      setOrders(res.data || []);
      setTotal(res.total || 0);
    } catch {
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handlePageChange = (p) => {
    setPage(p);
    fetchOrders(p);
  };

  if (loading)
    return (
      <div className="tab-loading">
        <Spin size="large" />
      </div>
    );

  if (orders.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span className="empty-text">Chưa có đơn hàng nào</span>}
        className="orders-empty"
      />
    );
  }

  return (
    <div className="orders-list">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onNavigate={(id) => navigate(`/order/${id}`)}
        />
      ))}
      {total > PAGE_SIZE && (
        <div className="orders-pagination">
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};

// ─── Main Profile Page ────────────────────────────────────────────
const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [counts, setCounts] = useState({
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELED: 0,
  });
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "PENDING",
  );

  const fetchCounts = async () => {
    try {
      const data = await userOrderServices.getOrderCounts();
      setCounts(data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync tab from URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && TABS.some((t) => t.key === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const avatarLetter =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const tabItems = TABS.map((t) => ({
    key: t.key,
    label: (
      <span className="tab-label">
        {t.icon}
        <span>{t.label}</span>
        {counts[t.key] > 0 && (
          <Badge
            count={counts[t.key]}
            size="small"
            style={{ backgroundColor: t.color }}
          />
        )}
      </span>
    ),
    children: <OrderTabContent status={t.key} />,
  }));

  console.log(user);

  return (
    <div className="profile-page">
      {/* ── Hero banner ── */}
      <div className="profile-hero">
        <div className="profile-hero__inner">
          {/* Back home */}
          <button
            className="profile-hero__back"
            onClick={() => navigate("/home")}
          >
            ← Về trang chủ
          </button>

          <div className="profile-hero__user">
            <Avatar
              size={80}
              style={{
                backgroundColor: "#f56a00",
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              {avatarLetter}
            </Avatar>
            <div className="profile-hero__info">
              <h2 className="profile-hero__name">
                {`Xin chào, ${user?.name || "Người dùng"}`}
              </h2>
              <p className="profile-hero__email">{user?.email}</p>
              <span className="profile-hero__badge">
                <ShoppingOutlined /> Thành viên
              </span>
            </div>
          </div>

          <button className="profile-hero__logout" onClick={handleLogout}>
            <LogoutOutlined /> Đăng xuất
          </button>
        </div>
      </div>

      {/* ── Order tabs ── */}
      <div className="profile-content">
        <h3 className="profile-content__title">Đơn hàng của tôi</h3>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          className="orders-tabs"
          size="large"
          tabBarGutter={0}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
