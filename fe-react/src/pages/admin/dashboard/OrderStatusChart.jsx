import { Card } from "antd";
import { Pie } from "@ant-design/charts";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  canceled: "Đã huỷ",
};

const STATUS_COLORS = {
  "Chờ xác nhận": "#faad14",
  "Đã xác nhận": "#5b8dee",
  "Hoàn thành": "#27ae60",
  "Đã huỷ": "#ff4d4f",
};

const OrderStatusChart = ({ data = {} }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;

  const chartData = Object.entries(data).map(([key, value]) => ({
    type: STATUS_LABELS[key] || key,
    value,
  }));

  const config = {
    data: chartData,
    angleField: "value",
    colorField: "type",
    // v2: color là hàm nhận datum
    color: ({ type }) => STATUS_COLORS[type] || "#ccc",
    radius: 0.85,
    innerRadius: 0.5,
    label: {
      text: (d) => `${((d.value / total) * 100).toFixed(0)}%`,
      position: "inside",
      style: { fontSize: 13, fontWeight: 600, fill: "#fff" },
    },
    legend: { position: "bottom", layout: "horizontal" },
    tooltip: {
      items: [
        {
          field: "value",
          name: "Số đơn",
          valueFormatter: (v) => `${v} đơn`,
        },
      ],
    },
    // Thống kê ở giữa donut (v2 dùng annotations)
    annotations: [
      {
        type: "text",
        style: {
          text: `${total}`,
          x: "50%",
          y: "47%",
          textAlign: "center",
          fontSize: 22,
          fontWeight: 700,
          fill: "#1a1a2e",
        },
      },
      {
        type: "text",
        style: {
          text: "Tổng đơn",
          x: "50%",
          y: "57%",
          textAlign: "center",
          fontSize: 13,
          fill: "#888",
        },
      },
    ],
    height: 300,
  };

  return (
    <Card
      title="🥧 Đơn hàng theo trạng thái"
      className="dashboard-chart-card"
      bordered={false}
    >
      <Pie {...config} />
    </Card>
  );
};

export default OrderStatusChart;
