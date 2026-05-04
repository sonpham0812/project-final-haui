import { useEffect, useState } from "react";
import {
  Avatar, Button, Input, Table, Tag, Select,
  Popconfirm, message, Pagination, Tooltip,
} from "antd";
import {
  LockOutlined, UnlockOutlined, ReloadOutlined, UserOutlined,
} from "@ant-design/icons";
import { adminUserServices } from "../../../../api";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;

const UserList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const fetchData = async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit: pageSize };
      if (statusFilter) params.status = statusFilter;
      const res = await adminUserServices.getAllUsers(params);
      setData(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleStatus = async (record) => {
    const newStatus = record.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    try {
      await adminUserServices.updateUserStatus(record.id, { status: newStatus });
      message.success(newStatus === "BLOCKED" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
      fetchData(page);
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "name",
      render: (name, record) => (
        <div className="user-list__user-cell">
          <Avatar
            size={40}
            src={record.avatar}
            icon={!record.avatar && <UserOutlined />}
            style={{ backgroundColor: "#ee4d2d", flexShrink: 0 }}
          >
            {!record.avatar && name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div className="user-list__user-info">
            <span className="user-list__name">{name}</span>
            <span className="user-list__email">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      width: 100,
      align: "center",
      render: (role) => (
        <Tag color={role === "ADMIN" ? "purple" : "blue"} style={{ borderRadius: 20 }}>
          {role}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 130,
      align: "center",
      render: (s) => (
        <Tag color={s === "ACTIVE" ? "success" : "error"} style={{ borderRadius: 20 }}>
          {s === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      width: 140,
      render: (d) => new Date(d).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => {
        const isBlocked = record.status === "BLOCKED";
        return (
          <Popconfirm
            title={isBlocked ? "Mở khóa tài khoản?" : "Khóa tài khoản?"}
            description={
              isBlocked
                ? "Người dùng sẽ có thể đăng nhập lại."
                : "Người dùng sẽ không thể đăng nhập."
            }
            okText="Xác nhận"
            okType={isBlocked ? "primary" : "danger"}
            cancelText="Hủy"
            onConfirm={() => toggleStatus(record)}
          >
            <Tooltip title={isBlocked ? "Mở khóa" : "Khóa tài khoản"}>
              <Button
                size="small"
                danger={!isBlocked}
                icon={isBlocked ? <UnlockOutlined /> : <LockOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div className="user-list-page">
      <div className="user-list__toolbar">
        <h2 className="user-list__title">Quản lý người dùng</h2>
        <div className="user-list__toolbar-right">
          <Select
            placeholder="Lọc trạng thái"
            allowClear
            style={{ width: 170 }}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
          >
            <Option value="ACTIVE">Hoạt động</Option>
            <Option value="BLOCKED">Đã khóa</Option>
          </Select>
          <Tooltip title="Làm mới">
            <Button icon={<ReloadOutlined />} onClick={() => fetchData(page)} />
          </Tooltip>
        </div>
      </div>

      <div className="user-list__card">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={false}
          size="middle"
        />
        <div className="user-list__pagination">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showTotal={(t) => `${t} người dùng`}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default UserList;
