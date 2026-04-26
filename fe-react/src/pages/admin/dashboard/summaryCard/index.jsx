import { Col, Row } from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import "./index.scss";

const formatRevenue = (value) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M ₫`;
  }
  return `${value.toLocaleString("vi-VN")} ₫`;
};

const CARDS = [
  {
    key: "orders",
    label: "Tổng đơn hàng",
    color: "#5b8dee",
    bg: "#eef3ff",
    icon: <ShoppingCartOutlined />,
    field: "total_orders",
    suffix: "đơn",
    formatter: (v) => v?.toLocaleString("vi-VN"),
  },
  {
    key: "revenue",
    label: "Tổng doanh thu",
    color: "#27ae60",
    bg: "#eafaf1",
    icon: <DollarOutlined />,
    field: "total_revenue",
    formatter: formatRevenue,
  },
  {
    key: "users",
    label: "Tổng người dùng",
    color: "#e67e22",
    bg: "#fef5ec",
    icon: <UserOutlined />,
    field: "total_users",
    suffix: "người",
    formatter: (v) => v?.toLocaleString("vi-VN"),
  },
  {
    key: "products",
    label: "Tổng sản phẩm",
    color: "#8e44ad",
    bg: "#f5eeff",
    icon: <AppstoreOutlined />,
    field: "total_products",
    suffix: "sản phẩm",
    formatter: (v) => v?.toLocaleString("vi-VN"),
  },
];

const SummaryCards = ({ data }) => {
  return (
    <Row gutter={[20, 20]} className="summary-cards">
      {CARDS.map((card) => {
        const value = data?.[card.field] ?? 0;
        return (
          <Col key={card.key} xs={24} sm={12} lg={6}>
            <div
              className="summary-card"
              style={{ "--card-color": card.color, "--card-bg": card.bg }}
            >
              <div className="summary-card__icon">{card.icon}</div>
              <div className="summary-card__body">
                <p className="summary-card__label">{card.label}</p>
                <p className="summary-card__value">{card.formatter(value)}</p>
                <p className="summary-card__trend">
                  <ArrowUpOutlined /> <span>+12% so với tháng trước</span>
                </p>
              </div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

export default SummaryCards;
