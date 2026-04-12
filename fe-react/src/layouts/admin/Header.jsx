import {
  BellFilled,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Input } from "antd";
import "./index.scss";
import { Link } from "react-router-dom";

export default function Header({ toggleSidebar, isCollapsed }) {
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/home";
  };

  return (
    <div className="admin-header py-m px-xxl">
      <div className="admin-header-inner">
        <div
          className={`admin-header-left ${isCollapsed ? "collapsed" : "expanded"} flex gap-s`}
        >
          <div className="icon-wrapper">
            <Button
              type="text"
              onClick={toggleSidebar}
              icon={
                isCollapsed ? (
                  <MenuUnfoldOutlined style={{ fontSize: 16 }} />
                ) : (
                  <MenuFoldOutlined style={{ fontSize: 16 }} />
                )
              }
              className="toggle-btn"
            />
          </div>
          <div className="logo-wrapper">
            {!isCollapsed && <span className="logo">Falcon</span>}
          </div>
          <Input.Search
            placeholder="Search anything..."
            allowClear
            enterButton
            className="search-box"
          />
        </div>
        <div className="admin-header-right">
          <BellFilled className="bell-icon" />
          <Avatar
            style={{ backgroundColor: "#87d068" }}
            icon={<UserOutlined />}
            className="avatar-btn"
          />
          <Link onClick={handleLogout} style={{ cursor: "pointer" }}>
            <LogoutOutlined /> Đăng Xuất
          </Link>
        </div>
      </div>
    </div>
  );
}
