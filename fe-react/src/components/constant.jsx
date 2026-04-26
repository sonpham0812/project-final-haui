import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
export const STATUS_META = {
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

export const STATUS_STEPS = ["PENDING", "CONFIRMED", "COMPLETED"];

export const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price,
  );

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
