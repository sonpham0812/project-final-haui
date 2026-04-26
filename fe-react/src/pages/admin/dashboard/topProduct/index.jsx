import { Card, Table, Tag, Progress, Avatar } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import "./index.scss";

const formatPrice = (v) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)}M ₫`
    : `${v.toLocaleString("vi-VN")} ₫`;

const TopProductsTable = ({ data = [] }) => {
  const totalSold = data.reduce((s, r) => s + r.total_sold, 0) || 1;
  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0) || 1;

  const columns = [
    {
      title: "#",
      key: "rank",
      width: 42,
      render: (_, __, idx) => (
        <span className={`top-rank top-rank--${idx < 3 ? idx + 1 : "rest"}`}>
          {idx + 1}
        </span>
      ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <div className="top-product-info">
          <Avatar
            src={record.thumbnail_image || undefined}
            icon={!record.thumbnail_image && <ShopOutlined />}
            size={44}
            shape="square"
            className="top-product-info__img"
          />
          <div>
            <p className="top-product-info__name">{record.name}</p>
            {record.category_name && (
              <Tag color="blue" className="top-product-info__cat">
                {record.category_name}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Đã bán",
      dataIndex: "total_sold",
      key: "total_sold",
      align: "center",
      width: 90,
      render: (v) => (
        <span className="top-cell-num">{v.toLocaleString("vi-VN")}</span>
      ),
    },
    {
      title: "% Đơn",
      key: "order_pct",
      align: "center",
      width: 80,
      render: (_, record) => (
        <span className="top-cell-pct">
          {((record.total_sold / totalSold) * 100).toFixed(0)}%
        </span>
      ),
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      width: 130,
      render: (v) => <span className="top-cell-revenue">{formatPrice(v)}</span>,
    },
    {
      title: "% Doanh thu",
      key: "revenue_pct",
      width: 180,
      render: (_, record) => {
        const pct = Math.round((record.revenue / totalRevenue) * 100);
        return (
          <div className="top-revenue-bar">
            <Progress
              percent={pct}
              size="small"
              strokeColor="#5b8dee"
              trailColor="#e8ecf7"
              format={(p) => `${p}%`}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card
      title="📊 Top sản phẩm bán chạy"
      className="dashboard-chart-card top-products-card"
      bordered={false}
    >
      <Table
        dataSource={data}
        columns={columns}
        rowKey="product_id"
        pagination={false}
        size="middle"
        className="top-products-table"
      />
    </Card>
  );
};

export default TopProductsTable;
