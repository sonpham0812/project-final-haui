import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Modal, Spin, message } from "antd";
import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { userOrderServices } from "../../../api";
import OrderDetailContent from "../../../components/orderDetail";
import "./index.scss";

const UserOrderDetailPage = () => {
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

  const cancelAction = order.status === "PENDING" && (
    <Button
      danger
      size="large"
      loading={cancelling}
      onClick={handleCancel}
      className="order-detail__cancel-btn"
    >
      Hủy đơn hàng
    </Button>
  );

  return (
    <div className="order-detail-page">
      <OrderDetailContent order={order} actions={cancelAction} />
    </div>
  );
};

export default UserOrderDetailPage;
