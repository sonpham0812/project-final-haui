import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Popconfirm, Space, Spin, message } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { adminOrderServices } from "../../../../api";
import OrderDetailContent from "../../../../components/orderDetail";
import "./index.scss";

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await adminOrderServices.getOrderById(id);
        setOrder(data);
      } catch {
        message.error("Không tìm thấy đơn hàng");
        navigate("/admin/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus, successMsg) => {
    setUpdating(true);
    try {
      await adminOrderServices.updateOrderStatus(id, { status: newStatus });
      message.success(successMsg);
      navigate("/admin/orders");
    } catch (err) {
      message.error(
        err?.response?.data?.message || err?.message || "Cập nhật thất bại",
      );
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-order-detail-loading">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!order) return null;

  // ── Action buttons tương ứng trạng thái ──
  const actionButtons = (
    <Space wrap size={10}>
      {order.status === "PENDING" && (
        <>
          <Popconfirm
            title="Xác nhận đơn hàng?"
            description="Chuyển sang trạng thái Chờ giao hàng."
            okText="Xác nhận"
            cancelText="Hủy"
            onConfirm={() =>
              handleStatusChange("CONFIRMED", "Đã xác nhận đơn hàng thành công")
            }
          >
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={updating}
              size="large"
            >
              Xác nhận đơn
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Hủy đơn hàng?"
            description="Hành động này không thể hoàn tác."
            okText="Hủy đơn"
            okType="danger"
            cancelText="Giữ lại"
            onConfirm={() => handleStatusChange("CANCELED", "Đã hủy đơn hàng")}
          >
            <Button
              danger
              icon={<CloseCircleOutlined />}
              loading={updating}
              size="large"
            >
              Hủy đơn
            </Button>
          </Popconfirm>
        </>
      )}

      {order.status === "CONFIRMED" && (
        <Popconfirm
          title="Hoàn thành đơn hàng?"
          description="Xác nhận đã giao hàng thành công."
          okText="Hoàn thành"
          cancelText="Hủy"
          onConfirm={() =>
            handleStatusChange("COMPLETED", "Đơn hàng đã hoàn thành")
          }
        >
          <Button
            type="primary"
            icon={<TruckOutlined />}
            loading={updating}
            size="large"
            style={{ background: "#52c41a", borderColor: "#52c41a" }}
          >
            Hoàn thành đơn
          </Button>
        </Popconfirm>
      )}
    </Space>
  );

  return (
    <div className="admin-order-detail-page">
      <OrderDetailContent order={order} actions={actionButtons} />
    </div>
  );
};

export default AdminOrderDetailPage;
