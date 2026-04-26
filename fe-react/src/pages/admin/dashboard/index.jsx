import { useEffect, useState } from "react";
import { Spin, Alert, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { adminDashboardServices } from "../../../api";
import RevenueChart from "./RevenueChart";
import OrderStatusChart from "./OrderStatusChart";
import { FAKE_DATA } from "./fakeData";
import "./index.scss";
import TopProductsTable from "./topProduct";
import SummaryCards from "./summaryCard";

// ── Đặt USE_FAKE = false khi BE sẵn sàng ──────────────────────
const USE_FAKE = true;

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_FAKE) {
        // Giả lập độ trễ mạng
        await new Promise((r) => setTimeout(r, 600));
        setData(FAKE_DATA);
      } else {
        const res = await adminDashboardServices.getDashboard();
        setData(res);
      }
    } catch (err) {
      setError(
        err?.message || "Không thể tải dữ liệu dashboard. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard__header">
        <div>
          <h1 className="admin-dashboard__title">Dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Tổng quan hệ thống bán hàng
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchData}
          loading={loading}
          className="admin-dashboard__reload"
        >
          Làm mới
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      {/* Content */}
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        {data && (
          <>
            {/* Cards tổng quan */}
            <SummaryCards data={data} />

            {/* Charts row 1: Revenue (2/3) + Order Status (1/3) */}
            <div className="admin-dashboard__charts-row">
              <div className="admin-dashboard__chart-main">
                <RevenueChart data={data.revenue_by_month} />
              </div>
              <div className="admin-dashboard__chart-side">
                <OrderStatusChart data={data.orders_by_status} />
              </div>
            </div>

            {/* Charts row 2: Top products full width */}
            <div className="admin-dashboard__charts-row">
              <div className="admin-dashboard__chart-full">
                <TopProductsTable data={data.top_selling_products} />
              </div>
            </div>
          </>
        )}
      </Spin>
    </div>
  );
};

export default AdminDashboard;
