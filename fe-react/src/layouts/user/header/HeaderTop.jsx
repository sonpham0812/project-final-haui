import { Flex } from "antd";
import { Link } from "react-router-dom";
import {
  FacebookFilled,
  InstagramFilled,
  QuestionCircleFilled,
  LogoutOutlined,
} from "@ant-design/icons";
import useAuth from "../../../hooks/useAuth";

export default function HeaderTop() {
  const { isAuthenticated, user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/home";
  };

  return (
    <Flex
      justify="space-between"
      align="center"
      style={{ padding: "10px 20px" }}
    >
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

      <Flex gap="middle">
        <Flex gap="4px" align="center">
          <a href="/">
            <QuestionCircleFilled />
          </a>
          <Link to="/home">Hỗ Trợ</Link>
        </Flex>

        {isAuthenticated ? (
          <Flex gap="middle" align="center">
            <span>Xin chào, {user?.name || "Người dùng"}</span>
            <Link onClick={handleLogout} style={{ cursor: "pointer" }}>
              <LogoutOutlined /> Đăng Xuất
            </Link>
          </Flex>
        ) : (
          <>
            <Link to="/register">Đăng Ký</Link>
            <Link to="/login">Đăng Nhập</Link>
          </>
        )}
      </Flex>
    </Flex>
  );
}
