import { Dropdown, Flex } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  FacebookFilled,
  InstagramFilled,
  QuestionCircleFilled,
  UserOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
import useAuth from "../../../hooks/useAuth";

export default function HeaderTop() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Tài Khoản Của Tôi",
      onClick: () => navigate("/profile"),
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "Đơn Mua",
      onClick: () => navigate("/orders?tab=PENDING"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng Xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Flex justify="space-between" align="center">
      <Flex gap="middle">
        <Link to="/home">Kênh Người Bán</Link>
        <Link to="/home">Tải Ứng Dụng</Link>
        <Flex gap="4px" align="center">
          <Link to="/home">Theo dõi chúng tôi trên</Link>
          <a href="/">
            <FacebookFilled />
          </a>
          <a href="/">
            <InstagramFilled />
          </a>
        </Flex>
      </Flex>

      <Flex gap="middle" align="center">
        <Flex gap="4px" align="center">
          <a href="/">
            <QuestionCircleFilled />
          </a>
          <Link to="/home">Hỗ Trợ</Link>
        </Flex>

        {isAuthenticated ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["hover"]}
          >
            <Flex
              align="center"
              gap={6}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              <UserOutlined style={{ color: "#ffffff" }} />
              <span style={{ color: "#ffffff" }}>
                {user?.name || user?.email || "Tài khoản"}
              </span>
              <DownOutlined style={{ fontSize: 11, color: "#ffffff" }} />
            </Flex>
          </Dropdown>
        ) : (
          <Flex gap="middle">
            <Link to="/register">Đăng Ký</Link>
            <Link to="/login">Đăng Nhập</Link>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
