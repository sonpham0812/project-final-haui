import { Avatar } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UserOutlined,
  ShoppingOutlined,
  EditOutlined,
} from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import "./index.scss";

const MENU = [
  {
    key: "profile",
    label: "Tài Khoản Của Tôi",
    icon: <UserOutlined />,
    path: "/profile",
    matchPath: "/profile",
  },
  {
    key: "orders",
    label: "Đơn Mua",
    icon: <ShoppingOutlined />,
    path: "/orders?tab=PENDING",
    matchPath: "/orders",
  },
];

const UserAccountLayout = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const avatarLetter =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const isActive = (item) => {
    const path = item.matchPath || item.path.split("?")[0];
    return location.pathname === path;
  };

  return (
    <div className="user-account-layout">
      <div className="user-account-layout__inner">
        {/* ── Sidebar ── */}
        <aside className="user-account-sidebar">
          {/* User info */}
          <div className="user-account-sidebar__user">
            <Avatar
              size={48}
              style={{
                backgroundColor: "#ee4d2d",
                fontSize: 20,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {avatarLetter}
            </Avatar>
            <div className="user-account-sidebar__user-info">
              <p className="user-account-sidebar__username">
                {user?.name || "Người dùng"}
              </p>
              <button
                className="user-account-sidebar__edit"
                onClick={() => navigate("/profile")}
              >
                <EditOutlined /> Sửa Hồ Sơ
              </button>
            </div>
          </div>

          <div className="user-account-sidebar__divider" />

          {/* Menu */}
          <nav className="user-account-sidebar__nav">
            {MENU.map((item) => (
              <button
                key={item.key}
                className={`user-account-sidebar__nav-item${isActive(item) ? " active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="user-account-sidebar__nav-icon">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="user-account-layout__content">{children}</main>
      </div>
    </div>
  );
};

export default UserAccountLayout;
