import { Card } from "antd";
import { Column } from "@ant-design/charts";

const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split("-");
  return `${month}/${year.slice(2)}`;
};

const RevenueChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    month: formatMonth(item.month),
    revenue: item.revenue,
  }));

  const config = {
    data: chartData,
    xField: "month",
    yField: "revenue",
    colorField: "month",
    label: {
      text: (d) => {
        const v = d.revenue;
        return v >= 1_000_000
          ? `${(v / 1_000_000).toFixed(1)}M`
          : `${(v / 1000).toFixed(0)}K`;
      },
      position: "outside",
      style: { fill: "#555", fontSize: 11 },
    },
    axis: {
      y: {
        labelFormatter: (v) =>
          v >= 1_000_000
            ? `${(v / 1_000_000).toFixed(0)}M`
            : `${(v / 1000).toFixed(0)}K`,
      },
    },
    tooltip: {
      items: [
        {
          field: "revenue",
          name: "Doanh thu",
          valueFormatter: (v) => `${Number(v).toLocaleString("vi-VN")} ₫`,
        },
      ],
    },
    style: { radiusTopLeft: 6, radiusTopRight: 6 },
    legend: false,
    height: 280,
  };

  return (
    <Card
      title="📈 Doanh thu theo tháng"
      className="dashboard-chart-card"
      bordered={false}
    >
      <Column {...config} />
    </Card>
  );
};

export default RevenueChart;
