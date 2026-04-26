import { useEffect, useState } from "react";
import {
  Button,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminOrderServices } from "../../../../api";
import "./index.scss";

const { Option } = Select;

const STATUS_META = {
  PENDING: { color: "warning", text: "Chờ xác nhận" },
  CONFIRMED: { color: "processing", text: "Chờ giao hàng" },
  COMPLETED: { color: "success", text: "Đã giao hàng" },
  CANCELED: { color: "error", text: "Đã hủy" },
};

const formatPrice = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v,
  );

const AdminOrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(undefined);

  const fetchOrders = async (p = page, status = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: pageSize };
      if (status) params.status = status;
      const res = await adminOrderServices.getAllOrders(params);
      setOrders(res.data || []);
      setTotal(res.total || 0);
    } catch {
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await adminOrderServices.updateOrderStatus(orderId, {
        status: newStatus,
      });
      message.success(`Cập nhật trạng thái thành công`);
      fetchOrders(page, statusFilter);
    } catch (err) {
      message.error(err?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const columns = [
    {
      title: "Mã vận đơn",
      dataIndex: "order_code",
      width: 130,
      render: (code, record) => (
        <Button
          type="link"
          style={{ padding: 0, fontWeight: 600 }}
          onClick={() => navigate(`/admin/orders/${record.id}`)}
        >
          #{code}
        </Button>
      ),
    },
    {
      title: "Người đặt",
      dataIndex: "user_email",
      width: 180,
      render: (email, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {record.user_name || "—"}
          </div>
          <div style={{ fontSize: 12, color: "#888" }}>{email}</div>
        </div>
      ),
    },
    {
      title: "Thông tin nhận hàng",
      width: 220,
      render: (_, record) => (
        <div style={{ fontSize: 13 }}>
          <div>
            <b>{record.name}</b>
          </div>
          <div style={{ color: "#555" }}>{record.phone}</div>
          <div style={{ color: "#888", fontSize: 12 }}>{record.address}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      render: (status) => {
        const m = STATUS_META[status] || {};
        return (
          <Tag
            color={m.color}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {m.text}
          </Tag>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      width: 130,
      align: "right",
      render: (v) => (
        <span style={{ color: "#ee4d2d", fontWeight: 700 }}>
          {formatPrice(v)}
        </span>
      ),
    },
    {
      title: "Thao tác",
      width: 200,
      align: "center",
      render: (_, record) => {
        const busy = updatingId === record.id;
        return (
          <Space wrap size={6}>
            {record.status === "PENDING" && (
              <>
                <Popconfirm
                  title="Xác nhận đơn hàng?"
                  description="Chuyển sang trạng thái Chờ giao hàng."
                  okText="Xác nhận"
                  cancelText="Hủy"
                  onConfirm={() => handleStatusChange(record.id, "CONFIRMED")}
                >
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={busy}
                  >
                    Xác nhận
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Hủy đơn hàng?"
                  description="Hành động này không thể hoàn tác."
                  okText="Hủy đơn"
                  okType="danger"
                  cancelText="Giữ lại"
                  onConfirm={() => handleStatusChange(record.id, "CANCELED")}
                >
                  <Button
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                    loading={busy}
                  >
                    Hủy
                  </Button>
                </Popconfirm>
              </>
            )}
            {record.status === "CONFIRMED" && (
              <Popconfirm
                title="Hoàn thành đơn hàng?"
                description="Xác nhận đã giao hàng thành công."
                okText="Hoàn thành"
                cancelText="Hủy"
                onConfirm={() => handleStatusChange(record.id, "COMPLETED")}
              >
                <Button
                  size="small"
                  type="primary"
                  icon={<TruckOutlined />}
                  loading={busy}
                  style={{ background: "#52c41a", borderColor: "#52c41a" }}
                >
                  Hoàn thành
                </Button>
              </Popconfirm>
            )}
            {(record.status === "COMPLETED" ||
              record.status === "CANCELED") && (
              <span style={{ color: "#aaa", fontSize: 13 }}>—</span>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="admin-order-list">
      <div className="admin-order-list__header">
        <h2 className="admin-order-list__title">Danh sách đơn hàng</h2>
        <Space>
          <Select
            placeholder="Tất cả trạng thái"
            allowClear
            style={{ width: 180 }}
            value={statusFilter}
            onChange={handleFilterChange}
          >
            {Object.entries(STATUS_META).map(([key, { text, color }]) => (
              <Option key={key} value={key}>
                <Tag color={color} style={{ borderRadius: 20 }}>
                  {text}
                </Tag>
              </Option>
            ))}
          </Select>
          <Tooltip title="Làm mới">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchOrders(page, statusFilter)}
            />
          </Tooltip>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        scroll={{ x: 900 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: false,
          showTotal: (t) => `Tổng ${t} đơn hàng`,
          onChange: (p) => setPage(p),
        }}
        className="admin-order-list__table"
      />
    </div>
  );
};

export default AdminOrderList;
